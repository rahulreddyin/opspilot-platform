<div align="center">

# OpsPilot Platform

### Cloud-Native Real-Time Incident Response & Team Operations Platform

OpsPilot is a production-style full-stack operations platform for incident management, team collaboration, task orchestration, live notifications, audit timelines, and role-based operational workflows.

Built with **Spring Boot**, **React**, **PostgreSQL**, **Kafka**, **Redis**, **WebSockets**, **Docker**, and **Terraform-style infrastructure organization**.

![Java](https://img.shields.io/badge/Java-17-red)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Kafka](https://img.shields.io/badge/Kafka-Event%20Streaming-black)
![Redis](https://img.shields.io/badge/Redis-Cache%20%2F%20Rate%20Limit-red)
![WebSockets](https://img.shields.io/badge/WebSockets-STOMP%20%2B%20SockJS-success)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

</div>

---

## Overview

OpsPilot is an enterprise-style operational platform inspired by real-world **SRE**, **DevOps**, **platform engineering**, and **cloud operations** workflows.

The system allows teams to create and manage production incidents, assign owners, coordinate operational tasks, track incident timelines, receive live notifications, and manage user/team access through role-based authorization.

Unlike a traditional CRUD application, OpsPilot includes real-time synchronization using **Spring WebSockets with STOMP/SockJS**, event-oriented backend services, Kafka topic/listener infrastructure, JWT-secured APIs, audit logging, Dockerized deployment, and production-style health monitoring.

---

## Key Highlights

- Real-time incident and task updates using **WebSockets, STOMP, and SockJS**
- Secure authentication with **JWT** and protected API routes
- Role-based access control for **Admin**, **Incident Manager**, **Team Lead**, and **User** workflows
- Incident lifecycle management with ownership, severity, impacted service, comments, and timeline history
- Team workspace for operational task assignment and execution tracking
- Live notification center with unread counts and user-specific notification channels
- Activity feed and audit timeline for operational traceability
- Kafka configuration, topics, consumers, and listener container factories for event-streaming workflows
- Docker Compose orchestration for backend, frontend, PostgreSQL, Redis, Kafka, and Zookeeper
- AWS EC2 deployment-ready configuration using production compose files
- Swagger/OpenAPI documentation for REST APIs
- Flyway database migrations for schema versioning

---

## Core Modules

### Authentication & Authorization

OpsPilot includes a security layer built around JWT-based authentication and role-based authorization.

**Implemented capabilities:**

- User registration and login
- Email verification / OTP-style onboarding flow
- JWT token generation and validation
- Protected REST APIs
- Role-aware frontend navigation
- Admin-only team and role management
- BCrypt password hashing
- Security filters for request authentication
- Permission service for role-based access decisions

**Roles supported:**

| Role | Purpose |
|---|---|
| `ADMIN` | Platform administration, team management, role assignment |
| `INCIDENT_MANAGER` | Incident ownership and operational coordination |
| `TEAM_LEAD` | Team workspace coordination and task oversight |
| `USER` | Standard assigned-user access |

---

### Incident Management

The incident module simulates real operational incident-response workflows used by production engineering teams.

**Features:**

- Create production incidents
- Assign incident owner by email
- Track severity and impacted service
- Update incident status
- Add incident comments
- View incident timeline/activity history
- Filter and search incidents
- Receive live incident updates across active clients

**Supported incident lifecycle:**

| Status | Meaning |
|---|---|
| `OPEN` | Incident created and awaiting action |
| `INVESTIGATING` | Active triage / root-cause analysis |
| `IN_PROGRESS` | Remediation work in progress |
| `RESOLVED` | Issue resolved |
| `CLOSED` | Incident finalized |

**Severity levels:**

| Severity | Meaning |
|---|---|
| `LOW` | Minor operational issue |
| `MEDIUM` | Moderate degradation |
| `HIGH` | Significant impact |
| `CRITICAL` | Major outage / high urgency |

---

### Task Orchestration

OpsPilot includes operational task management for incident response and team execution.

**Features:**

- Create tasks
- Assign tasks to users
- Link tasks to operational incidents
- Track priorities and due dates
- Update task status
- View user-specific task lists
- Receive live task updates
- Generate task-related notifications and activity events

**Task states:**

| Status | Meaning |
|---|---|
| `TODO` | Work pending |
| `IN_PROGRESS` | Work actively being handled |
| `DONE` | Work completed |

---

### Team Workspace

The team workspace connects incidents, users, and operational tasks into a collaborative execution environment.

**Features:**

- Team creation and management
- Bulk user assignment
- Role promotion workflows
- Team workspace visibility for operational roles
- Team-specific task creation
- Shared team execution view
- Task ownership and priority tracking

---

### Notifications

OpsPilot includes a live notification system for operational events.

**Features:**

- Notification bell UI
- Recent notifications API
- Unread count API
- Mark single notification as read
- Mark all notifications as read
- User-specific WebSocket topic subscription
- Live push notifications through STOMP/SockJS

Frontend clients subscribe to user-specific destinations such as:

```text
/topic/notifications/{userEmail}
```

---

### Timeline, Comments & Audit Trail

OpsPilot records collaboration and operational history through comments, timelines, and audit-oriented services.

**Tracked actions include:**

- Incident creation
- Incident status changes
- Task creation
- Task status updates
- Comments
- Team assignment
- Role changes
- Admin activity

This makes the platform useful not only for task execution but also for operational traceability.

---

## Real-Time Architecture

OpsPilot uses **Spring WebSocket Message Broker** with **STOMP** and **SockJS** on the frontend.

### Backend WebSocket Configuration

The backend exposes a SockJS/STOMP endpoint:

```text
/ws
```

The message broker publishes to:

```text
/topic/**
```

Application destinations use:

```text
/app/**
```

### Frontend WebSocket Client

The React frontend uses:

- `@stomp/stompjs`
- `sockjs-client`

The frontend maintains reusable socket connection helpers and subscribes to operational topics such as:

```text
/topic/incidents/created
/topic/incidents/status-updated
/topic/tasks/created
/topic/tasks/status-updated
/topic/activity
/topic/notifications/{email}
```

### Live Update Flow

```text
User Action
   ↓
Spring Boot REST API
   ↓
Service Layer Updates Database
   ↓
Domain Event / Notification Created
   ↓
SimpMessagingTemplate Broadcast
   ↓
STOMP/SockJS WebSocket Topic
   ↓
React Client Subscription
   ↓
UI Updates Without Refresh
```

This enables multi-tab and multi-user live synchronization for incidents, tasks, activity feeds, and notifications.

---

## Kafka Event Streaming Layer

OpsPilot includes Kafka infrastructure for event-streaming workflows.

### Kafka Components

- Kafka broker
- Zookeeper
- Topic configuration
- Producer factory configuration
- Consumer factory configuration
- Kafka listener container factories
- Event consumer services

### Configured Topics

```text
incident-created
incident-status-updated
task-created
task-status-updated
activity-events
comment-created
```

### Kafka-to-WebSocket Relay Pattern

The backend includes Kafka listeners that consume operational events and relay them to WebSocket topics:

```text
Kafka Topic
   ↓
@KafkaListener Consumer
   ↓
SimpMessagingTemplate
   ↓
/topic/** WebSocket Destination
   ↓
React Live UI
```

> Note: The project contains a complete Kafka topic/listener infrastructure and WebSocket relay consumers. If extending this further, the next step is to route all service-layer domain events through `KafkaTemplate` before broadcasting, making Kafka the primary event bus for every operational event.

---

## System Architecture

```text
                         ┌────────────────────────────┐
                         │        React Frontend       │
                         │  Vite + Router + Axios UI   │
                         │  STOMP/SockJS Subscriptions │
                         └──────────────┬─────────────┘
                                        │ REST + WebSocket
                                        ▼
                         ┌────────────────────────────┐
                         │      Spring Boot Backend    │
                         │ Controllers / Services /    │
                         │ Security / Event Publishers │
                         └───────┬──────────┬─────────┘
                                 │          │
                         SQL/JPA │          │ Events
                                 ▼          ▼
                 ┌──────────────────┐   ┌──────────────────┐
                 │    PostgreSQL     │   │      Kafka        │
                 │ Users, Teams,     │   │ Event Topics &    │
                 │ Incidents, Tasks  │   │ Consumer Relays   │
                 └──────────────────┘   └─────────┬────────┘
                                                   │
                                                   ▼
                                      ┌────────────────────────┐
                                      │ WebSocket Broadcaster  │
                                      │ /topic/incidents/**    │
                                      │ /topic/tasks/**        │
                                      │ /topic/notifications/**│
                                      └────────────────────────┘
```

---

## Backend Architecture

The backend follows a layered architecture.

```text
apps/backend/src/main/java/com/opspilot/platform
├── config          # Security, Kafka, WebSocket, CORS, application configuration
├── controller      # REST API controllers
├── dto             # Request/response DTOs
├── events          # Domain event models
├── exception       # Global exception handling
├── model/entity    # JPA domain entities
├── repository      # Spring Data repositories
├── security        # JWT, filters, user details, auth utilities
└── service         # Business logic, workflows, notifications, timelines
```

### Backend Concepts Demonstrated

- RESTful API design
- DTO-based request/response separation
- Service-layer business logic
- Repository abstraction
- JPA/Hibernate persistence
- JWT security filters
- Role-based authorization
- Rate limiting
- WebSocket message broadcasting
- Kafka consumers and listener container factories
- Global exception handling
- Database migration management

---

## Frontend Architecture

The frontend is built with React and Vite.

```text
apps/frontend/src
├── api             # Axios API clients
├── components      # Shared UI components
├── hooks           # Live update and notification hooks
├── pages           # Route-level pages
├── utils           # Auth helpers and utilities
└── websocket       # STOMP/SockJS socket client
```

### Frontend Concepts Demonstrated

- Protected route handling
- Role-aware sidebar rendering
- API abstraction layer
- Live notification hooks
- STOMP topic subscriptions
- Incident dashboard UI
- Team workspace UI
- Admin management UI
- Task ownership views

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool and dev server |
| React Router | Client-side routing |
| Axios | REST API communication |
| STOMP.js | WebSocket messaging client |
| SockJS | Browser-compatible WebSocket fallback |

### Backend

| Technology | Purpose |
|---|---|
| Java 17 | Backend language |
| Spring Boot | API framework |
| Spring Security | Authentication and authorization |
| JWT | Stateless API security |
| Spring Data JPA | ORM/data access |
| Hibernate | Entity persistence |
| PostgreSQL | Relational database |
| Flyway | Database migrations |
| Spring WebSocket | Real-time messaging |
| Kafka | Event-streaming infrastructure |
| Redis | Cache/rate-limit infrastructure |
| Maven | Backend dependency management |

### DevOps / Infrastructure

| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-service orchestration |
| AWS EC2 | Cloud deployment target |
| Terraform structure | Infrastructure-as-code organization |
| Swagger/OpenAPI | API documentation |
| Spring Actuator | Health monitoring |

---

## Dockerized Services

The production compose setup runs the following services:

| Service | Purpose |
|---|---|
| `opspilot-frontend` | React frontend served through containerized web server |
| `opspilot-backend` | Spring Boot REST + WebSocket API |
| `opspilot-postgres` | PostgreSQL database |
| `opspilot-redis` | Redis runtime service |
| `opspilot-kafka` | Kafka broker |
| `opspilot-zookeeper` | Kafka coordination |

---

## API Documentation

Swagger/OpenAPI is available when the backend is running:

```text
http://localhost:8080/swagger-ui/index.html
```

The API includes controllers for:

- Authentication
- Incidents
- Tasks
- Teams
- Team workspace
- Notifications
- Activity feed
- Timeline/audit views
- Admin management

---

## Health Monitoring

Spring Boot Actuator exposes health status for operational readiness:

```text
GET /actuator/health
```

The health endpoint validates key runtime dependencies such as database connectivity, disk space, mail integration, and application liveness.

---

## Database Migrations

Flyway migrations are stored at:

```text
apps/backend/src/main/resources/db/migration
```

This provides version-controlled schema evolution for users, roles, incidents, teams, tasks, notifications, comments, timelines, and audit data.

---

## Local Development Setup

### Prerequisites

- Java 17
- Maven
- Node.js
- Docker Desktop
- Git

### Clone Repository

```bash
git clone https://github.com/rahulreddyin/opspilot-platform.git
cd opspilot-platform
```

### Start with Docker Compose

```bash
docker compose up --build
```

### Local URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8080` |
| Swagger UI | `http://localhost:8080/swagger-ui/index.html` |
| Health Check | `http://localhost:8080/actuator/health` |

---

## Production Deployment Notes

The repository includes a production-oriented Docker Compose file:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Production configuration supports:

- Externalized environment variables
- EC2 public IP configuration
- Docker network isolation
- Restart policies
- PostgreSQL persistent volume
- Backend, frontend, Redis, Kafka, Zookeeper orchestration
- Mail credentials through environment variables
- JWT secret through environment variables

Sensitive values such as database passwords, JWT secrets, mail credentials, and cloud keys should be stored outside Git using environment variables or secret managers.

---

## Example Operational Workflow

```text
Admin creates users and assigns roles
   ↓
Admin creates Platform Reliability Team
   ↓
Incident Manager creates production incident
   ↓
Incident owner updates status to INVESTIGATING
   ↓
Team tasks are created and assigned
   ↓
Notifications are delivered in real time
   ↓
Activity feed and timeline are updated
   ↓
Incident is resolved and audit trail remains available
```

---

## Screenshots

Recommended screenshots to include:

1. Login / registration page
2. Admin team management
3. Incident dashboard with multiple statuses
4. Incident detail view with comments and timeline
5. Team workspace with assigned operational tasks
6. Notification drawer with unread alerts
7. Swagger API documentation
8. Docker containers running on EC2
9. Actuator health endpoint showing `UP`
10. Docker stats / runtime container proof

```text
Add screenshots under docs/screenshots/ and reference them here.
```

---

## Engineering Concepts Demonstrated

- Full-stack application architecture
- Secure JWT authentication
- Role-based authorization
- Event-oriented service design
- WebSocket real-time client synchronization
- Kafka listener/topic infrastructure
- Operational workflow modeling
- Team collaboration workflows
- Notification systems
- Timeline and audit tracking
- Dockerized deployment
- Cloud deployment readiness
- Database migration/versioning
- API documentation with Swagger
- Health monitoring with Actuator

---

## Future Enhancements

- Route all domain events through Kafka producers for a fully Kafka-first event bus
- Add Kubernetes manifests or Helm charts
- Add CI/CD pipeline using GitHub Actions or Jenkins
- Add Nginx reverse proxy with HTTPS
- Add Prometheus and Grafana monitoring
- Add dashboard analytics and charts
- Add SLA/MTTR calculations
- Add file attachments for incident evidence
- Add dead-letter queues and retry handling for Kafka events
- Add multi-tenant organization support
- Add AI-assisted incident summaries and root-cause suggestions

---

## Resume-Ready Summary

**OpsPilot Platform** is a cloud-native real-time incident response and team operations platform built with Spring Boot, React, PostgreSQL, Redis, Kafka, WebSockets, Docker, and JWT-based RBAC. It supports secure authentication, incident lifecycle management, task orchestration, team workspaces, live notifications, activity feeds, audit timelines, and Dockerized AWS-ready deployment.

---

## Author

**Rahul Reddy**

GitHub: `https://github.com/rahulreddyin`

---
