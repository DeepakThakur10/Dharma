# Automation Rule Engine

The Automation Rule Engine is a core feature of Dharma designed to reduce repetitive manual work and increase team efficiency.

## How It Works

Users can define specific **Triggers** and corresponding **Actions** on a per-project basis.

1. **Triggers:** The backend constantly watches for specific events to happen on task updates or creation.
2. **Conditions (Optional):** Ensure the automation only runs on specific types of tasks (e.g., high priority tasks).
3. **Actions:** The operation that takes place automatically when criteria are met.

## Example Automation Rule

A typical rule might look like this:

> **WHEN** task status changes to "Done"  
> **THEN** notify team channel

### Mechanism
- When a user moves a task in the React Kanban board to the "Done" lane, it triggers a `PUT /api/tasks/:id` request.
- The `taskController` updates the database.
- Immediately after, the controller invokes the `taskService` to check if any automation rules in the given project contain a `status === "Done"` trigger.
- If found, the defined action executes (such as creating a notification record in the database for team members).
