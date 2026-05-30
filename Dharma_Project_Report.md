# Project Report

## Topic:
Dharma - MERN Project Management Platform

Submitted by: Deepak Thakur  
Project: Dharma  
Domain: Full Stack Web Development and DevOps

---

## Table of Contents
1. Introduction
   - 1.1 Project Overview
   - 1.2 Problem Statement
   - 1.3 Objectives
   - 1.4 Scope
2. System Requirements
   - 2.1 Hardware Requirements
   - 2.2 Software Requirements
3. Workflow
4. Implementation
   - 4.1 Project Setup
   - 4.2 Backend Implementation
   - 4.3 Frontend Implementation
   - 4.4 Authentication and Security
   - 4.5 Docker and Nginx Configuration
   - 4.6 Monitoring Stack (Prometheus, Grafana, Node Exporter, cAdvisor)
   - 4.7 Jenkins CI Pipeline
   - 4.8 GitHub Actions CI/CD Pipeline
   - 4.9 Cloud Deployment (Render + GHCR)
5. Results and Output
6. Future Scope
7. Conclusion

---

## Chapter 1 - Introduction

### 1.1 Project Overview
Dharma is a MERN-based project management platform designed to help teams plan, execute, and monitor work in a centralized environment. It combines core productivity features such as task tracking, workspace collaboration, analytics, notifications, and role-aware access control.

The project integrates modern engineering practices including containerization with Docker, reverse proxy setup using Nginx, automated CI/CD with GitHub Actions and Jenkins, and observability through Prometheus and Grafana.

### 1.2 Problem Statement
Many teams rely on separate tools for authentication, task execution, communication, analytics, and deployment monitoring. This creates fragmentation, manual overhead, and poor visibility into project health.

There is a need for a single, modular platform that unifies team workflow, supports secure API-driven architecture, and includes deployment-ready DevOps and monitoring capabilities.

### 1.3 Objectives
The objectives of Dharma are:
- Build a full-stack project management platform using MERN.
- Provide secure cookie-first authentication and protected APIs.
- Support workspaces, tasks, notifications, analytics, and billing workflows.
- Enable containerized local deployment using Docker Compose.
- Integrate CI/CD pipelines for automated validation and delivery.
- Add infrastructure and application monitoring using Prometheus and Grafana.

### 1.4 Scope
The project is intended for students, developers, startup teams, and small organizations needing a practical and production-ready PM system.

Current scope includes:
- User authentication and session management
- Workspace and task lifecycle management
- Activity, analytics, and notifications
- Billing and AI-assisted modules
- Dockerized deployment and health monitoring
- CI/CD automation and cloud deployment

---

## Chapter 2 - System Requirements

### 2.1 Hardware Requirements
| Component | Requirement |
|---|---|
| Processor | Intel i5 / Ryzen 5 or higher |
| RAM | 8 GB minimum (16 GB recommended) |
| Storage | 20 GB free disk space |
| Internet | Required for package install and cloud deployment |

### 2.2 Software Requirements
| Software | Version |
|---|---|
| OS | Windows / Linux / macOS |
| Node.js | 20+ |
| npm | Latest stable |
| Docker Desktop | Latest stable |
| Docker Compose | v2+ |
| MongoDB | Local or Atlas |
| Git | Latest |
| GitHub | Repository + Actions |
| Jenkins | LTS (optional CI integration) |
| Render | Cloud runtime |

---

## Chapter 3 - Workflow

Project workflow:
1. Developer updates code in local branch.
2. Code is pushed to GitHub repository.
3. GitHub Actions runs frontend/backend validation.
4. Docker images are built and pushed to GHCR and Docker Hub.
5. Deployment trigger is sent to Render services.
6. Render updates backend and frontend containers.
7. Monitoring stack captures runtime and system metrics.
8. Team uses Dharma dashboard for project operations.

High-level pipeline:

Developer -> GitHub -> GitHub Actions -> Docker Registry -> Render -> Runtime Monitoring -> User Access

---

## Chapter 4 - Implementation

### 4.1 Project Setup
Major modules:
- `Frontend/` (React + Vite + Tailwind + Zustand + React Query)
- `backend/` (Node.js + Express + Mongoose + JWT + services)
- `docs/` (architecture and deployment docs)
- `docker-compose.yml` (multi-service local orchestration)
- `.github/workflows/ci.yml` (CI/CD automation)
- `Jenkinsfile` (simple Jenkins pipeline)
- `monitoring/` (Prometheus and Grafana provisioning)

### 4.2 Backend Implementation
Backend follows layered architecture:
- Routes -> Controllers -> Services -> Models
- MongoDB models for users, tasks, workspaces, automation, billing, logs
- `/api` namespace for all routes
- Health endpoint: `/api/health`
- Metrics endpoint: `/metrics` using `prom-client`

### 4.3 Frontend Implementation
Frontend includes:
- Auth pages (register/login/invite acceptance)
- Dashboard layout with workspace-aware navigation
- Task views (kanban, list-style operations)
- Analytics, chat, notifications, billing, settings
- Axios API layer with cookie-enabled requests and `/api` compatibility

### 4.4 Authentication and Security
Security implementation includes:
- JWT token in HttpOnly cookies
- Route protection middleware
- RBAC middleware for workspace roles
- Helmet and rate limiter for API protection
- CORS restricted via `FRONTEND_URL`

### 4.5 Docker and Nginx Configuration
Docker setup runs:
- MongoDB
- Backend API
- Frontend Nginx service

Nginx handles:
- Static frontend hosting
- Reverse proxy from `/api` to backend
- HTTPS upstream compatibility for Render-targeted backend URLs

### 4.6 Monitoring Stack (Prometheus, Grafana, Node Exporter, cAdvisor)
Monitoring services added in Docker Compose:
- Prometheus (`:9090`) for scraping/storing metrics
- Grafana (`:3001`) for visualization
- Node Exporter (`:9100`) for host-level metrics
- cAdvisor (`:8080`) for Docker/container metrics

Prometheus scrape targets:
- `backend:5000/metrics`
- `node-exporter:9100/metrics`
- `cadvisor:8080/metrics`

Grafana datasource is auto-provisioned to Prometheus.

### 4.7 Jenkins CI Pipeline
A simple root Jenkinsfile performs:
- Checkout
- Frontend and backend dependency install
- Frontend lint/build
- Backend lint/test (if present)
- Docker Compose config validation

### 4.8 GitHub Actions CI/CD Pipeline
The CI/CD workflow includes:
- Frontend validation (lint + build)
- Backend validation
- Docker buildx image push to GHCR and Docker Hub
- Render deployment trigger for backend/frontend services using API keys and service IDs

### 4.9 Cloud Deployment (Render + GHCR)
Deployment architecture:
- Container images hosted on GHCR and Docker Hub
- Render services consume latest image tags
- GitHub Actions sends deployment API requests to Render
- Backend and frontend redeploy automatically after successful CI

---

## Chapter 5 - Results and Output

Key outcomes achieved:
- End-to-end MERN platform running successfully
- Stable login/auth flow after proxy and deployment fixes
- Fully passing CI/CD workflow with Docker + deploy stages
- Container images published through automated pipelines
- Render services updated through automated API-triggered redeploy
- Monitoring stack integrated for local observability

Operational checks:
- `/api/health` responds with backend and DB status
- `/metrics` exports Prometheus metrics
- Prometheus targets reachable
- Grafana datasource auto-configured

---

## Chapter 6 - Future Scope

Potential enhancements:
- Kubernetes deployment with Helm charts
- Alertmanager integration for production alerts
- OpenTelemetry traces and distributed request correlation
- Multi-tenant enterprise role templates
- Fine-grained audit dashboards
- Mobile app support
- Advanced billing plans and usage metering

---

## Chapter 7 - Conclusion

Dharma demonstrates a complete full-stack engineering workflow from product features to DevOps and monitoring. The project combines MERN application development with production-ready practices such as containerization, CI/CD automation, secure authentication, and observability.

The platform is modular, scalable, and suitable for iterative feature growth. With the current architecture and deployment maturity, Dharma is positioned for both academic presentation and real-world expansion.

---

## Appendix (Optional for Submission)

Suggested dashboard IDs for Grafana imports:
- Node Exporter Full: `1860`
- cAdvisor Exporter: `14282`
- NodeJS Application Dashboard: `11159`

