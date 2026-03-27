from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from pymongo.errors import DuplicateKeyError, OperationFailure, PyMongoError

from app.database import get_database
from app.deps import firebase_claims
from app.mailer import send_student_final_slot_email_to_advisor
from app.schemas.student import StudentCreate, StudentResponse

router = APIRouter(prefix="/students", tags=["students"])


class StudentProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    state: str | None = None
    academic_status: str | None = None
    jee_mains_percentile: str | None = None
    jee_mains_rank: str | None = None
    jee_advanced_rank: str | None = None
    language_other: str | None = None
    languages: list[str] | None = None


class StudentFinalSlotNotify(BaseModel):
    advisor_id: str
    old_slot: str
    new_slot: str


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    payload: StudentCreate,
    claims: dict = Depends(firebase_claims),
) -> StudentResponse:
    uid = claims["uid"]
    if not claims.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify your email in Firebase before completing signup.",
        )
    claim_email = (claims.get("email") or "").lower()
    if claim_email != str(payload.email).lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email does not match your Firebase sign-in session.",
        )

    db = get_database()
    now = datetime.now(timezone.utc)
    doc = payload.model_dump(by_alias=False)
    doc["firebase_uid"] = uid
    doc["email"] = str(payload.email).lower()
    doc["created_at"] = now
    doc["updated_at"] = now

    try:
        result = await db.students.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A student with this email or account already exists.",
        )
    except OperationFailure as e:
        if e.code == 11000:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A student with this email or account already exists.",
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

    return StudentResponse(
        id=str(result.inserted_id),
        email=payload.email,
        name=payload.name,
        created_at=now,
    )


@router.get("/me")
async def get_my_student(claims: dict = Depends(firebase_claims)) -> dict:
    uid = claims["uid"]
    db = get_database()
    doc = await db.students.find_one({"firebase_uid": uid})
    if not doc:
        claim_email = (claims.get("email") or "").lower()
        if claim_email:
            doc = await db.students.find_one({"email": claim_email})
            if doc:
                # Backfill UID for older rows created before firebase_uid mapping.
                await db.students.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"firebase_uid": uid}},
                )
                doc["firebase_uid"] = uid
    if not doc:
        raise HTTPException(status_code=404, detail="Student profile not found")
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
    return doc


@router.patch("/me")
async def update_my_student(
    payload: StudentProfileUpdate,
    claims: dict = Depends(firebase_claims),
) -> dict:
    uid = claims["uid"]
    db = get_database()
    doc = await db.students.find_one({"firebase_uid": uid})
    if not doc:
        claim_email = (claims.get("email") or "").lower()
        if claim_email:
            doc = await db.students.find_one({"email": claim_email})
            if doc:
                await db.students.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"firebase_uid": uid}},
                )
                doc["firebase_uid"] = uid
    if not doc:
        raise HTTPException(status_code=404, detail="Student profile not found")

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        doc["id"] = str(doc.pop("_id"))
        doc.pop("password_hash", None)
        return doc

    updates["updated_at"] = datetime.now(timezone.utc)
    await db.students.update_one({"_id": doc["_id"]}, {"$set": updates})
    fresh = await db.students.find_one({"_id": doc["_id"]})
    if not fresh:
        raise HTTPException(status_code=404, detail="Student profile not found")
    fresh["id"] = str(fresh.pop("_id"))
    fresh.pop("password_hash", None)
    return fresh


@router.get("/id/{student_id}")
async def get_student(student_id: str) -> dict:
    if not ObjectId.is_valid(student_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    doc = await get_database().students.find_one({"_id": ObjectId(student_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
    return doc


@router.post("/sessions/notify-advisor-final-slot")
async def notify_advisor_final_slot(
    payload: StudentFinalSlotNotify,
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
    advisor_email = str(advisor.get("college_email") or advisor.get("personal_email") or "").strip().lower()
    if not advisor_email:
        raise HTTPException(status_code=400, detail="Advisor email is missing.")

    preferred_slots = advisor.get("preferred_timezones") or advisor.get("preferredTimezones") or []
    allowed = [str(s).strip() for s in preferred_slots if str(s).strip()]
    old_slot = str(payload.old_slot or "").strip()
    new_slot = str(payload.new_slot or "").strip()
    if not old_slot or not new_slot:
        raise HTTPException(status_code=400, detail="Old slot and new slot are required.")
    if new_slot not in allowed:
        raise HTTPException(status_code=400, detail="Final slot must be one of advisor preferred slots.")

    try:
        send_student_final_slot_email_to_advisor(
            advisor_email=advisor_email,
            advisor_name=str(advisor.get("name") or "Advisor"),
            student_name=str(student.get("name") or "Student"),
            student_email=student_email,
            old_slot=old_slot,
            new_slot=new_slot,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not send email via Resend: {e!s}",
        ) from e
    return {"ok": True}
