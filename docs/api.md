# Dharma API Documentation

This document serves as an overview to important REST APIs provided by the Dharma Backend.

## Authentication
`POST /api/auth/register` - Create a new user.
`POST /api/auth/login` - Authenticate an existing user and return a JWT.
`GET /api/auth/me` - Get details of the currently logged in user.

## Projects
`GET /api/projects` - List all projects the user is part of.
`POST /api/projects` - Create a new project.
`GET /api/projects/:id` - View details of a specific project.
`PUT /api/projects/:id` - Update a project.
`DELETE /api/projects/:id` - Delete a project.

## Tasks
`GET /api/projects/:projectId/tasks` - List all tasks within a project.
`POST /api/projects/:projectId/tasks` - Create a new task in a project.
`PUT /api/tasks/:id` - Update an existing task (e.g., changing its status in the Kanban board).
`DELETE /api/tasks/:id` - Delete a task.

## Automation Rules
`GET /api/projects/:projectId/automations` - List all rules associated with a project.
`POST /api/projects/:projectId/automations` - Create a new automation rule.
`PUT /api/automations/:id` - Edit a rule.
`DELETE /api/automations/:id` - Delete an automation rule.

## Analytics
`GET /api/projects/:projectId/analytics` - Fetch task summaries, completion rates, and other metrics to display on the Analytics Dashboard.
