# TaskWise: Smart Task Management Application

## 1. Overview

TaskWise is a modern, full-stack task management application designed to help users organize their tasks efficiently. It features a clean, intuitive user interface built with Next.js and ShadCN UI components, a robust FastAPI backend for task operations, and AI-powered smart task suggestions using Google's Genkit.

## 2. Tech Stack

- **Frontend:**
  - Next.js (React Framework with App Router)
  - TypeScript
  - Tailwind CSS
  - ShadCN UI (Component Library)
  - Lucide React (Icons)
  - Zod (Schema validation)
  - React Hook Form
- **Backend:**
  - FastAPI (Python Web Framework)
  - Pydantic (Data validation)
  - Uvicorn (ASGI server)
- **AI / GenAI:**
  - Genkit (Google AI Toolkit)
  - Google Gemini Model (for smart suggestions)
- **Development Tools:**
  - Node.js & npm
  - Python & pip
  - Concurrently (for running multiple dev servers)
  - VSCode

## 3. DB Design with ER Diagram

Currently, the FastAPI backend uses an **in-memory list** to store task data for development and demonstration purposes.

**Task Entity Attributes:**

- `id`: String (UUID, Primary Key)
- `task_title`: String (Required, max 100 chars)
- `task_description`: String (Optional, max 500 chars)
- `task_due_date`: DateTime (Optional)
- `task_status`: Enum (String: "pending", "in_progress", "completed", Required)
- `task_remarks`: String (Optional, max 200 chars)
- `created_on`: DateTime (Auto-generated)
- `last_updated_on`: DateTime (Auto-generated/updated)
- `created_by`: String (Placeholder for user association)
- `last_updated_by`: String (Placeholder for user association)

**Conceptual ER Diagram (for a future persistent database like PostgreSQL):**

```
+---------------------+
|        Task         |
+---------------------+
| PK id: UUID         |
|    task_title: VARCHAR(100) |
|    task_description: TEXT   |
|    task_due_date: TIMESTAMP |
|    task_status: VARCHAR(20) |
|    task_remarks: VARCHAR(200)|
|    created_on: TIMESTAMP  |
|    last_updated_on: TIMESTAMP |
|    created_by: VARCHAR(50)| (FK to Users table in future)
|    last_updated_by: VARCHAR(50)| (FK to Users table in future)
+---------------------+
```
*(Note: In a multi-user system, `created_by` and `last_updated_by` would be foreign keys to a `Users` table.)*

## 4. Indexing Strategy

- **Current (In-memory):** Not applicable.
- **Future (Production Database - e.g., PostgreSQL):**
  - **Primary Key:** `id` (usually automatically indexed).
  - **Frequently Queried/Filtered Fields:**
    - `task_status`: Useful for filtering tasks by their status (e.g., show all "in_progress" tasks).
    - `task_due_date`: For sorting by due date or querying tasks due within a certain range.
    - `created_by` / `user_id` (if multi-user): Essential for fetching tasks specific to a user.
  - **Text Search:**
    - `task_title` and `task_description` could benefit from full-text search indexing if complex search queries are required.

## 5. Choice of Architecture

The application follows a **Single Page Application (SPA)** architecture for the frontend, built with Next.js. This provides a fast, responsive user experience.
The backend is a **separate RESTful API service** built with FastAPI, promoting separation of concerns and scalability.

- **Frontend (Next.js):** Handles UI rendering, client-side state management, and interaction with AI services (Genkit flows running on the Next.js server environment).
- **Backend (FastAPI):** Manages data persistence (currently in-memory) and provides CRUD APIs for tasks.

This decoupled architecture allows independent development, scaling, and deployment of the frontend and backend components.

## 6. Environment Requirements

- **Node.js:** Version 18.x or later (check `package.json` engines if specified).
- **npm:** Version 8.x or later (or Yarn).
- **Python:** Version 3.8 or later.
- **pip:** For installing Python packages.
- **Git:** For version control.
- (Optional) Genkit CLI: For advanced Genkit flow development and inspection.

## 7. Build & Run Instructions

### 7.1. Initial Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Frontend Setup:**
    ```bash
    npm install
    ```

3.  **Backend Setup:**
    Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
    Create a Python virtual environment (recommended):
    ```bash
    python -m venv venv
    ```
    Activate the virtual environment:
    -   Windows: `venv\Scripts\activate`
    -   macOS/Linux: `source venv/bin/activate`
    Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    Return to the project root directory:
    ```bash
    cd ..
    ```

4.  **Environment Variables:**
    - Create a `.env` file in the project root by copying `.env.example` (if provided) or creating it manually.
    - Add the following line for the frontend to connect to the backend:
      ```
      NEXT_PUBLIC_API_URL=http://localhost:8000/api
      ```
    - The Genkit Google AI plugin typically requires `GOOGLE_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` to be set in your environment for Genkit flows. Ensure this is configured if you intend to use the AI features.

### 7.2. Running the Application (Development)

To run both the Next.js frontend and FastAPI backend concurrently:

```bash
npm run dev:full
```

This command will:
- Start the Next.js development server (usually on `http://localhost:9002`).
- Start the FastAPI development server (usually on `http://localhost:8000`).

Alternatively, you can run them in separate terminals:

- **Frontend:**
  ```bash
  npm run dev
  ```
- **Backend:**
  ```bash
  cd backend
  # Ensure virtual environment is active
  python -m uvicorn app.main:app --reload --port 8000
  # or npm run backend:dev from the root directory
  ```

### 7.3. Building for Production

- **Frontend (Next.js):**
  ```bash
  npm run build
  ```
  This creates an optimized build in the `.next` folder.

- **Backend (FastAPI):**
  Packaging depends on the deployment strategy (e.g., Docker container). No specific build command for FastAPI itself, but you'd typically package the Python code and dependencies.

## 8. Deployment Architecture

This application can be deployed using various strategies:

- **Frontend (Next.js):**
  - **Vercel (Recommended for Next.js):** Native support, CI/CD, serverless functions.
  - **Netlify:** Similar to Vercel, good for static and dynamic sites.
  - **AWS:** S3 (for static assets) + CloudFront (CDN) + Lambda@Edge or EC2/ECS/Fargate (for Next.js server).
  - **Google Cloud:** Cloud Storage + Cloud CDN + Cloud Functions/Cloud Run.
  - **Self-hosted:** Using a Node.js server (e.g., with PM2).

- **Backend (FastAPI):**
  - **Docker Container:** Package the FastAPI app into a Docker image.
    - **Cloud Run (Google Cloud):** Fully managed serverless platform for containers.
    - **AWS ECS/Fargate:** Orchestrate Docker containers on AWS.
    - **Azure Container Instances/AKS:** Microsoft Azure options.
  - **Platform as a Service (PaaS):**
    - **Google App Engine:** Python environment.
    - **Heroku:** Dynos for Python apps.
  - **Virtual Machines (VMs):** EC2 (AWS), Compute Engine (GCP), Azure VMs. Deploy with Gunicorn + Uvicorn behind a reverse proxy like Nginx.

- **Genkit Flows:**
  - If used as part of the Next.js server (server actions, API routes), they are deployed with the Next.js application.
  - If deployed as separate Genkit flows, Google Cloud Functions or Cloud Run can be used.

**Example Production Setup (Google Cloud):**
- Next.js frontend deployed to Vercel (or Cloud Run).
- FastAPI backend deployed as a Docker container on Cloud Run.
- (Optional) Persistent Database: Cloud SQL (PostgreSQL/MySQL) or Firestore/MongoDB.
- API Gateway (e.g., Google Cloud API Gateway) in front of the FastAPI backend for security, rate limiting, etc.

## 9. Data Migration Scripts

- Currently not applicable as the backend uses in-memory storage.
- If a persistent database is introduced, migration scripts (e.g., using Alembic for SQLAlchemy, or custom scripts) would be necessary for schema changes and data transformations.

## 10. Site Readiness Checklist

Before going live or deploying to a new environment:

- **[ ] Environment Configuration:**
  - [ ] Node.js and Python versions meet requirements.
  - [ ] All dependencies installed (frontend: `npm install`, backend: `pip install -r requirements.txt`).
  - [ ] `.env` file (or equivalent environment variables) correctly configured for:
    - `NEXT_PUBLIC_API_URL` (pointing to the deployed backend).
    - `GOOGLE_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` for Genkit.
    - Any database connection strings (for future persistent DB).
    - Secret keys or other sensitive configurations.
- **[ ] Backend API:**
  - [ ] FastAPI backend is running and accessible.
  - [ ] CORS is correctly configured for the frontend domain.
- **[ ] Frontend Application:**
  - [ ] Next.js application builds successfully (`npm run build`).
  - [ ] All links and navigation are working.
  - [ ] API calls point to the correct backend endpoints.
- **[ ] AI Features (Genkit):**
  - [ ] Genkit flows are operational.
  - [ ] Necessary API keys (e.g., Google AI) are in place and valid.
- **[ ] Database (Future):**
  - [ ] Database server is running and accessible.
  - [ ] Schema is migrated to the latest version.
  - [ ] Initial data (if any) is seeded.
- **[ ] Testing:**
  - [ ] All UAT (User Acceptance Testing) cases pass.
  - [ ] Performance testing (load testing) conducted if high traffic is expected.
  - [ ] Security checks performed (e.g., input validation, protection against common web vulnerabilities).
- **[ ] Logging & Monitoring:**
  - [ ] Logging is set up for both frontend and backend to capture errors and important events.
  - [ ] Monitoring tools are in place to track application health and performance.

## 11. UAT (User Acceptance Testing) Instructions

Verify the following functionalities:

1.  **Application Loading:**
    - Open the application URL in a browser.
    - **Expected:** The TaskWise application loads, displaying the header, search bar, and an empty task list (or tasks from the backend if pre-populated).

2.  **Create Task:**
    - Click the "Add Task" button.
    - Fill in the task title (e.g., "My New Test Task").
    - Optionally, fill in description, due date, status, and remarks.
    - Click "Add Task" in the dialog.
    - **Expected:** The dialog closes, a success toast message appears, and the new task is visible in the task list with the correct details.

3.  **Read Tasks:**
    - **Expected:** All existing tasks are displayed in the list with their title, status, due date, and last updated timestamp. Descriptions are shown below titles.

4.  **Update Task:**
    - Click the "Edit" (pencil) icon for an existing task.
    - Modify some fields (e.g., change the title, update the status to "In Progress").
    - Click "Save Changes".
    - **Expected:** The dialog closes, a success toast message appears, and the task list updates to show the modified task details.

5.  **Delete Task:**
    - Click the "Delete" (trash) icon for an existing task.
    - A confirmation dialog appears.
    - Click "Delete" in the confirmation dialog.
    - **Expected:** The dialog closes, a success toast message (destructive variant) appears, and the task is removed from the list.

6.  **Search Tasks:**
    - Type a keyword (e.g., part of a task title or description) into the search bar.
    - **Expected:** The task list filters dynamically to show only tasks matching the search query. Clearing the search bar shows all tasks again.

7.  **Smart Task Suggestions (AI):**
    - Ensure some tasks exist in the list.
    - Click the "Smart Suggestions" button in the header.
    - The Smart Suggestions section should appear.
    - Click "Get Suggestions" (if tasks exist).
    - **Expected:** AI-generated task suggestions appear based on the existing tasks. A loading indicator shows while suggestions are being fetched.
    - Click "Add Task" next to a suggested task.
    - **Expected:** The suggested task is added to the main task list with "Pending" status and "AI Suggested" remarks.

8.  **Form Validation:**
    - Try to create/edit a task with an empty title.
    - **Expected:** An error message appears below the title field, and the form does not submit.
    - Try to enter overly long text in fields with character limits.
    - **Expected:** Validation prevents submission or an error is shown (depending on exact UI implementation).

9.  **Responsiveness:**
    - View the application on different screen sizes (desktop, tablet, mobile).
    - **Expected:** The layout adapts gracefully, and all functionalities remain usable.

## 12. Go Live Steps

1.  **[ ] Final Code Freeze:** No new features, only critical bug fixes.
2.  **[ ] Complete Final UAT:** Ensure all test cases are passed and signed off by stakeholders.
3.  **[ ] Backup (if applicable):** If migrating from an old system or if there's existing production data, perform a full backup.
4.  **[ ] Production Build:**
    - Frontend: `npm run build`
    - Backend: Package FastAPI app (e.g., build Docker image).
5.  **[ ] Configure Production Environment Variables:**
    - Set `NODE_ENV=production` for Next.js.
    - Ensure `NEXT_PUBLIC_API_URL` points to the production backend URL.
    - Configure all necessary API keys (Google AI, etc.) for the production environment.
    - Set up database connection strings for the production database (if applicable).
    - Configure any other production-specific settings (e.g., logging levels, secret keys).
6.  **[ ] Deploy Backend:**
    - Deploy the FastAPI application to the chosen production infrastructure (e.g., Cloud Run, ECS, App Engine).
    - Verify backend health and accessibility.
7.  **[ ] Deploy Frontend:**
    - Deploy the Next.js application to the chosen production infrastructure (e.g., Vercel, Netlify, Cloud Run).
8.  **[ ] Data Migration (if applicable):**
    - Run any necessary data migration scripts to set up the production database schema and import initial/migrated data.
9.  **[ ] DNS Configuration:**
    - Point your domain name (e.g., `taskwise.yourdomain.com`) to the deployed frontend application.
    - Ensure SSL/TLS certificate is active.
10. **[ ] Smoke Testing in Production:**
    - Perform a quick round of tests on the live production environment to ensure core functionalities are working as expected.
    - Check for console errors in the browser and server logs.
11. **[ ] Monitoring Setup:**
    - Ensure logging and monitoring tools are active and collecting data from the production environment.
    - Set up alerts for critical errors or performance issues.
12. **[ ] Announce Go-Live:** Inform users and stakeholders that the application is live.
13. **[ ] Post-Go-Live Monitoring:** Closely monitor the application for any issues during the initial period after launch.
