from pathlib import Path

DATA_FOLDER = Path(__file__).resolve().parent.parent / "data"
GRIDS_FOLDER = DATA_FOLDER / "grids"
STORM_FOLDER = DATA_FOLDER / "storms"
STORMS = tuple(p.name for p in STORM_FOLDER.iterdir() if p.is_dir())
