import json
from multiprocessing import Pool

from app_types import GridConfig, IncludeFlags, RunParams, Storm
from consts import GRIDS_FOLDER, STORM_FOLDER
from elliptic_ssm import EllipticSurgeModel


def run(kwargs):
    with open(GRIDS_FOLDER / "grid.original.json") as fp:
        config = GridConfig(**json.load(fp))
    with open((STORM_FOLDER / "bulbul-2019" / "track.json")) as fp:
        storm = Storm(**json.load(fp))
    run_params = RunParams(dt=60, tide_phase=0, tide_amplitude=0.6)
    model = EllipticSurgeModel(
        grid=config.grid,
        grid_params=config.config,
        run_params=run_params,
        storm=storm,
    )
    model.run(**kwargs)


if __name__ == "__main__":
    options = [
        dict(include=IncludeFlags(tide=True, surge=True), position=0),
        dict(include=IncludeFlags(tide=True, surge=False), position=1),
        dict(include=IncludeFlags(tide=False, surge=True), position=2),
    ]
    with Pool(len(options)) as pool:
        for _ in pool.imap(run, options):
            pass

    pool.join()
