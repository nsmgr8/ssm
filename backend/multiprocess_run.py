from multiprocessing import Process

from app_types import Grid, GridParams, IncludeFlags, RunParams, Storm
from elliptic_ssm import EllipticSurgeModel


def main(
    grid: Grid,
    grid_params: GridParams,
    run_params: RunParams,
    storm: Storm,
    include: IncludeFlags,
    position: int,
):
    model = EllipticSurgeModel(grid=grid, storm=storm, grid_params=grid_params, run_params=run_params)
    model.run(include=include, position=position)


def start(grid: Grid, grid_params: GridParams, run_params: RunParams, storm: Storm):
    for i, include in enumerate(
        (
            IncludeFlags(tide=True, surge=True),
            IncludeFlags(tide=False, surge=True),
            IncludeFlags(tide=True, surge=False),
        )
    ):
        p = Process(target=main, args=(grid, grid_params, run_params, storm, include, i))
        p.start()
