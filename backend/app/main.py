from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import close_db, connect_db, get_database
from app.firebase_service import init_firebase_admin
from app.routers import advisors, students, auth, bookings
from app.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    init_firebase_admin()
    start_scheduler()
    yield
    stop_scheduler()
    await close_db()


app = FastAPI(title="CollegeConnect API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router, prefix="/api")
app.include_router(advisors.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/meta/s3")
async def meta_s3() -> dict[str, str | bool]:
    """Non-secret check that college-ID upload env is loaded (browser uploads still need bucket CORS)."""
    return {
        "configured": s3_configured(),
        "bucket": settings.s3_bucket if s3_configured() else "",
        "region": settings.aws_region if s3_configured() else "",
        "prefix": (settings.s3_college_ids_prefix or "college-ids").strip().strip("/"),
    }


@app.get("/api/meta/db-stats")
async def db_stats() -> dict[str, str | int]:
    """Use this to confirm which database name the API uses and document counts (Compass must use the same cluster + database)."""
    db = get_database()
    return {
        "database_name": settings.database_name,
        "students_count": await db.students.count_documents({}),
        "advisors_count": await db.advisors.count_documents({}),
    }


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "CollegeConnect API",
        "collections": "MongoDB: students, advisors",
    }
