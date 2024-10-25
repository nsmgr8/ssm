import json
from contextlib import suppress
from datetime import timedelta

import numpy as np
from tqdm import tqdm
from websockets.sync import client as wsclient

from app_types import Grid, GridParams, IncludeFlags, RunParams, Storm
from consts import STORM_FOLDER

np.seterr(over="raise")

OMEGA = 7.292e-5

g = 9.81  # gravitational constant
EARTH_RADIUS = 6_371_220

Cf, Cd = 2.6e-3, 2.8e-3
RHO_AIR, RHO_OCEAN = 1.226, 1025

TIDE_PERIOD = 12.4 * 60 * 60


def rmse(a, b):
    return np.sqrt(np.mean((a - b) ** 2))


def progress_desc(include):
    if include.tide and include.surge:
        return "Both"
    elif include.surge:
        return "Surge"
    elif include.tide:
        return "Tide"

    return "None"


class EllipticSurgeModel:
    def run(
        self,
        *,
        include: IncludeFlags,
        position=0,
        ws=None,
    ):
        self.reset()

        storm_loc = []
        storm_locations = []
        self.name = progress_desc(include)

        for count in tqdm(range(self.n_steps), desc=self.name, position=position):
            seconds = count * self.dt

            self.update_elevation()
            self.apply_boundary_conditions(seconds, include.tide)
            self.interpolate_elevation()
            self.coastal_elevation()

            if include.surge:
                lng, lat = self.get_storm_location(seconds)
                storm_loc = tuple(np.rad2deg((lng, lat)))
                storm_locations.append(storm_loc)
                self.generate_wind_stress(lat, lng)

            self.update_velocity_x()
            self.update_velocity_y()
            self.update_vtrans()

            # self.store_peaks()
            self.store_test_values()

            self.zeta1 = self.zeta2.copy()
            self.v_tilde1 = self.v_tilde2.copy()

            # if (courant := get_max_courant()) > 1:
            #     print(f'Courant number is high: {courant} at step {i}')

            if count % 60 == 0 or count == self.n_steps - 1:
                self.store_zetas(seconds, storm_loc)
                self.notify(count)

        self.notify(self.n_steps)
        self.save_output(include)

    def store_zetas(self, seconds, storm_loc):
        data = []
        for i in range(self.m):
            for j in range(self.n):
                if self.grid[i][j] == 0:
                    continue
                data.append((i, j, self.zeta2[i, j]))
        self.zetas.append(
            {
                "time": seconds,
                "data": data,
                "storm_location": storm_loc,
            }
        )

    def notify(self, current):
        with suppress(ConnectionRefusedError):
            with wsclient.connect("ws://host.docker.internal:8000/ws") as ws:
                ws.send(
                    json.dumps(
                        dict(
                            name=self.name,
                            current=current,
                            total=self.n_steps,
                            storm=self.storm.name,
                            state="complete" if current == self.n_steps else "running",
                        )
                    )
                )

    def save_output(self, include):
        output_name_parts = ["{name}", "json"]
        if include.tide:
            output_name_parts.insert(1, "tide")
        if include.surge:
            output_name_parts.insert(1, "surge")
        output_name = ".".join(output_name_parts)

        def output_filename(name: str):
            return str(STORM_FOLDER / self.storm.name / output_name.format(name=name))

        output = {
            "dt": self.dt,
            "started_at": self.storm.track[0].time.isoformat(),
            "start_timestamp": self.storm.track[0].time.timestamp(),
            "tide": include.tide,
            "surge": include.surge,
            "storm": json.loads(self.storm.model_dump_json()),
            "grid_params": self.grid_params.model_dump(),
            "run_params": self.run_params.model_dump(),
            "coasts": self.test_zetas,
            "grid": self.grid,
        }
        with open(output_filename("coasts"), "w") as fh:
            output["coasts"] = self.test_zetas
            json.dump(output, fh)

        with open(output_filename("zetas"), "w") as fh:
            del output["coasts"]
            output["store_dt"] = self.dt * 60
            output["zetas"] = self.zetas
            json.dump(output, fh)

    def __init__(
        self,
        *,
        grid: Grid,
        storm: Storm,
        run_params: RunParams,
        grid_params: GridParams,
    ):
        self.m = grid_params.m
        self.n = grid_params.n

        self.grid_params = grid_params
        self.run_params = run_params
        self.grid = grid
        self.storm = storm

        self.origin = grid_params.origin
        self.alpha = grid_params.alpha
        self.beta = grid_params.beta
        self.tide_phase = run_params.tide_phase
        self.tide_amplitude = run_params.tide_amplitude

        self.dt = run_params.dt

        self.dr = grid_params.dr
        self.dr_double = 2 * self.dr

        self.dtheta = abs(self.beta - self.alpha) / (self.n - 1)
        self.dtheta_double = 2 * self.dtheta

        self.c = np.sqrt(1 / (1 - grid_params.e * grid_params.e))
        self.g_over_c = g / self.c

        self.r = np.asarray([i * self.dr for i in range(self.m)])
        self.theta = np.asarray([self.alpha + i * self.dtheta for i in range(self.n)])

        self.c_times_r = self.c * self.r
        self.cos_theta = np.cos(self.theta)
        self.sin_theta = np.sin(self.theta)

        rT = np.matrix(self.r).T
        self.r_cos_theta = rT * np.matrix(self.cos_theta)
        self.r_sin_theta = rT * np.matrix(self.sin_theta)

        self.r_2_dtheta = self.r * self.dtheta_double
        self.two_over_max_r = 2 / self.r[self.m - 1]

        dphai = self.dr / EARTH_RADIUS
        self.setup_coriolis_and_depth(dphai)

        self.v_max = storm.max_wind_speed
        self.r_max = storm.max_radius * 1_000  # km to metre

        total_seconds = (self.storm.track[-1].time - self.storm.track[0].time).total_seconds()
        self.n_steps = int(total_seconds / self.dt)

    def reset(self):
        # v -> either u or v
        self.v = np.zeros((self.m, self.n))

        # v_tilde -> u or v * (zeta + h)
        self.v_tilde1 = np.zeros((self.m, self.n))
        self.v_tilde2 = np.zeros((self.m, self.n))

        # v_trans ->
        #   U = r * (c * cos(theta) * u + sin(theta) * v)
        #   V = -c * sin(theta) * u + cost(theta) * v
        self.v_trans = np.zeros((self.m, self.n))

        # elevation
        self.zeta1 = np.zeros((self.m, self.n))
        self.zeta2 = np.zeros((self.m, self.n))

        # wind stress
        self.tx = np.zeros((self.m, self.n))
        self.ty = np.zeros((self.m, self.n))

        # peak values
        self.peaks = np.zeros((self.m, self.n))

        self.zetas = []
        self.test_zetas = []

    def apply_boundary_conditions(self, seconds, include_tide=True):
        for i in range(1, self.m - 2, 2):
            # west
            if self.grid[i][0] == 1:
                self.zeta2[i, 0] = -self.zeta2[i, 2] - 2 * np.sqrt(self.H[i, 1] / g) * self.v_trans[i, 1]
            # east
            if self.grid[i][-1] == 1:
                self.zeta2[i, -1] = -self.zeta2[i, -3] + 2 * np.sqrt(self.H[i, -2] / g) * self.v_trans[i, -2]

        # south
        if include_tide:
            arg = 2 * np.pi * seconds / TIDE_PERIOD + self.tide_phase
            tide = 4 * self.tide_amplitude * np.sin(arg)
        else:
            tide = 0

        for j in range(0, self.n, 2):
            self.zeta2[-1, j] = (
                -self.zeta2[-3, j] + self.two_over_max_r * np.sqrt(self.H[-2, j] / g) * self.v_trans[-2, j] + tide
            )
        # no north

    def generate_wind_stress(self, lat, lng):
        def get_ttheta(rr):
            r_rmax = self.r_max / rr if rr > self.r_max else (rr / self.r_max) ** 3
            vtheta = self.v_max * np.sqrt(abs(r_rmax))
            return Cd * RHO_AIR * vtheta * vtheta

        xc = EARTH_RADIUS * (self.origin.latitude - lat)
        yc = EARTH_RADIUS * (lng - self.origin.longitude) * np.cos(lat)

        for i in range(2, self.m - 1, 2):
            for j in range(2, self.n - 2, 2):
                xx = self.r_cos_theta[i, j] - xc
                yy = self.r_sin_theta[i, j] - yc
                rr = np.sqrt(xx * xx + yy * yy)
                if rr >= 10:
                    ttheta = get_ttheta(rr)
                    self.tx[i, j] = -ttheta * yy / rr
                else:
                    self.tx[i, j] = 0

        for i in range(1, self.m - 2, 2):
            for j in range(1, self.n - 1, 2):
                xx = self.r_cos_theta[i, j] - xc
                yy = self.r_sin_theta[i, j] - yc
                rr = np.sqrt(xx * xx + yy * yy)
                if rr >= 10:
                    ttheta = get_ttheta(rr)
                    self.ty[i, j] = ttheta * xx / rr
                else:
                    self.ty[i, j] = 0

    def update_elevation(self):
        for j in range(2, self.n - 2, 2):
            for i in range(1, self.m - 2, 2):
                if self.grid[i][j] != 1:
                    continue

                x1 = (self.zeta1[i - 1, j] + self.H[i - 1, j]) * self.v_trans[i - 1, j]
                x2 = (self.zeta1[i + 1, j] + self.H[i + 1, j]) * self.v_trans[i + 1, j]
                lx = (x2 - x1) / self.dr_double

                y1 = (self.zeta1[i, j - 1] + self.H[i, j - 1]) * self.v_trans[i, j - 1]
                y2 = (self.zeta1[i, j + 1] + self.H[i, j + 1]) * self.v_trans[i, j + 1]
                ly = (y2 - y1) / self.dtheta_double

                self.zeta2[i, j] = self.zeta1[i, j] - (self.dt / self.c_times_r[i]) * (lx + ly)

    def interpolate_elevation(self):
        for i in range(2, self.m - 1, 2):
            for j in range(0, self.n, 2):
                if self.grid[i][j] == 1:
                    self.zeta2[i, j] = (self.zeta2[i - 1, j] + self.zeta2[i + 1, j]) / 2

        for i in range(1, self.m, 2):
            for j in range(1, self.n - 1, 2):
                if self.grid[i][j] == 1:
                    self.zeta2[i, j] = (self.zeta2[i, j - 1] + self.zeta2[i, j + 1]) / 2

        for i in range(2, self.m - 1, 2):
            for j in range(1, self.n - 1, 2):
                if self.grid[i][j] == 1:
                    self.zeta2[i, j] = (self.zeta2[i - 1, j] + self.zeta2[i + 1, j]) / 2

    def coastal_elevation(self):
        # north
        for j in range(self.n):
            if self.grid[0][j] == 2:
                self.zeta2[0, j] = (3 * self.zeta2[1, j] - self.zeta2[2, j]) / 2

        for i in range(1, self.m - 1):
            for j in range(1, self.n - 1):
                if self.grid[i][j] != 2:
                    continue

                if self.grid[i - 1][j] == 0:
                    value = 3 * self.zeta2[i + 1, j] - self.zeta2[i + 2, j]
                elif self.grid[i + 1][j] == 0:
                    value = 3 * self.zeta2[i - 1, j] - self.zeta2[i - 2, j]
                elif self.grid[i][j - 1] == 0:
                    value = 3 * self.zeta2[i, j + 1] - self.zeta2[i, j + 2]
                elif self.grid[i][j + 1] == 0:
                    value = 3 * self.zeta2[i, j - 1] - self.zeta2[i, j - 2]
                elif self.grid[i - 1][j] == 2:
                    value = 3 * self.zeta2[i + 1, j] - self.zeta2[i + 2, j]
                elif self.grid[i + 1][j] == 2:
                    value = 3 * self.zeta2[i - 1, j] - self.zeta2[i - 2, j]
                else:
                    continue

                self.zeta2[i, j] = value / 2

    def update_velocity_x(self):
        for j in range(2, self.n - 2, 2):
            for i in range(2, self.m - 1, 2):
                if self.grid[i][j] != 1:
                    continue

                x1 = self.v_trans[i - 2, j] * self.v_tilde1[i - 2, j]

                if i == self.m - 2:
                    f1x2 = 2 * self.v_trans[-2, j] - self.v_trans[-4, j]
                    f2x2 = 2 * self.v_tilde1[-2, j] - self.v_tilde1[-4, j]
                    x2 = f1x2 * f2x2
                else:
                    x2 = self.v_trans[i + 2, j] * self.v_tilde1[i + 2, j]

                f1y1 = (self.v_trans[i - 1, j - 1] + self.v_trans[i + 1, j - 1]) / 2
                f2y1 = (self.v_tilde1[i, j] + self.v_tilde1[i, j - 2]) / 2
                f1y2 = (self.v_trans[i - 1, j + 1] + self.v_trans[i + 1, j + 1]) / 2
                f2y2 = (self.v_tilde1[i, j] + self.v_tilde1[i, j + 2]) / 2

                y1, y2 = f1y1 * f2y1, f1y2 * f2y2

                tl1 = (x2 - x1) / (self.c_times_r[i] * self.dr_double)
                tl2 = (y2 - y1) / (self.c_times_r[i] * self.dtheta_double)
                tl3 = -self.F_quarter[i] * (
                    self.v_tilde1[i - 1, j - 1]
                    + self.v_tilde1[i - 1, j + 1]
                    + self.v_tilde1[i + 1, j - 1]
                    + self.v_tilde1[i + 1, j + 1]
                )

                f1tr1 = -g * (self.zeta2[i, j] + self.H[i, j])
                f2tr11 = self.cos_theta[j] * (self.zeta2[i + 1, j] - self.zeta2[i - 1, j]) / self.dr_double
                f2tr12 = self.sin_theta[j] * (self.zeta2[i, j + 1] - self.zeta2[i, j - 1]) / self.r_2_dtheta[i]
                f2tr1 = f2tr11 - f2tr12

                tr1 = f1tr1 * f2tr1
                tr2 = self.tx[i, j] / RHO_OCEAN

                x1 = self.v[i, j]
                x2 = (self.v[i - 1, j - 1] + self.v[i - 1, j + 1] + self.v[i + 1, j - 1] + self.v[i + 1, j + 1]) / 4
                fr3 = Cf * np.sqrt(x1 * x1 + x2 * x2) / (self.zeta2[i, j] + self.H[i, j])
                rhs = self.v_tilde1[i, j] - self.dt * (tl1 + tl2 + tl3) + self.dt * (tr1 + tr2)
                self.v_tilde2[i, j] = rhs / (1 + self.dt * fr3)

        for i in range(0, self.m - 1, 2):
            if self.grid[i][0] == 1:
                self.v_tilde2[i, 0] = self.v_tilde2[i, 2]
            if self.grid[i][-1] == 1:
                self.v_tilde2[i, -1] = self.v_tilde2[i, -3]

        for j in range(0, self.n, 2):
            for i in range(0, self.m - 1, 2):
                if self.grid[i][j] == 1:
                    self.v[i, j] = self.v_tilde2[i, j] / (self.zeta2[i, j] + self.H[i, j])

    def update_velocity_y(self):
        for j in range(1, self.n - 1, 2):
            for i in range(1, self.m - 2, 2):
                if self.grid[i][j] != 1:
                    continue

                f1x1 = self.v_trans[i - 1, j + 1] + self.v_trans[i - 1, j - 1]
                if i == 1:
                    f2x1 = 3 * self.v_tilde1[i, j] - self.v_tilde1[i + 2, j]
                else:
                    f2x1 = self.v_tilde1[i, j] + self.v_tilde1[i - 2, j]
                x1 = f1x1 * f2x1 / 4

                f1x2 = self.v_trans[i + 1, j + 1] + self.v_trans[i + 1, j - 1]
                f2x2 = self.v_tilde1[i, j] + self.v_tilde1[i + 2, j]
                x2 = f1x2 * f2x2 / 4

                if j == 1:
                    f1y1 = 3 * self.v_trans[i, j] - self.v_trans[i, j + 2]
                    f2y1 = 3 * self.v_tilde1[i, j] - self.v_tilde1[i, j + 2]
                    y1 = f1y1 * f2y1 / 4
                else:
                    y1 = self.v_trans[i, j - 2] * self.v_tilde1[i, j - 2]

                if j == self.n - 2:
                    f1y2 = 3 * self.v_trans[i, j] - self.v_trans[i, j - 2]
                    f2y2 = 3 * self.v_tilde1[i, j] - self.v_tilde1[i, j - 2]
                    y2 = f1y2 * f2y2 / 4
                else:
                    y2 = self.v_trans[i, j + 2] * self.v_tilde1[i, j + 2]

                tl1 = (x2 - x1) / (self.c_times_r[i] * self.dr_double)
                tl2 = (y2 - y1) / (self.c_times_r[i] * self.dtheta_double)
                tl3 = self.F_quarter[i] * (
                    self.v_tilde1[i - 1, j - 1]
                    + self.v_tilde1[i - 1, j + 1]
                    + self.v_tilde1[i + 1, j - 1]
                    + self.v_tilde1[i + 1, j + 1]
                )

                f1tr1 = -self.g_over_c * (self.zeta2[i, j] + self.H[i, j])
                f2tr11 = self.sin_theta[j] * (self.zeta2[i + 1, j] - self.zeta2[i - 1, j]) / self.dr_double
                f2tr12 = self.cos_theta[j] * (self.zeta2[i, j + 1] - self.zeta2[i, j - 1]) / self.r_2_dtheta[i]
                f2tr1 = f2tr11 + f2tr12

                tr1 = f1tr1 * f2tr1
                tr2 = self.ty[i, j] / RHO_OCEAN

                x1 = (self.v[i - 1, j - 1] + self.v[i - 1, j + 1] + self.v[i + 1, j - 1] + self.v[i + 1, j + 1]) / 4
                x2 = self.v[i, j]
                fr3 = Cf * np.sqrt(x1 * x1 + x2 * x2) / (self.zeta2[i, j] + self.H[i, j])
                rhs = self.v_tilde1[i, j] - self.dt * (tl1 + tl2 + tl3) + self.dt * (tr1 + tr2)
                self.v_tilde2[i, j] = rhs / (1 + self.dt * fr3)

        for j in range(1, self.n - 1, 2):
            # i=0 is on land
            # i=-1 is south open ocean
            self.v_tilde2[-1, j] = self.v_tilde2[-3, j]

        for j in range(1, self.n - 1, 2):
            for i in range(1, self.m, 2):
                if self.grid[i][j] == 1:
                    self.v[i, j] = self.v_tilde2[i, j] / (self.zeta2[i, j] + self.H[i, j])

    def update_vtrans(self):
        for i in range(2, self.m - 1, 2):
            for j in range(2, self.n - 2, 2):
                if self.grid[i][j] != 1:
                    continue
                x1 = self.v[i, j]
                x2 = (self.v[i - 1, j - 1] + self.v[i - 1, j + 1] + self.v[i + 1, j - 1] + self.v[i + 1, j + 1]) / 4
                self.v_trans[i, j] = self.c * self.r_cos_theta[i, j] * x1 + self.r_sin_theta[i, j] * x2

        for i in range(2, self.m - 1, 2):
            if self.grid[i][0] == 1:
                self.v_trans[i, 0] = self.v_trans[i, 2]
            if self.grid[i][-1] == 1:
                self.v_trans[i, -1] = self.v_trans[i, -3]

        for i in range(1, self.m - 2, 2):
            for j in range(1, self.n - 1, 2):
                if self.grid[i][j] != 1:
                    continue
                x1 = (self.v[i - 1, j - 1] + self.v[i - 1, j + 1] + self.v[i + 1, j - 1] + self.v[i + 1, j + 1]) / 4
                x2 = self.v[i, j]
                self.v_trans[i, j] = -self.c * self.sin_theta[j] * x1 + self.cos_theta[j] * x2

        for j in range(1, self.n - 1, 2):
            self.v_trans[-1, j] = self.v_trans[-3, j]

    def store_peaks(self):
        for i in range(self.m):
            for j in range(self.n):
                if self.zeta2[i, j] > self.peaks[i, j]:
                    self.peaks[i, j] = self.zeta2[i, j]

    def store_test_values(self):
        if not getattr(self, "test_locations", None):
            self.test_locations = []
            for i in range(self.m):
                for j in range(self.n):
                    if self.grid[i][j] == 2:
                        self.test_locations.append((i, j))

        for i, j in self.test_locations:
            try:
                zeta = [x for x in self.test_zetas if x["row"] == i and x["column"] == j][0]
            except IndexError:
                self.test_zetas.append(
                    zeta := {
                        "row": i,
                        "column": j,
                        "data": [],
                    }
                )
            zeta["data"].append(self.zeta2[i, j])

    def setup_coriolis_and_depth(self, dphai):
        phai0 = self.origin.latitude
        # coriolis parameter
        self.F_quarter = np.zeros(self.m)
        # seabed depth
        self.H = np.zeros((self.m, self.n))
        for i in range(self.m):
            self.F_quarter[i] = 2 * OMEGA * np.sin(phai0 - i * dphai) / 4
            for j in range(self.n):
                if self.grid[i][j] == 2:
                    self.H[i][j] = 4
                elif self.grid[i][j] == 1:
                    self.H[i][j] = self.H[i - 1][j] + 8
                else:
                    self.H[i][j] = 0

    def get_storm_location(self, seconds):
        track = self.storm.track
        time = track[0].time + timedelta(seconds=seconds)
        n_points = len(track)
        for i in range(n_points):
            b = track[i]
            if b.time > time:
                a = track[i - 1]
                diff = (b.time - a.time).total_seconds()
                seconds_from_a = (time - a.time).total_seconds()
                lat = a.latitude + (b.latitude - a.latitude) * seconds_from_a / diff
                lng = a.longitude + (b.longitude - a.longitude) * seconds_from_a / diff
                return lng, lat
        raise Exception("Storm data extrapolation not implemented")

    def geo_dst_from_src(self, d, bearing):
        d = abs(d)
        lat = np.asin(
            np.sin(self.origin.latitude) * np.cos(d / EARTH_RADIUS)
            + np.cos(self.origin.latitude) * np.sin(d / EARTH_RADIUS) * np.cos(bearing)
        )
        lon = self.origin.longitude + np.atan2(
            np.sin(bearing) * np.sin(d / EARTH_RADIUS) * np.cos(self.origin.latitude),
            np.cos(d / EARTH_RADIUS) - np.sin(self.origin.latitude) * np.sin(lat),
        )
        return lon, lat
