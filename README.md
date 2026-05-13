<div align="center">

# OpsPilot Platform

### Enterprise DevOps Incident Management & Team Collaboration System

A production-style full-stack operational management platform inspired by real-world Site Reliability Engineering (SRE), DevOps, and cloud operations workflows.

Built using Spring Boot, React, PostgreSQL, Kafka, WebSockets, Docker, and enterprise-grade backend architecture principles.

---

![Java](https://img.shields.io/badge/Java-17-red)
![Spring Boot](https://img.shields.io/badge/SpringBoot-3.x-brightgreen)
![React](https://img.shields.io/badge/React-Frontend-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Kafka](https://img.shields.io/badge/Kafka-EventStreaming-black)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![WebSockets](https://img.shields.io/badge/Realtime-WebSockets-success)

</div>

---

# Overview

OpsPilot Platform is a modern enterprise-style operational management system designed to simulate the workflows used by real DevOps teams, Site Reliability Engineering (SRE) organizations, cloud infrastructure teams, and operational support platforms.

The platform provides secure authentication, role-based authorization, operational incident management, task orchestration, real-time activity feeds, live notifications, collaborative team workspaces, audit logging, Kafka-powered event streaming, and WebSocket-based real-time communication.

The system was architected using scalable backend design patterns, distributed system concepts, event-driven workflows, and containerized deployment architecture to closely resemble production-ready enterprise software platforms.

---

# Core Platform Objectives

The primary goals of the platform are:

- Simulate enterprise DevOps operational workflows
- Demonstrate scalable backend architecture
- Implement event-driven distributed communication
- Build secure authentication and authorization systems
- Support real-time operational collaboration
- Provide production-style Dockerized infrastructure
- Demonstrate Kafka event streaming integration
- Implement enterprise-grade API design practices
- Create a scalable and modular frontend architecture
- Showcase modern full-stack engineering practices

---

# Enterprise Features

---

# Authentication & Authorization System

The platform includes a complete enterprise-grade authentication and authorization layer.

## Features

### JWT Authentication
- Stateless authentication system
- Secure token generation
- Token-based API authorization
- Protected REST endpoints
- Session-independent security architecture

### Role-Based Access Control (RBAC)
The platform supports multiple operational roles:

| Role | Responsibilities |
|---|---|
| ADMIN | Full platform administration |
| USER | Standard operational access |
| TEAM_LEAD | Team coordination and management |
| INCIDENT_MANAGER | Incident lifecycle management |

### Security Features
- BCrypt password hashing
- JWT authorization filters
- Protected frontend routes
- Role-based endpoint restrictions
- Secure authentication middleware
- Validation-based request handling
- Exception-safe authentication flows

### Email Verification System
- OTP verification workflows
- Registration verification
- Secure verification tokens
- Email-based user validation
- Registration confirmation system

---

# Incident Management System

The incident management module was designed to simulate real operational incident handling systems used in enterprise production environments.

## Capabilities

### Incident Lifecycle Management
- Create incidents
- Assign incident owners
- Track operational incidents
- Update incident states
- Maintain incident timelines
- Capture operational activity
- Stream incident events in real time

### Severity Classification

| Severity | Description |
|---|---|
| LOW | Minor operational issue |
| MEDIUM | Moderate system degradation |
| HIGH | Significant operational impact |
| CRITICAL | Major production outage |

### Incident States

| State | Description |
|---|---|
| OPEN | Incident created |
| INVESTIGATING | Root cause analysis in progress |
| IN_PROGRESS | Active remediation |
| RESOLVED | Issue resolved |
| CLOSED | Incident finalized |

### Operational Features
- Real-time incident updates
- Timeline tracking
- Collaborative operational workflows
- Team ownership support
- Activity feed integration
- Kafka-based incident event publishing

---

# Task Orchestration System

The task management module enables operational task coordination across teams.

## Features

### Task Management
- Create operational tasks
- Assign tasks to users
- Track task ownership
- Bulk task creation
- Due date tracking
- Task prioritization
- Real-time task updates

### Task Priorities

| Priority | Usage |
|---|---|
| LOW | Routine operations |
| MEDIUM | Standard operational work |
| HIGH | High-priority operational work |

### Task Status Workflow

| Status | Description |
|---|---|
| TODO | Pending work |
| IN_PROGRESS | Active execution |
| DONE | Completed work |

### Security Rules
- Ownership-based access validation
- Team-based operational permissions
- Role-restricted task administration
- Secure assignment validation

---

# Team Collaboration Workspace

OpsPilot includes collaborative operational workspaces designed for team-based execution and coordination.

## Features

### Team Management
- Create teams
- Assign users to teams
- Bulk user assignment
- Team ownership workflows
- Role promotion support

### Collaboration Features
- Shared operational visibility
- Team activity feeds
- Cross-user coordination
- Shared operational dashboards
- Workspace-level collaboration

### Team Administration
- Team-level access control
- Membership management
- Administrative oversight
- User performance tracking

---

# Real-Time Communication Architecture

The platform includes enterprise-style real-time infrastructure using Kafka and WebSockets.

---

# Kafka Event Streaming

Kafka powers the distributed event architecture of the platform.

## Kafka Responsibilities
- Incident event streaming
- Task activity streaming
- Notification event pipelines
- Distributed operational messaging
- Activity event propagation
- Real-time backend event processing

## Kafka Topics
Examples include:
- incident-created
- incident-status-updated
- task-created
- task-status-updated
- activity-events
- notification-events

---

# WebSocket Infrastructure

WebSockets provide live operational updates across the frontend.

## Real-Time Features
- Instant notification delivery
- Live activity feeds
- Real-time dashboard updates
- Operational collaboration events
- Notification synchronization

---

# Notification System

The notification module provides centralized operational alerts.

## Features
- Live notifications
- Real-time unread counters
- Event-driven alerts
- Operational activity notifications
- WebSocket-powered updates

---

# Audit Logging System

The platform includes a centralized audit tracking architecture.

## Logged Activities
- User role changes
- Team assignments
- Incident updates
- Task updates
- Administrative operations
- Security-related actions

## Audit Benefits
- Operational traceability
- Administrative visibility
- Historical activity tracking
- Security auditing support

---

# Admin Management Module

Administrative APIs provide centralized platform management.

## Administrative Features
- View all users
- Create teams
- Assign users to teams
- Bulk team assignment
- Promote user roles
- Bulk role promotion
- Monitor operational activity
- View audit logs
- Track team performance

---

# Backend Architecture

The backend follows scalable layered architecture principles commonly used in enterprise systems.

---

# Backend Technology Stack

| Technology | Purpose |
|---|---|
| Java 17 | Core backend language |
| Spring Boot | Backend application framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | ORM abstraction |
| Hibernate | Database ORM |
| PostgreSQL | Relational database |
| Flyway | Database migrations |
| Kafka | Event streaming |
| WebSockets | Real-time communication |
| Maven | Dependency management |

---

# Backend Architectural Patterns

## Layered Architecture
The backend follows:
- Controller layer
- Service layer
- Repository layer
- Domain model layer
- DTO abstraction layer

## Design Principles
- Separation of concerns
- Modular service architecture
- Stateless authentication
- Event-driven communication
- RESTful API standards
- Centralized exception handling

---

# Frontend Architecture

The frontend provides operational dashboards and real-time collaboration interfaces.

---

# Frontend Technology Stack

| Technology | Purpose |
|---|---|
| React | UI framework |
| Vite | Frontend build tool |
| React Router | Routing |
| Axios | API communication |
| JavaScript | Frontend logic |

---

# Frontend Features

## User Interface Modules
- Login system
- Registration workflow
- Incident dashboards
- Team workspace pages
- Notification center
- Activity feeds
- Admin management pages

## Frontend Capabilities
- Protected routes
- Role-based UI rendering
- Real-time updates
- API abstraction layer
- Notification synchronization
- Operational dashboards

---

# Database Architecture

PostgreSQL is used as the centralized relational database system.

---

# Database Responsibilities

The database manages:
- Users
- Teams
- Roles
- Incidents
- Tasks
- Notifications
- Audit logs
- Verification tokens
- Comments
- Operational metadata

---

# Database Migration System

Flyway is used for schema versioning and migration management.

## Migration Features
- Version-controlled schema changes
- Incremental database evolution
- Consistent deployment state
- Migration rollback safety

## Migration Location

```text
apps/backend/src/main/resources/db/migration
```

---

# Dockerized Infrastructure

The platform is fully containerized using Docker and Docker Compose.

---

# Docker Services

| Service | Responsibility |
|---|---|
| PostgreSQL | Persistent relational storage |
| Kafka | Event streaming infrastructure |
| Zookeeper | Kafka coordination |
| Backend | Spring Boot API |
| Frontend | React application |

---

# Docker Compose Responsibilities

Docker Compose manages:
- Service orchestration
- Internal networking
- Container startup sequencing
- Persistent volumes
- Environment configuration

---

# System Architecture

```text
                         +----------------------+
                         |      Frontend        |
                         |    React + Vite UI   |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |    Spring Boot API   |
                         | Authentication Layer |
                         | Operational Services |
                         +----------+-----------+
                                    |
             +----------------------+----------------------+
             |                                             |
             v                                             v
 +------------------------+                 +------------------------+
 |      PostgreSQL        |                 |         Kafka          |
 | Relational Persistence |                 | Distributed Messaging  |
 +------------------------+                 +------------------------+
                                                        |
                                                        v
                                         +---------------------------+
                                         |      WebSocket Layer      |
                                         | Real-Time Notifications   |
                                         +---------------------------+
```

---

# Project Structure

```text
opspilot-platform/
│
├── apps/
│   │
│   ├── backend/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── Maven configuration
│   │
│   └── frontend/
│       ├── src/
│       ├── public/
│       ├── Dockerfile
│       └── Vite configuration
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# Running the Application

---

# Prerequisites

Install the following before starting:

- Docker Desktop
- Git
- Java 17
- Maven
- Node.js

---

# Clone Repository

```bash
git clone https://github.com/rahulreddyin/opspilot-platform.git
cd opspilot-platform
```

---

# Start Entire Platform

```bash
docker compose up --build
```

---

# Application Endpoints

## Frontend
```text
http://localhost:5173
```

## Backend API
```text
http://localhost:8080
```

---

# Security Architecture

The platform implements multiple security layers.

## Security Components
- JWT token authentication
- BCrypt password encryption
- Authorization filters
- Protected APIs
- Role-based access control
- Secure verification workflows
- Validation handling
- Exception-safe authentication

---

# Scalability Considerations

The platform was designed with scalability and distributed system concepts in mind.

## Scalable Components
- Kafka event streaming
- Stateless authentication
- Modular backend services
- Dockerized infrastructure
- WebSocket event broadcasting
- Distributed communication patterns

---

# Enterprise Engineering Concepts Demonstrated

This platform demonstrates practical implementation of:

- Distributed systems
- Event-driven architecture
- Real-time communication
- Operational workflow systems
- DevOps tooling concepts
- Secure authentication systems
- Role-based authorization
- Dockerized deployments
- Kafka messaging systems
- Modular backend design
- Enterprise REST API architecture
- Team collaboration systems

---

# Future Enhancements

Planned future improvements include:

- Kubernetes deployment
- AWS ECS deployment
- CI/CD pipelines
- Redis caching
- Prometheus metrics
- Grafana monitoring
- Elasticsearch integration
- SLA tracking
- File attachments
- Multi-tenant support
- AI-powered operational insights
- Advanced analytics dashboards
- Infrastructure observability

---

# Screenshots

Add screenshots here:

- Login Page
- Dashboard
- Incident Management
- Team Workspace
- Notifications
- Activity Feed
- Admin Dashboard

---

# Author

## Rahul Reddy

GitHub:
https://github.com/rahulreddyin

---

# License

This project is intended for educational, portfolio, and demonstration purposes.