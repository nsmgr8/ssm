from datetime import datetime
from typing import Annotated, Literal, Sequence

import numpy as np
from pydantic import AfterValidator, BaseModel, PlainSerializer

Grid = Sequence[Sequence[Literal[0, 1, 2]]]


def to_radian(x: float):
    return float(np.deg2rad(x))


def to_degree(x: float):
    return np.round(np.rad2deg(x), 2)


Degree2Radian = Annotated[float, AfterValidator(to_radian), PlainSerializer(to_degree)]


class GeographicCoordinates(BaseModel):
    latitude: Degree2Radian
    longitude: Degree2Radian


class GridParams(BaseModel):
    m: int
    n: int
    dr: float
    e: float
    alpha: Degree2Radian
    beta: Degree2Radian
    origin: GeographicCoordinates


class RunParams(BaseModel):
    dt: float
    tide_amplitude: float
    tide_phase: Degree2Radian


class GridConfig(BaseModel):
    config: GridParams
    grid: Grid


class StormTrack(GeographicCoordinates):
    time: datetime


class Storm(BaseModel):
    max_radius: float
    max_wind_speed: float
    name: str
    track: Sequence[StormTrack]


class IncludeFlags(BaseModel):
    tide: bool
    surge: bool
