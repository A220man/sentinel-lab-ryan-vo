from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import router as api_router
from app.models import Course, Module, Lesson, Roadmap, RoadmapStep

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="LLM Course Platform with Roadmaps and Colab Notebooks",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "description": "LLM Course Platform with Roadmaps and Colab Notebooks",
    }