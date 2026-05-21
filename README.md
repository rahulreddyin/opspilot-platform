<p align="center">
  <h1 align="center">OpsPilot Platform</h1>
  <p align="center">
    Cloud-Native Real-Time Incident Response & Team Operations Platform
  </p>
</p>

---

OpsPilot is a production-style full-stack operational platform inspired by real-world SRE, DevOps, cloud operations, and incident management workflows.

The platform enables teams to:

- Create and manage production incidents
- Coordinate operational tasks
- Manage teams and role-based access
- Receive real-time notifications
- Track operational activity timelines
- Collaborate across engineering workflows
- Monitor operational readiness

Built using:

- Spring Boot
- React + Vite
- PostgreSQL
- Kafka
- Redis
- WebSockets (STOMP/SockJS)
- Docker
- Terraform-style infrastructure organization

---

## Key Highlights

- Real-time operational updates using WebSockets + STOMP
- Kafka event-streaming architecture
- Secure JWT authentication & role-based authorization
- Team collaboration workflows
- Incident lifecycle management
- Task orchestration system
- Live notifications panel
- Activity timeline & audit logging
- Dockerized multi-service deployment
- Swagger/OpenAPI integration
- Health monitoring with Spring Boot Actuator
- Production-oriented project structure

---

# System Architecture

![System Architecture](.docs/architecture/opspilot-architecture.jpeg)

---

# Core Features

## Authentication & Authorization

- User registration and login
- JWT token generation and validation
- Protected REST APIs
- Role-based authorization
- Role-aware frontend rendering
- BCrypt password hashing
- Security filters and request authentication

### Supported Roles

| Role | Purpose |
|---|---|
| ADMIN | Platform administration and role management |
| INCIDENT_MANAGER | Incident coordination and ownership |
| TEAM_LEAD | Team operations and task oversight |
| USER | General operational workflows |

---

## Incident Management

The incident module simulates real operational incident-response workflows used by production engineering teams.

### Features

- Create production incidents
- Assign incident owners
- Track incident severity
- Update incident status
- Add operational comments
- Maintain incident timelines
- Search and filter incidents
- Receive live incident updates

### Supported Incident Status

| Status | Meaning |
|---|---|
| OPEN | Incident created |
| INVESTIGATING | Root-cause analysis in progress |
| IN_PROGRESS | Remediation underway |
| RESOLVED | Issue resolved |
| CLOSED | Operationally finalized |

### Severity Levels

| Severity | Meaning |
|---|---|
| LOW | Minor issue |
| MEDIUM | Moderate operational degradation |
| HIGH | Significant operational impact |
| CRITICAL | Major outage / urgent escalation |

---

## Task Orchestration

OpsPilot includes operational task management for engineering execution workflows.

### Features

- Create operational tasks
- Assign tasks to users
- Link tasks to incidents
- Track priorities and due dates
- Update task status
- View user-specific task lists
- Receive live task updates

### Task States

| State | Meaning |
|---|---|
| TODO | Work pending |
| IN_PROGRESS | Work actively handled |
| DONE | Work completed |

---

## Team Workspace

The team workspace enables collaborative operational execution.

### Features

- Team creation and management
- Bulk user assignment
- Bulk role assignment
- Team-based task coordination
- Shared execution view
- Team ownership tracking
- Operational collaboration workflows

---

## Notifications System

OpsPilot includes a live operational notification system.

### Features

- Notification bell UI
- Recent notifications API
- Unread notification count
- Mark notifications as read
- User-specific WebSocket subscriptions
- Live push notifications using STOMP/SockJS

---

## Timeline, Comments & Audit Trail

OpsPilot tracks operational collaboration and activity history.

### Tracked Activities

- Incident creation
- Status updates
- Comments
- Task updates
- Team assignment
- Role changes
- Administrative actions

This provides operational traceability and audit visibility.

---

# Real-Time Event Architecture

OpsPilot uses Spring WebSocket messaging with STOMP and SockJS.

### Backend WebSocket Endpoint

```text
/ws
```

### Topic Broadcasting

```text
/topic/incidents/**
/topic/tasks/**
/topic/notifications/**
/topic/activity
```

### Live Update Flow

```text
User Action
    ↓
Spring Boot REST API
    ↓
Service Layer
    ↓
Kafka Event / Notification
    ↓
Kafka Consumer
    ↓
WebSocket Broadcast
    ↓
React Real-Time UI Update
```

---

# Kafka Event Streaming Layer

OpsPilot includes Kafka infrastructure for event-streaming workflows.

## Kafka Components

- Kafka broker
- Zookeeper
- Topic configuration
- Producer services
- Consumer services
- Listener container factories
- Event relay architecture

## Configured Topics

```text
incident-created
incident-status-updated
task-created
task-status-updated
activity-events
comment-created
notification-events
```

---

# Backend Architecture

The backend follows layered enterprise architecture principles.

```text
apps/platform-api/src/main/java/com/opspilot/platform
├── config
├── controller
├── dto
├── events
├── exception
├── model/entity
├── repository
├── security
└── service
```

## Backend Concepts Demonstrated

- RESTful API design
- DTO separation
- Service-layer business logic
- Repository abstraction
- JPA/Hibernate persistence
- JWT security filters
- Role-based authorization
- Kafka event publishing
- WebSocket broadcasting
- Rate limiting
- Operational workflow modeling

---

# Frontend Architecture

The frontend is built using React + Vite.

```text
apps/web-app/src
├── api
├── components
├── hooks
├── pages
├── utils
└── websocket
```

## Frontend Concepts Demonstrated

- Protected route handling
- Role-aware rendering
- API abstraction layer
- Live notification hooks
- STOMP topic subscriptions
- Dashboard UI
- Team workspace UI
- Incident workflow UI
- Operational activity feeds

---

# Tech Stack

## Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool |
| React Router | Routing |
| Axios | REST communication |
| STOMP.js | WebSocket messaging |
| SockJS | Browser WebSocket fallback |

---

## Backend

| Technology | Purpose |
|---|---|
| Java 17 | Backend language |
| Spring Boot | API framework |
| Spring Security | Authentication & authorization |
| JWT | Stateless API security |
| Spring Data JPA | ORM/data access |
| Hibernate | Persistence |
| PostgreSQL | Relational database |
| Flyway | Database migrations |
| Spring WebSocket | Real-time messaging |
| Kafka | Event-streaming infrastructure |
| Redis | Cache/rate-limit infrastructure |
| Maven | Dependency management |

---

## DevOps / Infrastructure

| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-service orchestration |
| AWS EC2 | Deployment target |
| Terraform Structure | Infrastructure organization |
| Swagger/OpenAPI | API documentation |
| Spring Actuator | Health monitoring |

---

# Dockerized Services

The production Docker setup runs:

| Service | Purpose |
|---|---|
| opspilot-frontend | React frontend |
| opspilot-backend | Spring Boot API |
| opspilot-postgres | PostgreSQL database |
| opspilot-redis | Redis runtime |
| opspilot-kafka | Kafka broker |
| opspilot-zookeeper | Kafka coordination |

---

# API Documentation

Swagger/OpenAPI is available when backend services are running.

```text
http://localhost:8080/swagger-ui/index.html
```

---

# Health Monitoring

Spring Boot Actuator exposes health endpoints:

```text
GET /actuator/health
```

The endpoint validates:

- Database connectivity
- Disk space
- Mail integration
- Application liveness

---

# Database Migrations

Flyway migrations are located at:

```text
apps/platform-api/src/main/resources/db/migration
```

This enables version-controlled schema evolution.

---

# Application Screenshots

## Authentication

### Login Page

![Login](.docs/screenshots/LoginPage.png)

### Registration Page

![Register](.docs/screenshots/RegisterPage.png)

---

## Incident Management

### Incident Dashboard

![Incident Dashboard](.docs/screenshots/IncidentDashboard.png)

### Incident Comments

![Incident Comments](.docs/screenshots/IncidentComments.png)

---

## Team Operations

### Team Management

![Team Management](.docs/screenshots/ManageTeams.png)

### Team Workspace

![Team Workspace](.docs/screenshots/TeamWorkspace.png)

### Task Assignment

![Task Assignment](.docs/screenshots/TaskAssignment.png)

---

## Notifications & Activity

### Live Notifications

![Notifications](.docs/screenshots/LiveNotifications.png)

### Operational Dashboard

![Dashboard](.docs/screenshots/OperationalDashboard.png)

---

## API Documentation

### Swagger/OpenAPI

![Swagger](.docs/screenshots/Swagger.png)

---

## Deployment & Infrastructure

### Docker Containers & Health Checks

![Docker Health](C:\Users\rahul\OneDrive\Documents\backend-projects\opspilot-platform\docs\screenshots\DockerHealth.png)

---

# Project Structure

```text
opspilot-platform/
│
├── apps/
│   ├── platform-api/
│   └── web-app/
│
├── infra/
│   ├── docker/
│   └── terraform/
│
├── scripts/
│
├── .docs/
│   ├── architecture/
│   ├── screenshots/
│   ├── api/
│   └── runbooks/
│
├── docker-compose.yml
├── docker-compose.kafka.yml
└── README.md
```

---

# Local Development Setup

## Prerequisites

- Java 17
- Maven
- Node.js
- Docker Desktop
- Git

---

## Clone Repository

```bash
git clone https://github.com/rahulreddyin7/opspilot-platform.git
cd opspilot-platform
```

---

## Start with Docker Compose

```bash
docker compose up --build
```

---

# Local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui/index.html |
| Health Check | http://localhost:8080/actuator/health |

---

# Production Deployment Notes

Production deployment supports:

- Externalized environment variables
- Docker network isolation
- EC2 deployment
- Persistent PostgreSQL volumes
- Kafka orchestration
- Redis integration
- Mail integration
- JWT secret configuration

Sensitive secrets should be managed using environment variables or secret managers.

---

# Engineering Concepts Demonstrated

- Full-stack enterprise application architecture
- JWT-based authentication
- Role-based authorization
- Event-driven service design
- Kafka listener/topic infrastructure
- WebSocket real-time synchronization
- Team collaboration workflows
- Incident lifecycle management
- Operational audit tracking
- Dockerized deployment
- Health monitoring
- API documentation
- Database migration/versioning
- Cloud deployment readiness

---

# Future Enhancements

- Kubernetes deployment manifests
- Helm chart support
- CI/CD pipeline integration
- HTTPS reverse proxy integration
- Prometheus + Grafana monitoring
- SLA/SLO dashboards
- Multi-tenant organization support
- File attachment support
- AI-assisted incident summarization
- Retry and dead-letter Kafka flows

---

# Resume-Ready Summary

OpsPilot is a production-style cloud-native operational platform inspired by real-world DevOps, SRE, and incident-response systems.

The project demonstrates:

- Enterprise backend architecture
- Real-time distributed systems
- Event-driven design
- Kafka/WebSocket integration
- JWT security
- Operational workflow modelingcd C:\Users\rahul\OneDrive\Documents\backend-projects\opspilot-platform
- Dockerized infrastructure
- Full-stack engineering practices

---

# Author

Rahul Reddy Puli

GitHub:
https://github.com/rahulreddyin7

LinkedIn:
https://www.linkedin.com/in/rahulreddyin7/