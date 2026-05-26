# Git Branching Strategy

To maintain a clean and professional repository, Dharma follows a structured Git branching strategy.

## Main Branches

1. `main`
   - Represents the production-ready code.
   - Code from `dev` is merged here only after thorough testing.
   - Always deployable.

2. `dev`
   - The integration branch for new features and bug fixes.
   - This is the default branch for pull requests (PRs) from feature branches.

## Feature Branches

When starting work on a new feature or bug fix, always branch off from `dev`. Use the following naming convention:

- `feature/login`
- `feature/ai-assistant`
- `feature/automation-rules`
- `feature/analytics-dashboard`
- `feature/notifications`
- `bugfix/fix-login-error`

### Workflow Example

1. Switch to the `dev` branch and pull the latest changes:
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. Create a new feature branch:
   ```bash
   git checkout -b feature/analytics-dashboard
   ```

3. Make your changes, commit them, and push the branch to GitHub:
   ```bash
   git push origin feature/analytics-dashboard
   ```

4. Open a Pull Request on GitHub to merge `feature/analytics-dashboard` into the `dev` branch.

5. After review and testing, the PR is merged into `dev`. Periodic releases merge `dev` into `main`.

This strategy keeps the git history clean, avoids conflicts on the main branch, and ensures a stable `main` branch.
