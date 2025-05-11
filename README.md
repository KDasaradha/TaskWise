# TaskWise: Smart Task Management Application

## 1. Overview

TaskWise is a modern, full-stack task management application designed to help users organize their tasks efficiently. It features a clean, intuitive user interface built with Next.js and ShadCN UI components, a robust FastAPI backend for task operations using SQLite, and AI-powered smart task suggestions using Google's Genkit.

## 2. Tech Stack

- **Frontend:**
  - Next.js (React Framework with App Router)
  - TypeScript
  - Tailwind CSS
  - ShadCN UI (Component Library)
  - Lucide React (Icons)
  - Zod (Schema validation)
  - React Hook Form
  - Axios (HTTP client)
- **Backend:**
  - FastAPI (Python Web Framework)
  - Pydantic (Data validation)
  - Uvicorn (ASGI server)
  - SQLite (Database via aiosqlite for async operations)
- **AI / GenAI:**
  - Genkit (Google AI Toolkit)
  - Google Gemini Model (for smart suggestions)
- **Development Tools:**
  - Node.js & pnpm (Package manager)
  - Python & pip
  - Concurrently (for running multiple dev servers)
  - VSCode

## 3. DB Design with ER Diagram

The application uses an **SQLite database** for storing task data. SQLite is a C-library that provides a lightweight disk-based database that doesn’t require a separate server process.

### 3.1 Data Dictionary (Task Entity)

The table below outlines the attributes for the `tasks` table in SQLite:

| Field             | SQLite Type | Pydantic Type (Backend) | Description                                                                   | Constraints/Notes              |
|-------------------|-------------|-------------------------|-------------------------------------------------------------------------------|--------------------------------|
| `id`              | `TEXT`      | `str` (UUID)            | Primary Key, Unique identifier for the task                                   | `PRIMARY KEY`                  |
| `task_title`      | `TEXT`      | `str`                   | Title of the task                                                             | `NOT NULL`, max 100 chars      |
| `task_description`| `TEXT`      | `Optional[str]`         | Detailed description of the task                                              | Max 500 chars                  |
| `task_due_date`   | `TEXT`      | `Optional[datetime]`    | Deadline for task completion, stored as ISO 8601 string                       | `NULLABLE`                     |
| `task_status`     | `TEXT`      | `TaskStatus` (Enum)     | Current status of the task (e.g., "pending", "in_progress", "completed")      | `NOT NULL`                     |
| `task_remarks`    | `TEXT`      | `Optional[str]`         | Additional remarks or comments                                                | Max 200 chars, `NULLABLE`      |
| `created_on`      | `TEXT`      | `datetime`              | Timestamp of task creation, stored as ISO 8601 string                         | `NOT NULL`                     |
| `last_updated_on` | `TEXT`      | `datetime`              | Timestamp of last update, stored as ISO 8601 string                           | `NOT NULL`                     |
| `created_by`      | `TEXT`      | `str`                   | Name/ID of creator (Placeholder for user association, e.g., "User", "Admin")  | `NULLABLE`                     |
| `last_updated_by` | `TEXT`      | `str`                   | Name/ID of last editor (Placeholder for user association)                     | `NULLABLE`                     |

*(Note: Datetime values are stored as ISO 8601 formatted strings in SQLite and are converted to/from Python `datetime` objects by the application logic.)*

### 3.2 Conceptual ER Diagram (SQLite - Single Table)

```
+---------------------+
|        Task         |
+---------------------+
| PK id: TEXT         |  // UUID stored as string
|    task_title: TEXT NOT NULL |
|    task_description: TEXT   |
|    task_due_date: TEXT    |  // ISO 8601 DateTime string or NULL
|    task_status: TEXT NOT NULL |  // "pending", "in_progress", "completed"
|    task_remarks: TEXT     |
|    created_on: TEXT NOT NULL |  // ISO 8601 DateTime string
|    last_updated_on: TEXT NOT NULL | // ISO 8601 DateTime string
|    created_by: TEXT       |
|    last_updated_by: TEXT  |
+---------------------+
```
(Since it's a single-table design for now, the ER diagram is straightforward.)

## 4. Indexing Strategy (SQLite)

- **Primary Key:** `id` (automatically indexed by SQLite as it's the `PRIMARY KEY`).
- **Frequently Queried/Filtered Fields:**
  - `task_status`: Useful for filtering tasks by their status.
    ```sql
    CREATE INDEX IF NOT EXISTS idx_task_status ON tasks (task_status);
    ```
  - `task_due_date`: For sorting by due date or querying tasks due within a certain range.
    ```sql
    CREATE INDEX IF NOT EXISTS idx_task_due_date ON tasks (task_due_date);
    ```
  - `created_by` / `user_id` (if multi-user becomes a focus): Essential for fetching tasks specific to a user.
    ```sql
    CREATE INDEX IF NOT EXISTS idx_task_created_by ON tasks (created_by);
    ```
- **Text Search:**
  - `task_title` and `task_description`: SQLite supports Full-Text Search (FTS) via virtual tables (FTS3, FTS4, FTS5). For simple `LIKE '%query%'` searches on these text fields with a moderate dataset size, standard indexes might not be as effective as FTS. If complex text search becomes a primary feature, an FTS table mirroring these columns would be recommended. For the current scope, simple queries are used.

These indexes are not automatically created by the current `database.py` but are recommended if performance tuning becomes necessary for larger datasets.

## 5. Choice of Architecture

The application follows a **Single Page Application (SPA)** architecture for the frontend, built with Next.js. This provides a fast, responsive user experience by rendering content dynamically on the client-side after an initial page load.
The backend is a **separate RESTful API service** built with FastAPI, promoting separation of concerns, independent scalability, and clear API contracts.

- **Frontend (Next.js):** Handles UI rendering, client-side state management, user interactions, and calls to the backend API using Axios. It also manages interactions with AI services (Genkit flows running within the Next.js server environment via server actions or API routes).
- **Backend (FastAPI):** Manages data persistence using an SQLite database (via `aiosqlite` for asynchronous operations) and provides CRUD (Create, Read, Update, Delete) APIs for tasks. It handles business logic related to task data management.

This decoupled architecture allows for:
- Independent development cycles for frontend and backend.
- Technology specialization for each tier.
- Easier scaling of individual components based on demand (though SQLite has limitations for highly concurrent writes compared to server-based RDBMS).
- Clear interface definition through REST APIs.

## 6. Project Structure

The project is organized to separate backend and frontend concerns, aligning with modern web development practices.

```
/taskwise-app/ (project-root)
├── backend/                  # FastAPI backend application
│   ├── app/                  # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app instantiation, middleware, root/health endpoints
│   │   ├── models.py         # Pydantic models for data validation and structure
│   │   ├── crud.py           # Data access logic (SQLite via aiosqlite)
│   │   ├── database.py       # SQLite database connection and table setup
│   │   └── routers/
│   │       ├── __init__.py
│   │       └── tasks.py      # API Endpoints for Task CRUD operations
│   ├── requirements.txt      # Python dependencies for the backend
│   ├── taskwise.db           # SQLite database file (added to .gitignore)
│   └── venv/                 # Python virtual environment (typically excluded from Git)
├── src/                      # Next.js frontend application (SPA)
│   ├── app/                  # Next.js App Router (pages, layouts, route handlers)
│   │   ├── globals.css       # Global styles and Tailwind CSS directives
│   │   ├── layout.tsx        # Root layout for the application
│   │   └── page.tsx          # Main page component for the root route
│   ├── components/           # Reusable React components
│   │   ├── ui/               # ShadCN UI components
│   │   ├── AppHeader.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskFormDialog.tsx
│   │   └── SmartSuggestionsSection.tsx
│   ├── lib/                  # Utility functions (e.g., cn, axiosInstance)
│   │   ├── utils.ts
│   │   └── axios.ts          # Axios instance configuration
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   └── ai/                   # Genkit AI flows and configuration
│       ├── genkit.ts
│       ├── dev.ts
│       └── flows/
│           └── smart-task-suggestion.ts
├── public/                   # Static assets for Next.js
├── .env                      # Local environment variables (ignored by Git)
├── .env.example              # Example environment variables file
├── .gitignore
├── .vscode/
│   └── settings.json
├── components.json           # ShadCN UI configuration
├── next-env.d.ts
├── next.config.ts
├── package.json              # Node.js project manifest (dependencies, scripts)
├── pnpm-lock.yaml            # pnpm lock file
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md                 # This file: project documentation
```

## 7. Environment Requirements

- **Node.js:** Version 18.x or later.
- **pnpm:** Version 8.x or later (Package manager for frontend).
- **Python:** Version 3.8 or later.
- **pip:** For installing Python packages.
- **Git:** For version control.
- (Optional) Genkit CLI: For advanced Genkit flow development (`pnpm global add genkit-cli`).
- **Operating System:** Linux, macOS, or Windows (WSL2 recommended on Windows).

## 8. Build & Run Instructions

### 8.1. Initial Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_name> # e.g., cd taskwise-app
    ```

2.  **Frontend Setup (Next.js):**
    From the project root directory:
    ```bash
    pnpm install
    ```

3.  **Backend Setup (FastAPI):**
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
    The SQLite database file (`taskwise.db`) will be automatically created in the `backend/` directory when the backend server starts for the first time.
    Return to the project root directory:
    ```bash
    cd ..
    ```

4.  **Environment Variables:**
    - In the project root, create a `.env` file by copying `.env.example`:
      ```bash
      cp .env.example .env
      ```
    - Edit `.env` and set `NEXT_PUBLIC_API_URL` (e.g., `NEXT_PUBLIC_API_URL=http://localhost:8000/api`).
    - For AI features, set `GOOGLE_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` in `.env` or your system environment.

### 8.2. Running the Application (Development)

To run both frontend and backend concurrently from the project root:
```bash
pnpm dev:full
```
This will:
- Start Next.js dev server (usually `http://localhost:9002`).
- Start FastAPI dev server (usually `http://localhost:8000`), which will create/use `backend/taskwise.db`.

Alternatively, in separate terminals from the project root:
- **Frontend:** `pnpm dev`
- **Backend:** `pnpm backend:dev`

- **Genkit UI (Optional):** `pnpm genkit:watch` (usually on `http://localhost:4000`).

### 8.3. Building for Production

- **Frontend (Next.js):**
  From the project root: `pnpm build` (output in `.next/`).
- **Backend (FastAPI):**
  No specific "build" command. For deployment, you'd package Python source code and dependencies (e.g., in a Docker container). The `taskwise.db` file would need to be managed as part of the deployment if persistence across restarts is required in the production environment.

## 9. Deployment Architecture

- **Frontend (Next.js):**
  - Vercel, Netlify, AWS (S3/CloudFront/Lambda or ECS/Fargate), Google Cloud (Cloud Storage/CDN/Run), Self-hosted Node.js server.
- **Backend (FastAPI with SQLite):**
  - **Docker Container (Recommended for simplicity with SQLite):** Package FastAPI app and `taskwise.db` file.
    - Google Cloud Run (with a persistent volume or if DB is ephemeral/rebuilt), AWS ECS/Fargate (with EFS for persistence), Azure Container Instances.
  - **Virtual Machines (VMs):** EC2, Compute Engine, Azure VMs. Deploy with Uvicorn/Gunicorn. SQLite file resides on the VM's filesystem.
  - **Serverless (e.g., AWS Lambda, Google Cloud Functions):** Challenging for SQLite due to its file-based nature and serverless statelessness. Requires a network file system or alternative DB for serverless. **Not recommended for SQLite unless DB is read-only or ephemeral.**
- **Genkit Flows:** Deployed with Next.js application or as separate services.

**Important Note on SQLite in Production:**
SQLite is an embedded, file-based database.
- **Pros:** Simple setup, no separate DB server.
- **Cons:** Can have concurrency limitations (especially for writes) compared to client-server RDBMS. Backup/scaling strategies are different. For multi-instance deployments, a shared file system or a switch to a server-based DB (PostgreSQL, MySQL) would be necessary.
For this project's scope, SQLite is suitable for local development and single-instance deployments.

**Example Production Setup (Simple, Single Instance):**
- Next.js frontend on Vercel.
- FastAPI backend (with SQLite) as a Docker container on Google Cloud Run (single instance, or if multiple instances, the DB state might not be shared without a volume). For better scalability, a managed database like Cloud SQL (PostgreSQL/MySQL) would be a common upgrade path.

## 10. Data Migration Scripts

- **Currently:** The SQLite database schema (`tasks` table) is created automatically by `backend/app/database.py` on application startup if it doesn't exist. Initial seed data is also populated if the table is empty.
- **Future (Schema Evolution):** For schema changes (altering tables, adding columns, complex data transformations), manual SQL scripts or a migration tool like Alembic (if using SQLAlchemy ORM, which is not currently used) would be necessary. SQLite's `ALTER TABLE` has some limitations compared to other RDBMS. Simple additions of columns with defaults are often straightforward.

## 11. Site Readiness Checklist

- **[ ] Environment Configuration:**
  - [ ] Node.js, pnpm, Python versions meet requirements.
  - [ ] Dependencies installed (frontend: `pnpm install --prod`, backend: `pip install -r requirements.txt`).
  - [ ] Environment variables (`.env` or platform config) set: `NEXT_PUBLIC_API_URL`, Genkit keys.
- **[ ] Backend API:**
  - [ ] FastAPI backend deployed and running. `backend/taskwise.db` is present and writable by the app.
  - [ ] Accessible from frontend. CORS configured.
  - [ ] Health check (`/api/health`) is healthy.
- **[ ] Frontend Application:**
  - [ ] Next.js app builds (`pnpm build`).
  - [ ] Links, navigation, API calls working. Static assets load.
- **[ ] AI Features (Genkit):**
  - [ ] Genkit flows operational. API keys configured.
- **[ ] Database (SQLite):**
  - [ ] `taskwise.db` file is in the correct location for the backend and is writable.
  - [ ] Tables are created on startup.
  - [ ] Backup strategy for `taskwise.db` file considered for production (e.g., regular file copy, VM snapshots).
- **[ ] Testing:**
  - [ ] UAT cases pass. Performance/security checks.
- **[ ] Logging & Monitoring:**
  - [ ] Setup for frontend/backend. Alerting configured.
- **[ ] Domain & DNS:**
  - [ ] Custom domain configured. SSL/TLS active.

## 12. UAT (User Acceptance Testing) Instructions

(Same as provided in the original README - verify core CRUD, search, AI suggestions, validation, responsiveness, UI consistency.)

1.  **Application Loading:** Check for header, search, empty/existing task list, footer.
2.  **Create Task:** Use "Add Task", fill form, submit. Verify toast and task in list.
3.  **Read Tasks (List View):** Verify all task details displayed correctly.
4.  **Update Task:** Edit existing task, change fields, save. Verify toast and updated details.
5.  **Delete Task:** Delete task, confirm. Verify toast and task removal.
6.  **Search Tasks:** Type in search bar, verify filtering. Clear search, verify all tasks show.
7.  **Smart Task Suggestions (AI Feature):** With existing tasks, click "Smart Suggestions", then "Get Suggestions". Verify loading, then suggestions. Add a suggested task.
8.  **Form Validation:** Test required fields (title), max length constraints.
9.  **Responsiveness:** Test on desktop, tablet, mobile views.
10. **User Experience & UI:** Check styling, interactive states, toasts, loading indicators.

## 13. Go Live Steps

(Largely same as original, with SQLite considerations)

1.  **[ ] Final Code Freeze.**
2.  **[ ] Complete Final UAT & Sign-off.**
3.  **[ ] Backup (SQLite):** If updating an existing `taskwise.db`, back up the file.
4.  **[ ] Production Build:** Frontend (`pnpm build`), Backend (package Python app).
5.  **[ ] Configure Production Environment Variables.**
6.  **[ ] Deploy Backend Service:** Ensure `taskwise.db` is deployed with the application and is in a persistent location if required by the hosting platform. Permissions must allow the app to read/write.
7.  **[ ] Deploy Frontend Application.**
8.  **[ ] Data Migration (SQLite):** If schema changes, apply manual SQL or migration tool scripts to `taskwise.db`. For first-time setup, the app will create tables.
9.  **[ ] DNS Configuration & SSL.**
10. **[ ] Smoke Testing in Production.**
11. **[ ] Monitoring & Logging Setup Verification.**
12. **[ ] Announce Go-Live.**
13. **[ ] Post-Go-Live Monitoring.** Ensure SQLite database is performing adequately and backups are in place.
```