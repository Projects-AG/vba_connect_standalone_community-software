# VBA Connect — Video & Notification (Standalone Community Software)

A reusable video + notification stack that provides:
- A NestJS backend integrating with LiveKit OSS for video rooms, JWT token generation and room management.
- A React frontend with reusable components for video calling and notification management.
- Docker Compose and Azure deployment patterns for running UI + API together (nginx reverse proxy).

This repository contains ready-to-run samples and deployment helpers for local development, Docker Compose, and Azure App Service.

---

## Quick links
- Repo: https://github.com/Projects-AG/vba_connect_standalone_community-software
- Local combined UI+API (proxied by nginx): http://localhost:8080 (when using docker-compose)
- Backend API (local): http://localhost:3000
- Frontend dev server (local): http://localhost:5173
- LiveKit default URL (local): http://localhost:7880
- Swagger docs (backend): http://localhost:3000/api

---

## Separate links (project components & professional resources)
Use these links to navigate to the different parts of the project and related professional repos/images:

- This repository (community/standalone): https://github.com/Projects-AG/vba_connect_standalone_community-software
- Professional / canonical repo (reference implementation & Docker images): https://github.com/projectsag/project-loop
- Backend folder (this repo): https://github.com/Projects-AG/vba_connect_standalone_community-software/tree/main/backend
- Frontend folder (this repo): https://github.com/Projects-AG/vba_connect_standalone_community-software/tree/main/frontend
- Azure deployment docs & scripts (this repo): https://github.com/Projects-AG/vba_connect_standalone_community-software/tree/main/azure
- Docker Compose file (root): https://github.com/Projects-AG/vba_connect_standalone_community-software/blob/main/docker-compose.yml
- LiveKit OSS (server & docs): https://github.com/livekit/livekit-server
- Docker Hub image (web UI image name referenced in compose): https://hub.docker.com/r/projectsag/project-loop
- Docker Hub image (backend image name referenced in compose): https://hub.docker.com/r/projectsag/project-loop-backend
- Issues / support (this repo): https://github.com/Projects-AG/vba_connect_standalone_community-software/issues

---

## Features
- Reusable Video Communication APIs (LiveKit)
- JWT token generation for participants
- Room lifecycle APIs (create / list participants / end)
- Notification creation, listing and clear APIs
- Swagger API documentation
- Validation and layered architecture
- Docker Compose and Azure App Service deployment patterns
- React + Vite frontend with LiveKit React components and Tailwind UI

---

## Tech stack
- Backend: NestJS, TypeScript, Class Validator/Transformer, Swagger
- Video: LiveKit OSS
- Frontend: React, Vite, Tailwind CSS, LiveKit React components
- Deployment: Docker Compose, Azure App Service (one-app pattern)

---

## Repository layout (high level)
- /backend — NestJS backend (video and notifications APIs)
- /frontend — React UI components and pages (video & notifications)
- /azure — deployment scripts and guidance for Azure App Service (one app)
- /deploy — deployment helpers
- docker-compose.yml — example compose for local combined UI + API
- livekit.yaml — sample LiveKit configuration
- local-setup.ps1 — local environment bootstrap (Windows PowerShell)

---

## Getting started — Local (recommended)

Prerequisites:
- Node.js (16+ recommended)
- npm
- Docker & Docker Compose (for combined local run)
- LiveKit server (optional for full video experience)

Option A — Run everything with Docker Compose (UI + API together)
1. From repo root:
   ```bash
   docker compose up --build