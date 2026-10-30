import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.models import Course, Module, Lesson, Roadmap, RoadmapStep, CourseLevel, LessonType

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def reset_database():
    """Reset database before each test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


class TestHealthEndpoint:
    def test_health_check(self):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "sentinel-lab-ryan-vo"


class TestCourseEndpoints:
    def test_create_course(self):
        response = client.post(
            "/api/v1/courses",
            json={
                "title": "Introduction to LLMs",
                "description": "Learn the basics of Large Language Models",
                "level": "beginner",
                "author": "Ryan Vo",
                "tags": ["llm", "ai", "beginner"],
                "is_published": True,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Introduction to LLMs"
        assert data["level"] == "beginner"
        assert data["author"] == "Ryan Vo"
        assert data["tags"] == ["llm", "ai", "beginner"]
        assert data["is_published"] is True
        assert "id" in data
        assert "created_at" in data

    def test_list_courses(self):
        # Create a course first
        client.post(
            "/api/v1/courses",
            json={"title": "Course 1", "level": "beginner", "is_published": True},
        )
        client.post(
            "/api/v1/courses",
            json={"title": "Course 2", "level": "advanced", "is_published": False},
        )

        response = client.get("/api/v1/courses")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1  # Only published
        assert len(data["items"]) == 1
        assert data["items"][0]["title"] == "Course 1"

    def test_list_courses_all(self):
        client.post("/api/v1/courses", json={"title": "Course 1", "is_published": True})
        client.post("/api/v1/courses", json={"title": "Course 2", "is_published": False})

        response = client.get("/api/v1/courses?published_only=false")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2

    def test_get_course(self):
        create_response = client.post(
            "/api/v1/courses",
            json={"title": "Test Course", "level": "intermediate", "is_published": True},
        )
        course_id = create_response.json()["id"]

        response = client.get(f"/api/v1/courses/{course_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Course"
        assert data["level"] == "intermediate"

    def test_get_course_not_found(self):
        response = client.get("/api/v1/courses/999")
        assert response.status_code == 404

    def test_update_course(self):
        create_response = client.post(
            "/api/v1/courses",
            json={"title": "Original Title", "level": "beginner"},
        )
        course_id = create_response.json()["id"]

        response = client.put(
            f"/api/v1/courses/{course_id}",
            json={"title": "Updated Title", "level": "advanced"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["level"] == "advanced"

    def test_delete_course(self):
        create_response = client.post(
            "/api/v1/courses",
            json={"title": "To Delete", "is_published": True},
        )
        course_id = create_response.json()["id"]

        response = client.delete(f"/api/v1/courses/{course_id}")
        assert response.status_code == 204

        get_response = client.get(f"/api/v1/courses/{course_id}")
        assert get_response.status_code == 404

    def test_search_courses(self):
        client.post("/api/v1/courses", json={"title": "LLM Basics", "is_published": True})
        client.post("/api/v1/courses", json={"title": "Advanced RAG", "is_published": True})

        response = client.get("/api/v1/courses?search=LLM")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "LLM Basics"

    def test_filter_by_level(self):
        client.post("/api/v1/courses", json={"title": "Beginner Course", "level": "beginner", "is_published": True})
        client.post("/api/v1/courses", json={"title": "Advanced Course", "level": "advanced", "is_published": True})

        response = client.get("/api/v1/courses?level=beginner")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["level"] == "beginner"


class TestModuleEndpoints:
    def test_create_module(self):
        course_response = client.post("/api/v1/courses", json={"title": "Test Course", "is_published": True})
        course_id = course_response.json()["id"]

        response = client.post(
            f"/api/v1/courses/{course_id}/modules",
            json={"title": "Module 1", "description": "First module", "order": 1},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Module 1"
        assert data["course_id"] == course_id
        assert data["order"] == 1

    def test_list_modules(self):
        course_response = client.post("/api/v1/courses", json={"title": "Test Course", "is_published": True})
        course_id = course_response.json()["id"]

        client.post(f"/api/v1/courses/{course_id}/modules", json={"title": "Module 1", "order": 1})
        client.post(f"/api/v1/courses/{course_id}/modules", json={"title": "Module 2", "order": 2})

        response = client.get(f"/api/v1/courses/{course_id}/modules")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["title"] == "Module 1"
        assert data[1]["title"] == "Module 2"

    def test_create_module_course_not_found(self):
        response = client.post(
            "/api/v1/courses/999/modules",
            json={"title": "Module 1"},
        )
        assert response.status_code == 404


class TestLessonEndpoints:
    def test_create_lesson(self):
        course_response = client.post("/api/v1/courses", json={"title": "Test Course", "is_published": True})
        course_id = course_response.json()["id"]

        module_response = client.post(
            f"/api/v1/courses/{course_id}/modules",
            json={"title": "Module 1", "order": 1},
        )
        module_id = module_response.json()["id"]

        response = client.post(
            f"/api/v1/modules/{module_id}/lessons",
            json={
                "title": "Lesson 1",
                "lesson_type": "notebook",
                "content_url": "https://colab.research.google.com/xxx",
                "order": 1,
                "duration_minutes": 30,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Lesson 1"
        assert data["lesson_type"] == "notebook"
        assert data["module_id"] == module_id

    def test_list_lessons(self):
        course_response = client.post("/api/v1/courses", json={"title": "Test Course", "is_published": True})
        course_id = course_response.json()["id"]

        module_response = client.post(f"/api/v1/courses/{course_id}/modules", json={"title": "Module 1", "order": 1})
        module_id = module_response.json()["id"]

        client.post(f"/api/v1/modules/{module_id}/lessons", json={"title": "Lesson 1", "order": 1})
        client.post(f"/api/v1/modules/{module_id}/lessons", json={"title": "Lesson 2", "order": 2})

        response = client.get(f"/api/v1/modules/{module_id}/lessons")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["title"] == "Lesson 1"
        assert data[1]["title"] == "Lesson 2"


class TestRoadmapEndpoints:
    def test_create_roadmap(self):
        response = client.post(
            "/api/v1/roadmaps",
            json={
                "title": "LLM Engineer Roadmap",
                "description": "Become an LLM Engineer",
                "target_audience": "Developers",
                "estimated_hours": 40,
                "is_published": True,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "LLM Engineer Roadmap"
        assert data["estimated_hours"] == 40
        assert "steps" in data

    def test_list_roadmaps(self):
        client.post("/api/v1/roadmaps", json={"title": "Roadmap 1", "is_published": True})
        client.post("/api/v1/roadmaps", json={"title": "Roadmap 2", "is_published": False})

        response = client.get("/api/v1/roadmaps")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Roadmap 1"

    def test_create_roadmap_step(self):
        roadmap_response = client.post("/api/v1/roadmaps", json={"title": "Roadmap", "is_published": True})
        roadmap_id = roadmap_response.json()["id"]

        course_response = client.post("/api/v1/courses", json={"title": "Course", "is_published": True})
        course_id = course_response.json()["id"]

        response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/steps",
            json={"title": "Step 1", "course_id": course_id, "order": 1, "is_required": True},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Step 1"
        assert data["course_id"] == course_id
        assert data["roadmap_id"] == roadmap_id

    def test_create_roadmap_step_invalid_course(self):
        roadmap_response = client.post("/api/v1/roadmaps", json={"title": "Roadmap", "is_published": True})
        roadmap_id = roadmap_response.json()["id"]

        response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/steps",
            json={"title": "Step 1", "course_id": 999, "order": 1},
        )
        assert response.status_code == 404
    def test_recommend_next_step(self):
        roadmap_response = client.post("/api/v1/roadmaps", json={"title": "Roadmap", "is_published": True})
        roadmap_id = roadmap_response.json()["id"]

        course1_response = client.post("/api/v1/courses", json={"title": "Course 1", "is_published": True})
        course1_id = course1_response.json()["id"]

        course2_response = client.post("/api/v1/courses", json={"title": "Course 2", "is_published": True})
        course2_id = course2_response.json()["id"]

        course3_response = client.post("/api/v1/courses", json={"title": "Course 3", "is_published": True})
        course3_id = course3_response.json()["id"]

        # Create steps: required course1, required course2, optional course3
        step1_response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/steps",
            json={"title": "Step 1", "course_id": course1_id, "order": 1, "is_required": True},
        )
        step1_id = step1_response.json()["id"]

        step2_response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/steps",
            json={"title": "Step 2", "course_id": course2_id, "order": 2, "is_required": True},
        )
        step2_id = step2_response.json()["id"]

        step3_response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/steps",
            json={"title": "Step 3", "course_id": course3_id, "order": 3, "is_required": False},
        )
        step3_id = step3_response.json()["id"]

        # No completed steps - should recommend step 1 (course1)
        response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/recommend",
            json={"completed_step_ids": []},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["next_step"]["id"] == step1_id
        assert data["next_course"]["id"] == course1_id
        assert data["progress_percentage"] == 0.0
        assert data["completed_steps"] == 0
        assert data["total_steps"] == 3

        # Complete step 1 - should recommend step 2 (course2)
        response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/recommend",
            json={"completed_step_ids": [step1_id]},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["next_step"]["id"] == step2_id
        assert data["next_course"]["id"] == course2_id
        assert data["progress_percentage"] == 33.33
        assert data["completed_steps"] == 1

        # Complete step 2 - should recommend step 3 (course3, optional)
        response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/recommend",
            json={"completed_step_ids": [step1_id, step2_id]},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["next_step"]["id"] == step3_id
        assert data["next_course"]["id"] == course3_id
        assert data["progress_percentage"] == 66.67
        assert data["completed_steps"] == 2

        # Complete all steps - no next step
        response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/recommend",
            json={"completed_step_ids": [step1_id, step2_id, step3_id]},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["next_step"] is None
        assert data["next_course"] is None
        assert data["progress_percentage"] == 100.0
        assert data["completed_steps"] == 3

    def test_recommend_skips_optional_when_required_remain(self):
        roadmap_response = client.post("/api/v1/roadmaps", json={"title": "Roadmap", "is_published": True})
        roadmap_id = roadmap_response.json()["id"]

        course1_response = client.post("/api/v1/courses", json={"title": "Course 1", "is_published": True})
        course1_id = course1_response.json()["id"]

        course2_response = client.post("/api/v1/courses", json={"title": "Course 2", "is_published": True})
        course2_id = course2_response.json()["id"]

        # Optional step first, then required step
        step1_response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/steps",
            json={"title": "Optional Step", "course_id": course1_id, "order": 1, "is_required": False},
        )
        step1_id = step1_response.json()["id"]

        step2_response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/steps",
            json={"title": "Required Step", "course_id": course2_id, "order": 2, "is_required": True},
        )
        step2_id = step2_response.json()["id"]

        # No completed - should recommend required step (step2) even though step1 is first in order
        response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/recommend",
            json={"completed_step_ids": []},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["next_step"]["id"] == step2_id
        assert data["next_course"]["id"] == course2_id

    def test_recommend_no_course_on_step(self):
        roadmap_response = client.post("/api/v1/roadmaps", json={"title": "Roadmap", "is_published": True})
        roadmap_id = roadmap_response.json()["id"]

        step_response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/steps",
            json={"title": "Step without course", "order": 1, "is_required": True},
        )
        step_id = step_response.json()["id"]

        response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/recommend",
            json={"completed_step_ids": []},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["next_step"]["id"] == step_id
        assert data["next_course"] is None

    def test_recommend_roadmap_not_found(self):
        response = client.post(
            "/api/v1/roadmaps/999/recommend",
            json={"completed_step_ids": []},
        )
        assert response.status_code == 404

    def test_recommend_empty_roadmap(self):
        roadmap_response = client.post("/api/v1/roadmaps", json={"title": "Empty Roadmap", "is_published": True})
        roadmap_id = roadmap_response.json()["id"]

        response = client.post(
            f"/api/v1/roadmaps/{roadmap_id}/recommend",
            json={"completed_step_ids": []},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["next_step"] is None
        assert data["next_course"] is None
        assert data["progress_percentage"] == 100.0
        assert data["total_steps"] == 0