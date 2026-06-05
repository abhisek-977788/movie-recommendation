from typing import Optional
from sqlalchemy import String, Float, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    genres: Mapped[str] = mapped_column(String(255)) # Pipe-separated (e.g. "Action|Comedy")
    overview: Mapped[str] = mapped_column(Text)
    director: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    cast_members: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Comma-separated
    release_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    poster_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    backdrop_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    popularity: Mapped[float] = mapped_column(Float, default=0.0)
    tmdb_id: Mapped[Optional[int]] = mapped_column(Integer, unique=True, nullable=True, index=True)
    language: Mapped[str] = mapped_column(String(10), default="en")
