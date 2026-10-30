from typing import Optional, List
from pydantic import BaseModel, HttpUrl
from datetime import datetime

from app.models import CourseLevel, LessonType


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    level: CourseLevel = CourseLevel.BEGINNER
    thumbnail_url: Optional[HttpUrl] = None
    author: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: bool = False


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[CourseLevel] = None
    thumbnail_url: Optional[HttpUrl] = None
    author: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None


class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    modules_count: int = 0

    class Config:
        from_attributes = True


class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0


class ModuleCreate(ModuleBase):
    pass


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None


class ModuleResponse(ModuleBase):
    id: int
    course_id: int
    created_at: datetime
    updated_at: datetime
    lessons_count: int = 0

    class Config:
        from_attributes = True


class LessonBase(BaseModel):
    title: str
    description: Optional[str] = None
    lesson_type: LessonType = LessonType.NOTEBOOK
    content_url: Optional[HttpUrl] = None
    content_markdown: Optional[str] = None
    notebook_path: Optional[str] = None
    order: int = 0
    duration_minutes: Optional[int] = None


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    lesson_type: Optional[LessonType] = None
    content_url: Optional[HttpUrl] = None
    content_markdown: Optional[str] = None
    notebook_path: Optional[str] = None
    order: Optional[int] = None
    duration_minutes: Optional[int] = None


class LessonResponse(LessonBase):
    id: int
    module_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_audience: Optional[str] = None
    estimated_hours: Optional[int] = None
    is_published: bool = False


class RoadmapCreate(RoadmapBase):
    pass


class RoadmapUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_audience: Optional[str] = None
    estimated_hours: Optional[int] = None
    is_published: Optional[bool] = None


class RoadmapStepBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0
    is_required: bool = True
    course_id: Optional[int] = None


class RoadmapStepCreate(RoadmapStepBase):
    pass


class RoadmapStepUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    is_required: Optional[bool] = None
    course_id: Optional[int] = None


class RoadmapStepResponse(RoadmapStepBase):
    id: int
    roadmap_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RoadmapResponse(RoadmapBase):
    id: int
    created_at: datetime
    updated_at: datetime
    steps: List[RoadmapStepResponse] = []

    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    items: List[CourseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
class RoadmapRecommendationRequest(BaseModel):
    completed_step_ids: List[int] = []


class RoadmapRecommendationResponse(BaseModel):
    next_step: Optional[RoadmapStepResponse] = None
    next_course: Optional[CourseResponse] = None
    progress_percentage: float = 0.0
    completed_steps: int = 0
    total_steps: int = 0

    class Config:
        from_attributes = True