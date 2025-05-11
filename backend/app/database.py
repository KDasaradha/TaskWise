import aiosqlite
from datetime import datetime, timezone

DATABASE_URL = "./taskwise.db" # SQLite database file will be in the backend directory

async def get_db_connection():
    db = await aiosqlite.connect(DATABASE_URL)
    db.row_factory = aiosqlite.Row # Access columns by name
    return db

async def create_tables():
    async with await get_db_connection() as db:
        await db.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            task_title TEXT NOT NULL,
            task_description TEXT,
            task_due_date TEXT,
            task_status TEXT NOT NULL,
            task_remarks TEXT,
            created_on TEXT NOT NULL,
            last_updated_on TEXT NOT NULL,
            created_by TEXT,
            last_updated_by TEXT
        )
        """)
        await db.commit()
        # Check if seed data should be added
        cursor = await db.execute("SELECT COUNT(*) FROM tasks WHERE id LIKE 'seed-%'")
        count = await cursor.fetchone()
        if count[0] == 0:
            await seed_initial_data(db)

async def seed_initial_data(db: aiosqlite.Connection):
    """Seeds the database with initial task data."""
    initial_tasks_data = [
        {
            'id': 'seed-1',
            'task_title': 'Setup Backend Project',
            'task_description': 'Initialize FastAPI, install dependencies like Uvicorn, Pydantic, aiosqlite.',
            'task_due_date': datetime.now(timezone.utc).isoformat(),
            'task_status': 'completed',
            'task_remarks': 'Backend setup complete with SQLite!',
            'created_by': 'DevTeam',
            'created_on': datetime.now(timezone.utc).isoformat(),
            'last_updated_on': datetime.now(timezone.utc).isoformat(),
            'last_updated_by': 'DevTeam',
        },
        {
            'id': 'seed-2',
            'task_title': 'Develop Task CRUD APIs with SQLite',
            'task_description': 'Create FastAPI endpoints (POST, GET, PUT, DELETE) for tasks using async SQLite.',
            'task_due_date': datetime.now(timezone.utc).isoformat(),
            'task_status': 'in_progress',
            'task_remarks': 'Working on GET and POST routes with SQLite.',
            'created_by': 'BackendLead',
            'created_on': datetime.now(timezone.utc).isoformat(),
            'last_updated_on': datetime.now(timezone.utc).isoformat(),
            'last_updated_by': 'BackendLead',
        },
        {
            'id': 'seed-3',
            'task_title': 'Integrate Frontend with Backend (Axios)',
            'task_description': 'Update Next.js app to use FastAPI via Axios for task data.',
            'task_due_date': None, # Stored as NULL
            'task_status': 'pending',
            'task_remarks': '',
            'created_by': 'FrontendLead',
            'created_on': datetime.now(timezone.utc).isoformat(),
            'last_updated_on': datetime.now(timezone.utc).isoformat(),
            'last_updated_by': 'FrontendLead',
        }
    ]
    for task_data in initial_tasks_data:
        await db.execute("""
            INSERT INTO tasks (id, task_title, task_description, task_due_date, task_status, task_remarks, created_on, last_updated_on, created_by, last_updated_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            task_data['id'],
            task_data['task_title'],
            task_data['task_description'],
            task_data['task_due_date'],
            task_data['task_status'],
            task_data['task_remarks'],
            task_data['created_on'],
            task_data['last_updated_on'],
            task_data['created_by'],
            task_data['last_updated_by']
        ))
    await db.commit()
    print("Initial data seeded.")

# Example of how to call create_tables on app startup in main.py
# app.add_event_handler("startup", create_tables)
