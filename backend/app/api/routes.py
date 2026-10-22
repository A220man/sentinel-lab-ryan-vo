from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from math import ceil
from datetime import datetime

from app.core.database import get_db
from app.models import Course, Module, Lesson, Roadmap, RoadmapStep, CourseLevel, LessonType
from app.schemas import (
    CourseCreate, CourseUpdate, CourseResponse,
    ModuleCreate, ModuleUpdate, ModuleResponse,
    LessonCreate, LessonUpdate, LessonResponse,
    RoadmapCreate, RoadmapUpdate, RoadmapResponse,
    RoadmapStepCreate, RoadmapStepUpdate, RoadmapStepResponse,
    PaginatedResponse
)

router = APIRouter(prefix="/api/v1", tags=["courses"])


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "sentinel-lab-ryan-vo"}


# Course endpoints
@router.post("/courses", response_model=CourseResponse, status_code=201)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    tags_str = ",".join(course.tags) if course.tags else None
    db_course = Course(
        title=course.title,
        description=course.description,
        level=course.level,
        thumbnail_url=str(course.thumbnail_url) if course.thumbnail_url else None,
        author=course.author,
        tags=tags_str,
        is_published=course.is_published,
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return CourseResponse(
        id=db_course.id,
        title=db_course.title,
        description=db_course.description,
        level=db_course.level,
        thumbnail_url=db_course.thumbnail_url,
        author=db_course.author,
        tags=db_course.tags.split(",") if db_course.tags else None,
        is_published=db_course.is_published,
        created_at=db_course.created_at,
        updated_at=db_course.updated_at,
        modules_count=0,
    )


@router.get("/courses", response_model=PaginatedResponse)
def list_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    level: Optional[CourseLevel] = None,
    published_only: bool = True,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Course)
    if published_only:
        query = query.filter(Course.is_published == True)
    if level:
        query = query.filter(Course.level == level)
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%") | Course.description.ilike(f"%{search}%"))

    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 1
    courses = query.order_by(Course.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for c in courses:
        modules_count = db.query(Module).filter(Module.course_id == c.id).count()
        items.append(CourseResponse(
            id=c.id,
            title=c.title,
            description=c.description,
            level=c.level,
            thumbnail_url=c.thumbnail_url,
            author=c.author,
            tags=c.tags.split(",") if c.tags else None,
            is_published=c.is_published,
            created_at=c.created_at,
            updated_at=c.updated_at,
            modules_count=modules_count,
        ))

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/courses/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    modules_count = db.query(Module).filter(Module.course_id == course.id).count()
    return CourseResponse(
        id=course.id,
        title=course.title,
        description=course.description,
        level=course.level,
        thumbnail_url=course.thumbnail_url,
        author=course.author,
        tags=course.tags.split(",") if course.tags else None,
        is_published=course.is_published,
        created_at=course.created_at,
        updated_at=course.updated_at,
        modules_count=modules_count,
    )


@router.put("/courses/{course_id}", response_model=CourseResponse)
def update_course(course_id: int, course_update: CourseUpdate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = course_update.model_dump(exclude_unset=True)
    if "tags" in update_data and update_data["tags"] is not None:
        update_data["tags"] = ",".join(update_data["tags"])
    if "thumbnail_url" in update_data and update_data["thumbnail_url"] is not None:
        update_data["thumbnail_url"] = str(update_data["thumbnail_url"])

    for field, value in update_data.items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)
    modules_count = db.query(Module).filter(Module.course_id == course.id).count()
    return CourseResponse(
        id=course.id,
        title=course.title,
        description=course.description,
        level=course.level,
        thumbnail_url=course.thumbnail_url,
        author=course.author,
        tags=course.tags.split(",") if course.tags else None,
        is_published=course.is_published,
        created_at=course.created_at,
        updated_at=course.updated_at,
        modules_count=modules_count,
    )


@router.delete("/courses/{course_id}", status_code=204)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()


# Module endpoints
@router.post("/courses/{course_id}/modules", response_model=ModuleResponse, status_code=201)
def create_module(course_id: int, module: ModuleCreate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db_module = Module(
        course_id=course_id,
        title=module.title,
        description=module.description,
        order=module.order,
    )
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return ModuleResponse(
        id=db_module.id,
        course_id=db_module.course_id,
        title=db_module.title,
        description=db_module.description,
        order=db_module.order,
        created_at=db_module.created_at,
        updated_at=db_module.updated_at,
        lessons_count=0,
    )


@router.get("/courses/{course_id}/modules", response_model=List[ModuleResponse])
def list_modules(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    modules = db.query(Module).filter(Module.course_id == course_id).order_by(Module.order).all()
    result = []
    for m in modules:
        lessons_count = db.query(Lesson).filter(Lesson.module_id == m.id).count()
        result.append(ModuleResponse(
            id=m.id,
            course_id=m.course_id,
            title=m.title,
            description=m.description,
            order=m.order,
            created_at=m.created_at,
            updated_at=m.updated_at,
            lessons_count=lessons_count,
        ))
    return result


@router.get("/modules/{module_id}", response_model=ModuleResponse)
def get_module(module_id: int, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    lessons_count = db.query(Lesson).filter(Lesson.module_id == module.id).count()
    return ModuleResponse(
        id=module.id,
        course_id=module.course_id,
        title=module.title,
        description=module.description,
        order=module.order,
        created_at=module.created_at,
        updated_at=module.updated_at,
        lessons_count=lessons_count,
    )


@router.put("/modules/{module_id}", response_model=ModuleResponse)
def update_module(module_id: int, module_update: ModuleUpdate, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    update_data = module_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(module, field, value)

    db.commit()
    db.refresh(module)
    lessons_count = db.query(Lesson).filter(Lesson.module_id == module.id).count()
    return ModuleResponse(
        id=module.id,
        course_id=module.course_id,
        title=module.title,
        description=module.description,
        order=module.order,
        created_at=module.created_at,
        updated_at=module.updated_at,
        lessons_count=lessons_count,
    )


@router.delete("/modules/{module_id}", status_code=204)
def delete_module(module_id: int, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(module)
    db.commit()


# Lesson endpoints
@router.post("/modules/{module_id}/lessons", response_model=LessonResponse, status_code=201)
def create_lesson(module_id: int, lesson: LessonCreate, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    db_lesson = Lesson(
        module_id=module_id,
        title=lesson.title,
        description=lesson.description,
        lesson_type=lesson.lesson_type,
        content_url=str(lesson.content_url) if lesson.content_url else None,
        content_markdown=lesson.content_markdown,
        notebook_path=lesson.notebook_path,
        order=lesson.order,
        duration_minutes=lesson.duration_minutes,
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return LessonResponse.model_validate(db_lesson)


@router.get("/modules/{module_id}/lessons", response_model=List[LessonResponse])
def list_lessons(module_id: int, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    lessons = db.query(Lesson).filter(Lesson.module_id == module_id).order_by(Lesson.order).all()
    return [LessonResponse.model_validate(l) for l in lessons]


@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return LessonResponse.model_validate(lesson)


@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson(lesson_id: int, lesson_update: LessonUpdate, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    update_data = lesson_update.model_dump(exclude_unset=True)
    if "content_url" in update_data and update_data["content_url"] is not None:
        update_data["content_url"] = str(update_data["content_url"])

    for field, value in update_data.items():
        setattr(lesson, field, value)

    db.commit()
    db.refresh(lesson)
    return LessonResponse.model_validate(lesson)


@router.delete("/lessons/{lesson_id}", status_code=204)
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()


# Roadmap endpoints
@router.post("/roadmaps", response_model=RoadmapResponse, status_code=201)
def create_roadmap(roadmap: RoadmapCreate, db: Session = Depends(get_db)):
    db_roadmap = Roadmap(
        title=roadmap.title,
        description=roadmap.description,
        target_audience=roadmap.target_audience,
        estimated_hours=roadmap.estimated_hours,
        is_published=roadmap.is_published,
    )
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)
    return RoadmapResponse(
        id=db_roadmap.id,
        title=db_roadmap.title,
        description=db_roadmap.description,
        target_audience=db_roadmap.target_audience,
        estimated_hours=db_roadmap.estimated_hours,
        is_published=db_roadmap.is_published,
        created_at=db_roadmap.created_at,
        updated_at=db_roadmap.updated_at,
        steps=[],
    )


@router.get("/roadmaps", response_model=List[RoadmapResponse])
def list_roadmaps(published_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(Roadmap)
    if published_only:
        query = query.filter(Roadmap.is_published == True)
    roadmaps = query.order_by(Roadmap.created_at.desc()).all()

    result = []
    for r in roadmaps:
        steps = db.query(RoadmapStep).filter(RoadmapStep.roadmap_id == r.id).order_by(RoadmapStep.order).all()
        step_responses = [RoadmapStepResponse.model_validate(s) for s in steps]
        result.append(RoadmapResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            target_audience=r.target_audience,
            estimated_hours=r.estimated_hours,
            is_published=r.is_published,
            created_at=r.created_at,
            updated_at=r.updated_at,
            steps=step_responses,
        ))
    return result


@router.get("/roadmaps/{roadmap_id}", response_model=RoadmapResponse)
def get_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    steps = db.query(RoadmapStep).filter(RoadmapStep.roadmap_id == roadmap_id).order_by(RoadmapStep.order).all()
    step_responses = [RoadmapStepResponse.model_validate(s) for s in steps]
    return RoadmapResponse(
        id=roadmap.id,
        title=roadmap.title,
        description=roadmap.description,
        target_audience=roadmap.target_audience,
        estimated_hours=roadmap.estimated_hours,
        is_published=roadmap.is_published,
        created_at=roadmap.created_at,
        updated_at=roadmap.updated_at,
        steps=step_responses,
    )


@router.put("/roadmaps/{roadmap_id}", response_model=RoadmapResponse)
def update_roadmap(roadmap_id: int, roadmap_update: RoadmapUpdate, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    update_data = roadmap_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(roadmap, field, value)

    db.commit()
    db.refresh(roadmap)
    steps = db.query(RoadmapStep).filter(RoadmapStep.roadmap_id == roadmap_id).order_by(RoadmapStep.order).all()
    step_responses = [RoadmapStepResponse.model_validate(s) for s in steps]
    return RoadmapResponse(
        id=roadmap.id,
        title=roadmap.title,
        description=roadmap.description,
        target_audience=roadmap.target_audience,
        estimated_hours=roadmap.estimated_hours,
        is_published=roadmap.is_published,
        created_at=roadmap.created_at,
        updated_at=roadmap.updated_at,
        steps=step_responses,
    )


@router.delete("/roadmaps/{roadmap_id}", status_code=204)
def delete_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    db.delete(roadmap)
    db.commit()


# Roadmap step endpoints
@router.post("/roadmaps/{roadmap_id}/steps", response_model=RoadmapStepResponse, status_code=201)
def create_roadmap_step(roadmap_id: int, step: RoadmapStepCreate, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    if step.course_id:
        course = db.query(Course).filter(Course.id == step.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

    db_step = RoadmapStep(
        roadmap_id=roadmap_id,
        course_id=step.course_id,
        title=step.title,
        description=step.description,
        order=step.order,
        is_required=step.is_required,
    )
    db.add(db_step)
    db.commit()
    db.refresh(db_step)
    return RoadmapStepResponse.model_validate(db_step)


@router.put("/roadmap-steps/{step_id}", response_model=RoadmapStepResponse)
def update_roadmap_step(step_id: int, step_update: RoadmapStepUpdate, db: Session = Depends(get_db)):
    step = db.query(RoadmapStep).filter(RoadmapStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Roadmap step not found")

    update_data = step_update.model_dump(exclude_unset=True)
    if "course_id" in update_data and update_data["course_id"] is not None:
        course = db.query(Course).filter(Course.id == update_data["course_id"]).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

    for field, value in update_data.items():
        setattr(step, field, value)

    db.commit()
    db.refresh(step)
    return RoadmapStepResponse.model_validate(step)


@router.delete("/roadmap-steps/{step_id}", status_code=204)
def delete_roadmap_step(step_id: int, db: Session = Depends(get_db)):
    step = db.query(RoadmapStep).filter(RoadmapStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Roadmap step not found")
    db.delete(step)
    db.commit()