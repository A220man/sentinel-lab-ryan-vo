# Product development plan

Each round completes one feature or repair. Future items are planned, not implemented claims.

## Current round

project-skeleton

## Roadmap

### project-skeleton — Project skeleton with FastAPI backend and React frontend

Status: done

Acceptance:
- FastAPI backend with health endpoint
- React + TypeScript + Vite frontend
- Dockerfiles for backend and frontend
- docker-compose.yaml with Keycloak
- Basic README with install/run instructions

Implementation: `backend/app/main.py`, `backend/app/core/config.py`, `backend/app/core/database.py`, `backend/Dockerfile`, `frontend/Dockerfile`, `compose.yaml`, `README.md`

Tests: `backend/tests/test_api.py::TestHealthEndpoint`

### course-data-model — Course data model and API

Status: done

Acceptance:
- SQLite models for courses, modules, notebooks
- CRUD API endpoints
- Pagination and filtering
- Backend tests for course API

Implementation: `backend/app/models/__init__.py`, `backend/app/schemas.py`, `backend/app/api/routes.py`

Tests: `backend/tests/test_api.py::TestCourseEndpoints`, `backend/tests/test_api.py::TestModuleEndpoints`, `backend/tests/test_api.py::TestLessonEndpoints`

### course-ui — Course dashboard UI

Status: done

Acceptance:
- Course listing with search/filter
- Course detail view
- Module/lesson navigation
- Colab notebook links
- Frontend tests

Implementation: `frontend/src/pages/CoursesPage.tsx`, `frontend/src/pages/CourseDetailPage.tsx`, `frontend/src/components/CourseCard.tsx`, `frontend/src/components/StateComponents.tsx`

Tests: `frontend/src/components/StateComponents.test.tsx`

### roadmap-engine — Learning roadmap engine

Status: done

Acceptance:
- Roadmap data structure
- Progress tracking
- Recommendation algorithm
- API endpoints for roadmaps

Implementation: `backend/app/models/__init__.py (Roadmap, RoadmapStep)`, `backend/app/schemas.py (RoadmapResponse, RoadmapStepResponse)`, `backend/app/api/routes.py (roadmap endpoints)`, `frontend/src/pages/RoadmapsPage.tsx`

Tests: `backend/tests/test_api.py::TestRoadmapEndpoints`

### auth-oidc — OIDC authentication with Keycloak

Status: planned

Acceptance:
- Keycloak realm configuration
- Backend auth middleware
- Frontend login/logout flow
- Protected routes
- Auth tests

### notebook-management — Notebook import/export and Colab integration

Status: planned

Acceptance:
- Notebook upload/download
- Colab badge generation
- Notebook metadata extraction
- Export workflow

