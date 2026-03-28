from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Always load backend/.env even when uvicorn is started from the repo root (fixes wrong cluster / local default).
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_ENV_FILE = _BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    mongodb_uri: str = "mongodb://localhost:27017"
    database_name: str = "collegeconnect"
    google_application_credentials: str = ""
    google_impersonate_user: str = ""
    # Session booking emails (Resend): https://resend.com/docs
    resend_api_key: str = ""
    # e.g. "CollegeConnect <bookings@yourdomain.com>" (must be a verified sender in Resend)
    resend_from: str = ""


settings = Settings()
