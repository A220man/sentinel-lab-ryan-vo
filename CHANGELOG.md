# Changelog

## 1.0.0 — work-in-progress checkpoint

Partial code published for continued development. Known issues: STATUS.md.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-22

### Added
- Initial project scaffold with FastAPI backend and React frontend
- Course, Module, Lesson, Roadmap, and RoadmapStep data models
- RESTful API endpoints for all entities with pagination, filtering, and search
- React frontend with Courses listing, Course detail, Roadmaps, and About pages
- Responsive UI with Tailwind-like CSS variables design system
- Loading, Error, and Empty state components
- Docker configuration for backend, frontend, and Keycloak
- Keycloak realm export with viewer/analyst/admin roles
- Health check endpoints for all services
- Comprehensive backend test suite (15+ tests)
- OpenAPI documentation at /docs

### Security
- OIDC authentication with Keycloak (PKCE flow)
- JWT token validation with configurable issuer/audience
- Role-based access control (viewer, analyst, admin)
- CORS configuration for local development
- Secure cookie settings for production
- Environment-based secret management

### Documentation
- README with architecture diagram and quick start guide
- API endpoint reference
- Environment variable configuration
- Deployment and backup/restore instructions
- License (MIT)