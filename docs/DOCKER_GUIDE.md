# Docker Desktop Usage Guide

This guide explains how to run Dharma as two standalone Docker images: one for the backend API and one for the frontend Nginx server.

## Prerequisites

- Docker Desktop installed on your machine
- Git if you need to clone the repository

## Build the Images

Run these from the project root:

```bash
docker build -t dharma-backend ./backend
docker build -t dharma-frontend ./Frontend
```

## Run the Containers

Create a shared network so the frontend can resolve the backend container by name:

```bash
docker network create dharma-net
```

Start MongoDB:

```bash
docker run -d --name mongo --network dharma-net -v mongo_data:/data/db mongo:7
```

Start the backend:

```bash
docker run -d --name backend --network dharma-net --env-file ./.env -p 5000:5000 dharma-backend
```

Start the frontend:

```bash
docker run -d --name frontend --network dharma-net -p 3000:80 dharma-frontend
```

## Access the Application

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)

## Management

- Stop containers: `docker stop frontend backend mongo`
- Remove containers: `docker rm frontend backend mongo`
- Remove the network: `docker network rm dharma-net`

## Troubleshooting

- Ensure ports `3000` and `5000` are free before starting the containers.
- Confirm the backend container is named `backend`, or update the Nginx proxy target in [Frontend/nginx/default.conf](../Frontend/nginx/default.conf).
- Ensure `MONGO_URI` points to the MongoDB container if you are not using Atlas.
