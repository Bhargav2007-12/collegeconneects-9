from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from pymongo.errors import DuplicateKeyError, OperationFailure, PyMongoError

from app.database import get_database
from app.deps import firebase_claims
from app.mailer import (
    send_advisor_session_update_email_to_student,
    send_booking_email_to_advisor,
)
from app.schemas.advisor import AdvisorCreate, AdvisorResponse

router = APIRouter(prefix="/advisors", tags=["advisors"])


def _normalize_advisor_doc(doc: dict) -> dict:
    """Return advisor doc with stable snake_case keys (backward-compatible)."""
    if "detected_college" not in doc and "detectedCollege" in doc:
        doc["detected_college"] = doc.get("detectedCollege")
    if "session_price" not in doc and "sessionPrice" in doc:
        doc["session_price"] = doc.get("sessionPrice")
    if "jee_mains_percentile" not in doc and "jeeMainsPercentile" in doc:
        doc["jee_mains_percentile"] = doc.get("jeeMainsPercentile")
    if "jee_mains_rank" not in doc and "jeeMainsRank" in doc:
        doc["jee_mains_rank"] = doc.get("jeeMainsRank")
    if "jee_advanced_rank" not in doc and "jeeAdvancedRank" in doc:
        doc["jee_advanced_rank"] = doc.get("jeeAdvancedRank")
    if "personal_email" not in doc and "personalEmail" in doc:
        doc["personal_email"] = doc.get("personalEmail")
    if "language_other" not in doc and "languageOther" in doc:
        doc["language_other"] = doc.get("languageOther")
    if "preferred_timezones" not in doc and "preferredTimezones" in doc:
        doc["preferred_timezones"] = doc.get("preferredTimezones")
    return doc


class AdvisorProfileUpdate(BaseModel):
    name: str | None = None
    branch: str | None = None
    phone: str | None = None
    personal_email: str | None = None
    state: str | None = None
    jee_mains_percentile: str | None = None
    jee_mains_rank: str | None = None
    jee_advanced_rank: str | None = None
    bio: str | None = None
    skills: str | None = None
    achievements: str | None = None
    languages: list[str] | None = None
    language_other: str | None = None
    preferred_timezones: list[str] | None = None
    session_price: str | None = None


class AdvisorBookingCreate(BaseModel):
    advisor_id: str
    selected_slot: str


class AdvisorSessionUpdateNotify(BaseModel):
    action: Literal["reject", "change"]
    student_email: str
    student_name: str
    old_slot: str
    new_slot: str | None = None


@router.get("/list")
async def list_advisors() -> list[dict]:
    docs = (
        await get_database()
        .advisors.find(
            {},
            {
                "name": 1,
                "detected_college": 1,
                "branch": 1,
                "session_price": 1,
                "skills": 1,
                "bio": 1,
                "languages": 1,
                "preferred_timezones": 1,
                "preferredTimezones": 1,
            },
        )
        .sort("updated_at", -1)
        .to_list(length=200)
    )
    out: list[dict] = []
    for d in docs:
        d = _normalize_advisor_doc(d)
        langs = d.get("languages")
        if not isinstance(langs, list):
            langs = []
        slots = d.get("preferred_timezones") or d.get("preferredTimezones")
        if not isinstance(slots, list):
            slots = []
        out.append(
            {
                "id": str(d.get("_id")),
                "name": d.get("name") or "",
                "college": d.get("detected_college") or "",
                "branch": d.get("branch") or "",
                "session_price": str(d.get("session_price", "") or ""),
                "skills": d.get("skills") or "",
                "bio": d.get("bio") or "",
                "languages": langs,
                "preferred_timezones": [str(x) for x in slots if x is not None],
            }
        )
    return out


@router.post("/book")
async def book_advisor(
    payload: AdvisorBookingCreate,
    claims: dict = Depends(firebase_claims),
) -> dict:
    uid = claims["uid"]
    student_email = (claims.get("email") or "").lower()
    if not student_email:
        raise HTTPException(status_code=400, detail="Student email not found in token.")
    if not ObjectId.is_valid(payload.advisor_id):
        raise HTTPException(status_code=400, detail="Invalid advisor id.")

    db = get_database()
    student = await db.students.find_one({"firebase_uid": uid})
    if not student:
        student = await db.students.find_one({"email": student_email})
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    advisor = await db.advisors.find_one({"_id": ObjectId(payload.advisor_id)})
    if not advisor:
        raise HTTPException(status_code=404, detail="Advisor not found.")
    advisor = _normalize_advisor_doc(advisor)
    advisor_email = str(advisor.get("college_email") or "").strip().lower()
    if not advisor_email:
        advisor_email = str(advisor.get("personal_email") or "").strip().lower()
    if not advisor_email:
        raise HTTPException(status_code=400, detail="Advisor email is missing.")
    selected_slot = str(payload.selected_slot or "").strip()
    if not selected_slot:
        raise HTTPException(status_code=400, detail="Select one preferred time slot.")
    preferred_slots = advisor.get("preferred_timezones") or advisor.get("preferredTimezones") or []
    if not isinstance(preferred_slots, list):
        preferred_slots = []
    normalized_slots = [str(s).strip() for s in preferred_slots if str(s).strip()]
    if selected_slot not in normalized_slots:
        raise HTTPException(
            status_code=400,
            detail="Selected slot must be one of advisor preferred time slots.",
        )

    try:
        send_booking_email_to_advisor(
            advisor_email=advisor_email,
            advisor_name=str(advisor.get("name") or "Advisor"),
            student_name=str(student.get("name") or "Student"),
            student_email=student_email,
            selected_slot=selected_slot,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Booking email could not be sent via Resend: {e!s}",
        ) from e

    return {
        "ok": True,
        "advisor_email": advisor_email,
        "selected_slot": selected_slot,
        "email_sent": True,
        "email_error": "",
    }


@router.post("/sessions/notify-student")
async def notify_student_about_session_update(
    payload: AdvisorSessionUpdateNotify,
    claims: dict = Depends(firebase_claims),
) -> dict:
    uid = claims["uid"]
    db = get_database()
    advisor = await db.advisors.find_one({"firebase_uid": uid})
    if not advisor:
        raise HTTPException(status_code=404, detail="Advisor profile not found.")
    advisor = _normalize_advisor_doc(advisor)
    advisor_name = str(advisor.get("name") or "Advisor")

    old_slot = str(payload.old_slot or "").strip()
    if not old_slot:
        raise HTTPException(status_code=400, detail="Old slot is required.")
    preferred_slots = advisor.get("preferred_timezones") or advisor.get("preferredTimezones") or []
    normalized_slots = [str(s).strip() for s in preferred_slots if str(s).strip()]
    if payload.action == "change":
        new_slot = str(payload.new_slot or "").strip()
        if not new_slot:
            raise HTTPException(status_code=400, detail="New slot is required for change.")
        if new_slot not in normalized_slots:
            raise HTTPException(
                status_code=400,
                detail="New slot must be one of your preferred time slots.",
            )
    else:
        new_slot = None

    try:
        send_advisor_session_update_email_to_student(
            student_email=str(payload.student_email).strip().lower(),
            student_name=str(payload.student_name).strip() or "Student",
            advisor_name=advisor_name,
            action=payload.action,
            old_slot=old_slot,
            new_slot=new_slot,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not send email via Resend: {e!s}",
        ) from e

    return {"ok": True}


@router.post("", response_model=AdvisorResponse, status_code=status.HTTP_201_CREATED)
async def create_advisor(
    payload: AdvisorCreate,
    claims: dict = Depends(firebase_claims),
) -> AdvisorResponse:
    uid = claims["uid"]
    if not claims.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify your email in Firebase before completing signup.",
        )
    claim_email = (claims.get("email") or "").lower()
    if claim_email != str(payload.college_email).lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="College email does not match your Firebase sign-in session.",
        )

    db = get_database()
    now = datetime.now(timezone.utc)
    doc = payload.model_dump(by_alias=False)
    doc["firebase_uid"] = uid
    doc["college_email"] = str(payload.college_email).lower()
    pe = doc.get("personal_email")
    if pe:
        doc["personal_email"] = str(pe).lower()
    else:
        doc.pop("personal_email", None)
    doc["created_at"] = now
    doc["updated_at"] = now

    try:
        result = await db.advisors.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An advisor with this college email or account already exists.",
        )
    except OperationFailure as e:
        if e.code == 11000:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An advisor with this college email or account already exists.",
            ) from e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {getattr(e, 'details', None) or str(e)}",
        ) from e
    except PyMongoError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e!s}",
        ) from e

    return AdvisorResponse(
        id=str(result.inserted_id),
        college_email=payload.college_email,
        name=payload.name,
        created_at=now,
    )


@router.get("/me")
async def get_my_advisor(claims: dict = Depends(firebase_claims)) -> dict:
    uid = claims["uid"]
    db = get_database()
    doc = await db.advisors.find_one({"firebase_uid": uid})
    if not doc:
        claim_email = (claims.get("email") or "").lower()
        if claim_email:
            doc = await db.advisors.find_one({"college_email": claim_email})
            if doc:
                # Backfill UID for older rows created before firebase_uid mapping.
                await db.advisors.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"firebase_uid": uid}},
                )
                doc["firebase_uid"] = uid
    if not doc:
        raise HTTPException(status_code=404, detail="Advisor profile not found")
    doc = _normalize_advisor_doc(doc)
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
    return doc


@router.patch("/me")
async def update_my_advisor(
    payload: AdvisorProfileUpdate,
    claims: dict = Depends(firebase_claims),
) -> dict:
    uid = claims["uid"]
    db = get_database()
    doc = await db.advisors.find_one({"firebase_uid": uid})
    if not doc:
        claim_email = (claims.get("email") or "").lower()
        if claim_email:
            doc = await db.advisors.find_one({"college_email": claim_email})
            if doc:
                await db.advisors.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"firebase_uid": uid}},
                )
                doc["firebase_uid"] = uid
    if not doc:
        raise HTTPException(status_code=404, detail="Advisor profile not found")

    updates = payload.model_dump(exclude_unset=True)
    # Keep compatibility with older camelCase Mongo documents.
    if "session_price" in updates:
        updates["sessionPrice"] = updates["session_price"]
    if "jee_mains_percentile" in updates:
        updates["jeeMainsPercentile"] = updates["jee_mains_percentile"]
    if "jee_mains_rank" in updates:
        updates["jeeMainsRank"] = updates["jee_mains_rank"]
    if "jee_advanced_rank" in updates:
        updates["jeeAdvancedRank"] = updates["jee_advanced_rank"]
    if "personal_email" in updates:
        updates["personalEmail"] = updates["personal_email"]
    if "language_other" in updates:
        updates["languageOther"] = updates["language_other"]
    if "preferred_timezones" in updates:
        updates["preferredTimezones"] = updates["preferred_timezones"]
    if "personal_email" in updates and updates["personal_email"]:
        updates["personal_email"] = str(updates["personal_email"]).lower()
    if not updates:
        doc["id"] = str(doc.pop("_id"))
        doc.pop("password_hash", None)
        return doc

    updates["updated_at"] = datetime.now(timezone.utc)
    await db.advisors.update_one({"_id": doc["_id"]}, {"$set": updates})
    fresh = await db.advisors.find_one({"_id": doc["_id"]})
    if not fresh:
        raise HTTPException(status_code=404, detail="Advisor profile not found")
    fresh = _normalize_advisor_doc(fresh)
    fresh["id"] = str(fresh.pop("_id"))
    fresh.pop("password_hash", None)
    return fresh


@router.get("/id/{advisor_id}")
async def get_advisor(advisor_id: str) -> dict:
    if not ObjectId.is_valid(advisor_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    doc = await get_database().advisors.find_one({"_id": ObjectId(advisor_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    doc = _normalize_advisor_doc(doc)
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
    return doc
