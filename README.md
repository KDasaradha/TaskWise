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

### 3.1 Data Dictionary (Task Entity)

The table below outlines the attributes for the Task entity:

| Field             | Type                                 | Description                                                                   |
|-------------------|--------------------------------------|-------------------------------------------------------------------------------|
| `id`              | String (UUID)                        | Primary Key, Unique identifier for the task                                   |
| `task_title`      | String                               | Required, max 100 chars, Title of the task                                    |
| `task_description`| String                               | Optional, max 500 chars, Detailed description of the task                   |
| `task_due_date`   | DateTime                             | Optional, Deadline for task completion                                        |
| `task_status`     | Enum (String: "pending", "in_progress", "completed") | Required, Current status of the task                                            |
| `task_remarks`    | String                               | Optional, max 200 chars, Additional remarks or comments                     |
| `created_on`      | DateTime                             | Auto-generated, Timestamp of task creation                                    |
| `last_updated_on` | DateTime                             | Auto-generated/updated, Timestamp of last update                              |
| `created_by`      | String                               | Name/ID of creator (Placeholder for user association, e.g., "User", "Admin")  |
| `last_updated_by` | String                               | Name/ID of last editor (Placeholder for user association)                     |

*(Note: In a multi-user system with authentication, `created_by` and `last_updated_by` would typically be foreign keys to a `Users` table.)*

### 3.2 Conceptual ER Diagram (for a future persistent database like PostgreSQL)

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

## 4. Indexing Strategy

- **Current (In-memory):** Not applicable. Direct dictionary lookups by `id` are efficient.
- **Future (Production Database - e.g., PostgreSQL):**
  - **Primary Key:** `id` (usually automatically indexed).
  - **Frequently Queried/Filtered Fields:**
    - `task_status`: Useful for filtering tasks by their status (e.g., show all "in_progress" tasks). An index here would improve query performance.
    - `task_due_date`: For sorting by due date or querying tasks due within a certain range. An index would be beneficial.
    - `created_by` / `user_id` (if multi-user): Essential for fetching tasks specific to a user. A crucial index in a multi-tenant system.
  - **Text Search:**
    - `task_title` and `task_description`: Could benefit from full-text search indexing (e.g., GIN or GiST index in PostgreSQL with `tsvector`) if complex keyword searches are a primary feature. For simple `LIKE '%query%'` searches on smaller datasets, standard B-tree indexes might offer some help but won't be as efficient as dedicated FTS indexes.

## 5. Choice of Architecture

The application follows a **Single Page Application (SPA)** architecture for the frontend, built with Next.js. This provides a fast, responsive user experience by rendering content dynamically on the client-side after an initial page load.
The backend is a **separate RESTful API service** built with FastAPI, promoting separation of concerns, independent scalability, and clear API contracts.

- **Frontend (Next.js):** Handles UI rendering, client-side state management, user interactions, and calls to the backend API. It also manages interactions with AI services (Genkit flows running within the Next.js server environment via server actions or API routes).
- **Backend (FastAPI):** Manages data persistence (currently in-memory via Python lists/dictionaries) and provides CRUD (Create, Read, Update, Delete) APIs for tasks. It handles business logic related to task data management.

This decoupled architecture allows for:
- Independent development cycles for frontend and backend.
- Technology specialization for each tier.
- Easier scaling of individual components based on demand.
- Clear interface definition through REST APIs.

## 6. Project Structure

The project is organized to separate backend and frontend concerns, aligning with modern web development practices. The structure adapts the PRD's suggestion as follows:

```
/taskwise-app/ (project-root)
├── backend/                  # FastAPI backend application
│   ├── app/                  # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app instantiation, middleware, root/health endpoints
│   │   ├── models.py         # Pydantic models for data validation and structure
│   │   ├── crud.py           # Data access logic (currently in-memory store)
│   │   └── routers/
│   │       ├── __init__.py
│   │       └── tasks.py      # API Endpoints for Task CRUD operations
│   ├── requirements.txt      # Python dependencies for the backend
│   └── venv/                 # Python virtual environment (typically excluded from Git)
├── src/                      # Next.js frontend application (SPA)
│   ├── app/                  # Next.js App Router (pages, layouts, route handlers)
│   │   ├── globals.css       # Global styles and Tailwind CSS directives
│   │   ├── layout.tsx        # Root layout for the application
│   │   └── page.tsx          # Main page component for the root route
│   ├── components/           # Reusable React components
│   │   ├── ui/               # ShadCN UI components (e.g., button, card, dialog)
│   │   ├── AppHeader.tsx     # Application header component
│   │   ├── TaskList.tsx      # Component to display the list of tasks
│   │   ├── TaskItem.tsx      # Component for a single task item
│   │   ├── TaskFormDialog.tsx # Dialog for creating/editing tasks
│   │   └── SmartSuggestionsSection.tsx # Component for AI task suggestions
│   ├── lib/                  # Utility functions (e.g., cn for classnames)
│   ├── hooks/                # Custom React hooks (e.g., useToast, useMobile)
│   ├── types/                # TypeScript type definitions (e.g., Task interface)
│   └── ai/                   # Genkit AI flows and configuration
│       ├── genkit.ts         # Genkit main configuration
│       ├── dev.ts            # Genkit development server setup
│       └── flows/
│           └── smart-task-suggestion.ts # AI flow for task suggestions
├── public/                   # Static assets for Next.js (e.g., images, favicon)
├── .env                      # Local environment variables (ignored by Git)
├── .env.example              # Example environment variables file (THIS FILE)
├── .gitignore                # Specifies intentionally untracked files that Git should ignore
├── .vscode/                  # VSCode editor specific settings
│   └── settings.json
├── components.json           # ShadCN UI configuration
├── next-env.d.ts             # Next.js TypeScript declarations
├── next.config.ts            # Next.js configuration file
├── package.json              # Node.js project manifest (dependencies, scripts)
├── package-lock.json         # Records exact versions of npm dependencies
├── postcss.config.mjs        # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript compiler options
└── README.md                 # This file: project documentation
```

**Notes on Structure:**
- The `frontend/` directory suggested in the PRD is embodied by the Next.js application structure within the project root (primarily `src/`, `public/`, and Next.js configuration files). This is a standard and idiomatic Next.js project layout.
- `docs/`: Documentation is consolidated into this `README.md` file, as per the PRD requesting ".md documentation".
- `database/`: This directory is not applicable for the current in-memory storage backend. If a persistent database (like PostgreSQL) were integrated, this directory would typically contain schema definitions, migration scripts (e.g., using Alembic), and seed data.

## 7. Environment Requirements

- **Node.js:** Version 18.x or later (check `package.json` engines if specified).
- **npm:** Version 8.x or later (or Yarn).
- **Python:** Version 3.8 or later.
- **pip:** For installing Python packages.
- **Git:** For version control.
- (Optional) Genkit CLI: For advanced Genkit flow development and inspection (`npm install -g genkit-cli`).
- **Operating System:** Development can be done on Linux, macOS, or Windows (with WSL2 recommended for a Linux-like environment on Windows).

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
    npm install
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
    Return to the project root directory:
    ```bash
    cd ..
    ```

4.  **Environment Variables:**
    - In the project root, create a `.env` file by copying the provided `.env.example` file:
      ```bash
      cp .env.example .env
      ```
    - Edit the `.env` file and populate it with your specific values. It should contain at least:
      ```env
      NEXT_PUBLIC_API_URL=http://localhost:8000/api
      ```
    - If you plan to use the AI features (Smart Task Suggestions), you will need to set up Google AI credentials. Set either `GOOGLE_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` in your system environment or in the `.env` file:
      ```env
      # Example for API Key (ensure this is kept secret)
      # GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY_HERE

      # Example for Application Credentials (path to your JSON key file)
      # GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-file.json
      ```
      Refer to Google AI documentation for obtaining these credentials.

### 8.2. Running the Application (Development)

To run both the Next.js frontend and FastAPI backend concurrently, use the script defined in `package.json` from the project root:

```bash
npm run dev:full
```

This command will typically:
- Start the Next.js development server (usually on `http://localhost:9002`).
- Start the FastAPI development server (usually on `http://localhost:8000`).

Alternatively, you can run them in separate terminals:

- **Frontend (Next.js):**
  From the project root:
  ```bash
  npm run dev
  ```
- **Backend (FastAPI):**
  From the project root:
  ```bash
  npm run backend:dev
  ```
  Or, manually from the `backend` directory (ensure virtual environment is active):
  ```bash
  cd backend
  # source venv/bin/activate  (if not already active)
  python -m uvicorn app.main:app --reload --port 8000
  ```

- **Genkit Development UI (Optional):**
  If you want to inspect or test Genkit flows separately, run the Genkit development UI:
  ```bash
  npm run genkit:watch
  ```
  This usually starts the Genkit UI on `http://localhost:4000`.

### 8.3. Building for Production

- **Frontend (Next.js):**
  From the project root:
  ```bash
  npm run build
  ```
  This creates an optimized production build in the `.next` folder.

- **Backend (FastAPI):**
  Packaging for production depends on the chosen deployment strategy (e.g., Docker container, serverless function). FastAPI itself doesn't have a "build" command like Next.js. You would typically package the Python source code and dependencies. For Docker, you'd use a `Dockerfile`.

## 9. Deployment Architecture

This application can be deployed using various strategies for its frontend and backend components.

- **Frontend (Next.js):**
  - **Vercel (Recommended for Next.js):** Offers seamless deployment, CI/CD, serverless functions for API routes/server actions, and global CDN.
  - **Netlify:** Similar to Vercel, well-suited for static and dynamic Next.js sites.
  - **AWS:** S3 (for static assets) + CloudFront (CDN) + Lambda@Edge or EC2/ECS/Fargate (for Next.js server-side rendering and API capabilities).
  - **Google Cloud:** Cloud Storage + Cloud CDN + Cloud Functions/Cloud Run (for hosting the Next.js application).
  - **Self-hosted:** Using a Node.js server (e.g., with PM2 or systemd) to run `npm start` after building the application.

- **Backend (FastAPI):**
  - **Docker Container (Recommended for flexibility):** Package the FastAPI app into a Docker image.
    - **Google Cloud Run:** Fully managed serverless platform for containers. Excellent for FastAPI.
    - **AWS ECS/Fargate:** Orchestrate Docker containers on AWS.
    - **Azure Container Instances/App Service/AKS:** Microsoft Azure options for containerized applications.
  - **Platform as a Service (PaaS):**
    - **Google App Engine (Python environment):** Can host FastAPI applications.
    - **Heroku (Dynos for Python apps):** Simple deployment for Python web apps.
  - **Virtual Machines (VMs):** EC2 (AWS), Compute Engine (GCP), Azure VMs. Deploy with an ASGI server like Uvicorn managed by Gunicorn, typically behind a reverse proxy like Nginx or Caddy.

- **Genkit Flows:**
  - As currently implemented (e.g., `smart-task-suggestion.ts`), Genkit flows are part of the Next.js server environment (invoked via server actions or API routes). They are deployed along with the Next.js application.
  - For more complex or independently scalable AI services, Genkit flows can be deployed as separate services (e.g., on Google Cloud Functions or Cloud Run).

**Example Production Setup (Google Cloud Focus):**
- Next.js frontend and integrated Genkit flows deployed to **Vercel** (for ease of use and Next.js optimizations) or **Google Cloud Run** (if keeping everything within GCP).
- FastAPI backend deployed as a Docker container on **Google Cloud Run**.
- (Future Persistent Database): **Cloud SQL (PostgreSQL/MySQL)** or **Firestore/MongoDB** if a NoSQL approach is preferred.
- **API Gateway (e.g., Google Cloud API Gateway):** Can be placed in front of the FastAPI backend on Cloud Run for enhanced security, rate limiting, request/response transformations, and custom domain mapping.

## 10. Data Migration Scripts

- **Currently Not Applicable:** The backend uses an in-memory list for task storage, which is reset every time the application restarts. No data persistence means no migration scripts are needed.
- **Future (with Persistent Database):** If a persistent database (e.g., PostgreSQL, MySQL) is implemented, data migration scripts would become essential.
  - **Tools:** Alembic (for SQLAlchemy-based models if an ORM is adopted) or custom SQL scripts managed with a simple versioning scheme.
  - **Purpose:** To manage schema changes (creating tables, adding/removing columns, modifying data types, creating indexes) and to perform data transformations or backfills as the application evolves.
  - **Process:** Migrations would be run as part of the deployment process to ensure the database schema is compatible with the new version of the application.

## 11. Site Readiness Checklist

Before going live or deploying to a new environment (staging/production):

- **[ ] Environment Configuration:**
  - [ ] Node.js and Python versions meet requirements on the target deployment environment.
  - [ ] All dependencies are installed (frontend: `npm install --omit=dev` for production, backend: `pip install -r requirements.txt`).
  - [ ] Environment variables (`.env` file or platform-specific configuration) are correctly set for the target environment:
    - `NEXT_PUBLIC_API_URL` (pointing to the deployed backend API).
    - `GOOGLE_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` for Genkit, with appropriate permissions for production.
    - Any database connection strings (for a future persistent DB).
    - Secret keys or other sensitive configurations (e.g., `NODE_ENV=production` for Next.js).
- **[ ] Backend API:**
  - [ ] FastAPI backend is deployed and running.
  - [ ] Backend is accessible from the frontend (check network rules, firewalls).
  - [ ] CORS is correctly configured for the production frontend domain(s).
  - [ ] Health check endpoint (`/api/health`) returns a healthy status.
- **[ ] Frontend Application:**
  - [ ] Next.js application builds successfully (`npm run build`).
  - [ ] All links, navigation, and client-side routing are working.
  - [ ] API calls correctly point to the deployed backend API endpoints.
  - [ ] Static assets load correctly.
- **[ ] AI Features (Genkit):**
  - [ ] Genkit flows are operational in the deployed environment.
  - [ ] Necessary API keys (e.g., Google AI) are configured and valid for the production project/quotas.
- **[ ] Database (Future - if persistent DB is implemented):**
  - [ ] Database server is running and accessible by the backend application.
  - [ ] Database schema is migrated to the latest version.
  - [ ] Initial data (if any) is seeded correctly.
  - [ ] Backup and recovery procedures are in place.
- **[ ] Testing:**
  - [ ] All UAT (User Acceptance Testing) cases pass in the staging/production-like environment.
  - [ ] Performance testing (load testing) conducted if high traffic is anticipated.
  - [ ] Security checks performed (e.g., input validation, protection against common web vulnerabilities like XSS, CSRF; HTTPS enforced).
- **[ ] Logging & Monitoring:**
  - [ ] Centralized logging is set up for both frontend (client-side errors, if applicable) and backend to capture errors, important events, and request traces.
  - [ ] Monitoring tools (e.g., Google Cloud Monitoring, Sentry, Datadog) are in place to track application health, performance (latency, error rates), and resource usage.
  - [ ] Alerting is configured for critical errors or performance degradation.
- **[ ] Domain & DNS:**
  - [ ] Custom domain (if any) is configured and pointing to the frontend application.
  - [ ] SSL/TLS certificate is active and correctly installed for HTTPS.

## 12. UAT (User Acceptance Testing) Instructions

Verify the following functionalities to ensure the application meets business requirements:

1.  **Application Loading:**
    - Open the application URL in a supported browser.
    - **Expected:** The TaskWise application loads correctly, displaying the header (app title, "Smart Suggestions" button, "Add Task" button), search bar, and initially an empty task list (or tasks if any exist from the backend). The footer should be visible.

2.  **Create Task:**
    - Click the "Add Task" button in the header.
    - A dialog ("Add New Task") should appear with fields: Title, Description, Due Date, Status, Remarks.
    - Fill in the task title (e.g., "UAT Test Task 1").
    - Optionally, fill in description, select a due date, change status (default "Pending"), and add remarks.
    - Click the "Add Task" button in the dialog.
    - **Expected:** The dialog closes. A success toast message (e.g., "Task Added", ""UAT Test Task 1" has been added.") appears. The new task is visible in the task list table with the correct details (title, status, due date, last updated timestamp).

3.  **Read Tasks (List View):**
    - **Expected:** All existing tasks are displayed in the task list table. Each row should show:
        - Task Title (and Description below it if provided).
        - Task Status (e.g., "Pending", "In Progress", "Completed") with appropriate visual indicator/badge.
        - Task Due Date (formatted, or "Not set" if null).
        - Last Updated On (formatted timestamp).
        - Actions (Edit and Delete icons).

4.  **Update Task:**
    - For an existing task in the list, click the "Edit" (pencil) icon.
    - A dialog ("Edit Task") should appear, pre-filled with the selected task's current details.
    - Modify some fields (e.g., change the title to "UAT Test Task 1 - Updated", update status to "In Progress", change due date).
    - Click the "Save Changes" button in the dialog.
    - **Expected:** The dialog closes. A success toast message (e.g., "Task Updated", ""UAT Test Task 1 - Updated" has been updated.") appears. The task list updates to reflect the modified task details. The "Last Updated On" timestamp for that task should also update.

5.  **Delete Task:**
    - For an existing task in the list, click the "Delete" (trash) icon.
    - A confirmation dialog ("Are you sure you want to delete this task?") should appear, mentioning the task title.
    - Click the "Delete" button in the confirmation dialog.
    - **Expected:** The dialog closes. A success toast message (e.g., "Task Deleted", "Task "..." has been deleted.", variant: destructive) appears. The task is removed from the list.

6.  **Search Tasks:**
    - In the search bar at the top of the task list, type a keyword that exists in one or more task titles or descriptions (e.g., "UAT", "Updated").
    - **Expected:** The task list filters dynamically as you type, showing only tasks that match the search query (case-insensitive).
    - Clear the search bar.
    - **Expected:** The task list reverts to showing all tasks.

7.  **Smart Task Suggestions (AI Feature):**
    - Ensure at least one or two tasks exist in the list to provide context for suggestions.
    - Click the "Smart Suggestions" button in the header.
    - The "Smart Task Suggestions" section should appear below the main task list.
    - If no suggestions are loaded yet, click the "Get Suggestions" button within this section.
    - **Expected:** A loading indicator should appear while suggestions are being fetched from the AI. Once complete, a list of AI-generated task suggestions (title and description) should appear. If no tasks exist, it should prompt to add tasks first. If AI returns no suggestions, an appropriate message should be displayed.
    - For one of the suggested tasks, click the "Add Task" button next to it.
    - **Expected:** A success toast message appears. The suggested task is added to the main task list. By default, it should have "Pending" status and "AI Suggested" in remarks (or similar indication).

8.  **Form Validation:**
    - Attempt to create a task:
        - Click "Add Task".
        - Leave the "Title" field empty and try to submit.
        - **Expected:** An error message appears below the title field (e.g., "Title is required"), and the form does not submit.
        - Enter a title longer than 100 characters.
        - **Expected:** An error message (e.g., "Title must be 100 characters or less") appears.
    - Attempt to edit a task and apply similar validation checks for other fields with limits (description, remarks).

9.  **Responsiveness:**
    - View the application on different screen sizes (simulate desktop, tablet, and mobile views using browser developer tools).
    - **Expected:** The layout adapts gracefully. All functionalities (buttons, forms, task list, dialogs) remain usable and readable. The task table might become scrollable horizontally on very small screens, or columns might stack/hide.

10. **User Experience & UI:**
    - Check for consistent styling (colors, fonts, icons as per guidelines).
    - Ensure interactive elements (buttons, inputs) have clear hover and focus states.
    - Toast notifications should be clear and appropriately timed.
    - Loading states should be indicated (e.g., when fetching tasks or AI suggestions).

## 13. Go Live Steps

This checklist outlines the key steps to deploy the TaskWise application to a production environment.

1.  **[ ] Final Code Freeze:**
    - No new features are added to the release branch. Only critical bug fixes are permitted.
    - All code is merged into the main/master branch if that's the designated release branch.

2.  **[ ] Complete Final UAT & Sign-off:**
    - Ensure all UAT (User Acceptance Testing) cases (as outlined in Section 12) are executed in a staging environment that mirrors production.
    - Obtain sign-off from relevant stakeholders (e.g., project manager, product owner, Oritso recruitment board representative).

3.  **[ ] Backup (If Applicable):**
    - If migrating from an old system or if there's an existing production database (not applicable for the initial in-memory version, but crucial for future persistent DBs), perform a full backup of existing data.

4.  **[ ] Production Build:**
    - **Frontend (Next.js):** Run the production build command: `npm run build`. This generates optimized static assets and serverless functions in the `.next` directory.
    - **Backend (FastAPI):** Package the FastAPI application. If using Docker, build the production Docker image: `docker build -t taskwise-backend:latest -f backend/Dockerfile .` (assuming a `backend/Dockerfile` exists).

5.  **[ ] Configure Production Environment Variables:**
    - Set `NODE_ENV=production` for the Next.js application.
    - Ensure `NEXT_PUBLIC_API_URL` points to the publicly accessible production backend API URL.
    - Securely configure all necessary API keys (e.g., `GOOGLE_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` for Genkit) for the production environment, ensuring they have the correct scopes and are not development keys.
    - Configure production database connection strings (if a persistent DB is used).
    - Set up any other production-specific settings (e.g., logging levels, CORS origins for the backend, session secrets if applicable). Store sensitive variables securely (e.g., using environment variable management services of the cloud provider).

6.  **[ ] Deploy Backend Service:**
    - Deploy the packaged FastAPI application (e.g., Docker container) to the chosen production infrastructure (e.g., Google Cloud Run, AWS ECS, Azure App Service).
    - Configure scaling, health checks, and networking for the backend service.
    - Verify backend health and accessibility via its production URL (e.g., `https://api.taskwise.yourdomain.com/api/health`).

7.  **[ ] Deploy Frontend Application:**
    - Deploy the Next.js production build (`.next` folder and `public` folder contents) to the chosen hosting platform (e.g., Vercel, Netlify, Google Cloud Run, AWS Amplify).
    - Configure custom domain and CDN settings if applicable.

8.  **[ ] Data Migration (If Applicable for Persistent DB):**
    - If using a persistent database for the first time or upgrading, run any necessary data migration scripts against the production database to set up the schema and import initial/migrated data. This should be done after deploying the backend if the backend manages migrations, or before if migrations are managed externally.

9.  **[ ] DNS Configuration & SSL:**
    - Point your application's domain name (e.g., `taskwise.yourdomain.com`) to the deployed frontend application load balancer or CDN endpoint.
    - Ensure an SSL/TLS certificate is active for the domain, enforcing HTTPS.
    - Verify DNS propagation.

10. **[ ] Smoke Testing in Production:**
    - Perform a quick round of tests on the live production environment covering all core functionalities (CRUD, search, AI suggestions) as per the UAT plan.
    - Check for console errors in the browser and server logs from the production services.
    - Verify that API calls are successful and data is being handled correctly.

11. **[ ] Monitoring & Logging Setup Verification:**
    - Confirm that logging and monitoring tools are active and collecting data from the production environment (both frontend and backend).
    - Ensure alert thresholds are appropriately set for critical errors or performance issues.

12. **[ ] Announce Go-Live:**
    - Inform users and stakeholders (Oritso recruitment board) that the application is live and accessible at its production URL.

13. **[ ] Post-Go-Live Monitoring:**
    - Closely monitor the application's performance, error rates, and resource usage during the initial period after launch (e.g., first 24-48 hours).
    - Be prepared to address any unforeseen issues promptly.
    - Collect user feedback if applicable.
