from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'school-management-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Create the main app
app = FastAPI(
    title="School Management System API", 
    version="1.0.0"
)

# Middleware to fix protocol in redirects
@app.middleware("http")
async def enforce_https_redirects(request: Request, call_next):
    response = await call_next(request)
    # If it's a redirect, ensure the Location header uses HTTPS
    if response.status_code in (301, 302, 307, 308):
        location = response.headers.get("location", "")
        if location.startswith("http://"):
            # Replace http with https
            new_location = location.replace("http://", "https://", 1)
            response.headers["location"] = new_location
    return response

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
schools_router = APIRouter(prefix="/schools", tags=["Schools"])
students_router = APIRouter(prefix="/students", tags=["Students"])
teachers_router = APIRouter(prefix="/teachers", tags=["Teachers"])
licenses_router = APIRouter(prefix="/licenses", tags=["Licenses"])
finance_router = APIRouter(prefix="/finance", tags=["Finance"])
academic_router = APIRouter(prefix="/academic", tags=["Academic"])
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])
ai_router = APIRouter(prefix="/ai", tags=["AI Assistant"])

security = HTTPBearer(auto_error=False)

# ==================== MODELS ====================

class UserRole:
    SUPER_ADMIN = "super_admin"
    SCHOOL_ADMIN = "school_admin"
    SCHOOL_MANAGER = "school_manager"
    ACCOUNTANT = "accountant"
    TEACHER = "teacher"
    STUDENT = "student"
    PARENT = "parent"
    SUPPORT_AGENT = "support_agent"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    name_ar: Optional[str] = None
    phone: Optional[str] = None
    role: str = UserRole.STUDENT
    school_id: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    user_id: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class SchoolBase(BaseModel):
    name: str
    name_ar: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    address_ar: Optional[str] = None
    logo: Optional[str] = None
    primary_color: str = "#047857"
    secondary_color: str = "#475569"
    academic_system: str = "semester"  # semester, trimester, quarter
    currency: str = "LYD"
    timezone: str = "Africa/Tripoli"

class SchoolCreate(SchoolBase):
    admin_name: str
    admin_email: EmailStr
    admin_password: str

class SchoolResponse(SchoolBase):
    school_id: str
    is_active: bool
    license_status: str
    license_expires_at: Optional[datetime] = None
    created_at: datetime
    student_count: int = 0
    teacher_count: int = 0

class LicenseBase(BaseModel):
    license_type: str  # monthly, yearly, lifetime
    max_students: int = 500
    max_teachers: int = 50
    features: List[str] = []

class LicenseCreate(LicenseBase):
    school_id: str
    duration_days: int = 30

class LicenseResponse(LicenseBase):
    license_id: str
    school_id: str
    license_key: str
    status: str  # active, expired, suspended, grace_period
    activated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    grace_period_ends: Optional[datetime] = None
    created_at: datetime

class StudentBase(BaseModel):
    name: str
    name_ar: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: str = "male"
    national_id: Optional[str] = None
    address: Optional[str] = None
    grade_id: Optional[str] = None
    section_id: Optional[str] = None
    parent_id: Optional[str] = None
    enrollment_date: Optional[str] = None
    status: str = "active"
    avatar: Optional[str] = None

class StudentCreate(StudentBase):
    school_id: str
    password: Optional[str] = None

class StudentResponse(StudentBase):
    student_id: str
    school_id: str
    user_id: Optional[str] = None
    created_at: datetime

class TeacherBase(BaseModel):
    name: str
    name_ar: str
    email: EmailStr
    phone: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    hire_date: Optional[str] = None
    status: str = "active"
    avatar: Optional[str] = None

class TeacherCreate(TeacherBase):
    school_id: str
    password: str

class TeacherResponse(TeacherBase):
    teacher_id: str
    school_id: str
    user_id: str
    subjects: List[str] = []
    classes: List[str] = []
    created_at: datetime

class InvoiceBase(BaseModel):
    student_id: str
    amount: float
    description: str
    description_ar: Optional[str] = None
    due_date: str
    status: str = "pending"  # pending, paid, overdue, cancelled

class InvoiceCreate(InvoiceBase):
    school_id: str

class InvoiceResponse(InvoiceBase):
    invoice_id: str
    school_id: str
    invoice_number: str
    paid_amount: float = 0
    created_at: datetime

class PaymentBase(BaseModel):
    invoice_id: str
    amount: float
    payment_method: str = "cash"  # cash, transfer, card
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    school_id: str

class PaymentResponse(PaymentBase):
    payment_id: str
    school_id: str
    receipt_number: str
    created_at: datetime

class NotificationBase(BaseModel):
    title: str
    title_ar: Optional[str] = None
    message: str
    message_ar: Optional[str] = None
    notification_type: str = "general"  # general, academic, financial, attendance
    priority: str = "normal"  # low, normal, high, urgent
    target_roles: List[str] = []
    target_users: List[str] = []

class NotificationCreate(NotificationBase):
    school_id: str
    send_sms: bool = False
    send_push: bool = True

class NotificationResponse(NotificationBase):
    notification_id: str
    school_id: str
    sender_id: str
    is_read: bool = False
    created_at: datetime

class GradeBase(BaseModel):
    name: str
    name_ar: str
    level: int
    description: Optional[str] = None

class GradeCreate(GradeBase):
    school_id: str

class GradeResponse(GradeBase):
    grade_id: str
    school_id: str
    section_count: int = 0
    student_count: int = 0
    created_at: datetime

class SubjectBase(BaseModel):
    name: str
    name_ar: str
    code: str
    credits: int = 1
    description: Optional[str] = None

class SubjectCreate(SubjectBase):
    school_id: str
    grade_ids: List[str] = []

class SubjectResponse(SubjectBase):
    subject_id: str
    school_id: str
    grade_ids: List[str] = []
    created_at: datetime

class ExamBase(BaseModel):
    name: str
    name_ar: str
    exam_type: str = "midterm"  # quiz, midterm, final, assignment
    subject_id: str
    grade_id: str
    max_score: float = 100
    date: str
    duration_minutes: int = 60

class ExamCreate(ExamBase):
    school_id: str

class ExamResponse(ExamBase):
    exam_id: str
    school_id: str
    created_at: datetime

class AttendanceBase(BaseModel):
    student_id: str
    date: str
    status: str = "present"  # present, absent, late, excused
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    school_id: str
    subject_id: Optional[str] = None
    recorded_by: str

class AttendanceResponse(AttendanceBase):
    attendance_id: str
    school_id: str
    subject_id: Optional[str] = None
    recorded_by: str
    created_at: datetime

class AIMessageRequest(BaseModel):
    message: str
    context: Optional[str] = None

class AIMessageResponse(BaseModel):
    response: str
    timestamp: datetime

class DashboardStats(BaseModel):
    total_schools: int = 0
    total_students: int = 0
    total_teachers: int = 0
    total_revenue: float = 0
    active_licenses: int = 0
    expiring_licenses: int = 0

# ==================== HELPER FUNCTIONS ====================

def generate_id(prefix: str = "") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}" if prefix else uuid.uuid4().hex[:12]

def generate_license_key() -> str:
    import random
    import string
    segments = []
    for _ in range(4):
        segment = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        segments.append(segment)
    return '-'.join(segments)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_access_token(user_id: str, role: str, school_id: Optional[str] = None) -> str:
    expires = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "role": role,
        "school_id": school_id,
        "exp": expires,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    # First check cookie
    session_token = request.cookies.get("session_token")
    
    if session_token:
        # Verify session from database
        session = await db.user_sessions.find_one(
            {"session_token": session_token},
            {"_id": 0}
        )
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one(
                    {"user_id": session["user_id"]},
                    {"_id": 0, "password": 0}
                )
                if user:
                    return user
    
    # Then check Authorization header (JWT)
    if credentials:
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("sub")
            if user_id:
                user = await db.users.find_one(
                    {"user_id": user_id},
                    {"_id": 0, "password": 0}
                )
                if user:
                    return user
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    raise HTTPException(status_code=401, detail="Not authenticated")

async def get_optional_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    try:
        return await get_current_user(request, credentials)
    except HTTPException:
        return None

def require_roles(*allowed_roles):
    async def role_checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

async def check_school_license(school_id: str) -> bool:
    """Check if school has valid license"""
    license_doc = await db.licenses.find_one(
        {"school_id": school_id, "status": {"$in": ["active", "grace_period"]}},
        {"_id": 0}
    )
    if not license_doc:
        return False
    
    expires_at = license_doc.get("expires_at")
    if expires_at:
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        if expires_at < datetime.now(timezone.utc):
            # Check grace period
            grace_ends = license_doc.get("grace_period_ends")
            if grace_ends:
                if isinstance(grace_ends, str):
                    grace_ends = datetime.fromisoformat(grace_ends)
                if grace_ends.tzinfo is None:
                    grace_ends = grace_ends.replace(tzinfo=timezone.utc)
                if grace_ends < datetime.now(timezone.utc):
                    return False
    
    return True

# ==================== AUTH ROUTES ====================

@auth_router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    user_id = generate_id("user")
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "name_ar": user_data.name_ar or user_data.name,
        "phone": user_data.phone,
        "role": user_data.role,
        "school_id": user_data.school_id,
        "avatar": user_data.avatar,
        "is_active": True,
        "password": hash_password(user_data.password),
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Remove password from response
    user_doc.pop("password")
    user_doc.pop("updated_at", None)
    user_doc["created_at"] = now
    
    token = create_access_token(user_id, user_data.role, user_data.school_id)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(**user_doc)
    )

@auth_router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    if not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="الحساب معطل")
    
    # Check school license if user belongs to a school
    if user.get("school_id") and user.get("role") not in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if not await check_school_license(user["school_id"]):
            raise HTTPException(status_code=403, detail="ترخيص المدرسة منتهي أو غير فعال")
    
    token = create_access_token(user["user_id"], user["role"], user.get("school_id"))
    
    # Create session
    session_token = generate_id("session")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user.pop("password", None)
    if isinstance(user.get("created_at"), str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(**user)
    )

@auth_router.post("/google-session")
async def process_google_session(request: Request, response: Response):
    """Process Google OAuth session from Emergent Auth"""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    # Fetch user data from Emergent Auth
    async with httpx.AsyncClient() as client_http:
        auth_response = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        auth_data = auth_response.json()
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Find or create user
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if not user:
        user_id = generate_id("user")
        now = datetime.now(timezone.utc)
        user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "name_ar": name,
            "avatar": picture,
            "role": UserRole.SCHOOL_ADMIN,  # Default role for new Google users
            "school_id": None,
            "is_active": True,
            "created_at": now.isoformat()
        }
        await db.users.insert_one(user)
    else:
        user_id = user["user_id"]
        # Update avatar if changed
        if picture and picture != user.get("avatar"):
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"avatar": picture}}
            )
            user["avatar"] = picture
    
    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    if isinstance(user.get("created_at"), str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    
    jwt_token = create_access_token(user["user_id"], user["role"], user.get("school_id"))
    
    return TokenResponse(
        access_token=jwt_token,
        user=UserResponse(**user)
    )

@auth_router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    if isinstance(user.get("created_at"), str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    return UserResponse(**user)

@auth_router.post("/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    return {"message": "تم تسجيل الخروج بنجاح"}

# ==================== SCHOOLS ROUTES ====================

@schools_router.post("/", response_model=SchoolResponse)
async def create_school(
    school_data: SchoolCreate,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN))
):
    school_id = generate_id("school")
    now = datetime.now(timezone.utc)
    
    # Create school
    school_doc = {
        "school_id": school_id,
        "name": school_data.name,
        "name_ar": school_data.name_ar,
        "email": school_data.email,
        "phone": school_data.phone,
        "address": school_data.address,
        "address_ar": school_data.address_ar,
        "logo": school_data.logo,
        "primary_color": school_data.primary_color,
        "secondary_color": school_data.secondary_color,
        "academic_system": school_data.academic_system,
        "currency": school_data.currency,
        "timezone": school_data.timezone,
        "is_active": True,
        "license_status": "pending",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.schools.insert_one(school_doc)
    
    # Create admin user for school
    admin_id = generate_id("user")
    admin_doc = {
        "user_id": admin_id,
        "email": school_data.admin_email,
        "name": school_data.admin_name,
        "name_ar": school_data.admin_name,
        "role": UserRole.SCHOOL_ADMIN,
        "school_id": school_id,
        "is_active": True,
        "password": hash_password(school_data.admin_password),
        "created_at": now.isoformat()
    }
    
    await db.users.insert_one(admin_doc)
    
    school_doc["student_count"] = 0
    school_doc["teacher_count"] = 0
    school_doc["created_at"] = now
    
    return SchoolResponse(**school_doc)

@schools_router.get("/", response_model=List[SchoolResponse])
async def list_schools(
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT))
):
    schools = await db.schools.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for school in schools:
        # Get counts
        student_count = await db.students.count_documents({"school_id": school["school_id"]})
        teacher_count = await db.teachers.count_documents({"school_id": school["school_id"]})
        
        school["student_count"] = student_count
        school["teacher_count"] = teacher_count
        
        if isinstance(school.get("created_at"), str):
            school["created_at"] = datetime.fromisoformat(school["created_at"])
        if isinstance(school.get("license_expires_at"), str):
            school["license_expires_at"] = datetime.fromisoformat(school["license_expires_at"])
        
        result.append(SchoolResponse(**school))
    
    return result

@schools_router.get("/my-school", response_model=SchoolResponse)
async def get_my_school(user: dict = Depends(get_current_user)):
    if not user.get("school_id"):
        raise HTTPException(status_code=404, detail="لا توجد مدرسة مرتبطة بحسابك")
    
    school = await db.schools.find_one({"school_id": user["school_id"]}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="المدرسة غير موجودة")
    
    student_count = await db.students.count_documents({"school_id": school["school_id"]})
    teacher_count = await db.teachers.count_documents({"school_id": school["school_id"]})
    
    school["student_count"] = student_count
    school["teacher_count"] = teacher_count
    
    if isinstance(school.get("created_at"), str):
        school["created_at"] = datetime.fromisoformat(school["created_at"])
    
    return SchoolResponse(**school)

@schools_router.get("/{school_id}", response_model=SchoolResponse)
async def get_school(school_id: str, user: dict = Depends(get_current_user)):
    # Users can only access their own school unless super admin
    if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if user.get("school_id") != school_id:
            raise HTTPException(status_code=403, detail="غير مصرح بالوصول لهذه المدرسة")
    
    school = await db.schools.find_one({"school_id": school_id}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="المدرسة غير موجودة")
    
    student_count = await db.students.count_documents({"school_id": school_id})
    teacher_count = await db.teachers.count_documents({"school_id": school_id})
    
    school["student_count"] = student_count
    school["teacher_count"] = teacher_count
    
    if isinstance(school.get("created_at"), str):
        school["created_at"] = datetime.fromisoformat(school["created_at"])
    
    return SchoolResponse(**school)

@schools_router.put("/{school_id}", response_model=SchoolResponse)
async def update_school(
    school_id: str,
    school_data: SchoolBase,
    user: dict = Depends(get_current_user)
):
    # Check permissions
    if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]:
        raise HTTPException(status_code=403, detail="غير مصرح")
    
    if user["role"] == UserRole.SCHOOL_ADMIN and user.get("school_id") != school_id:
        raise HTTPException(status_code=403, detail="غير مصرح")
    
    update_data = school_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.schools.update_one(
        {"school_id": school_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="المدرسة غير موجودة")
    
    return await get_school(school_id, user)

# ==================== LICENSE ROUTES ====================

@licenses_router.post("/", response_model=LicenseResponse)
async def create_license(
    license_data: LicenseCreate,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN))
):
    # Check if school exists
    school = await db.schools.find_one({"school_id": license_data.school_id}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="المدرسة غير موجودة")
    
    license_id = generate_id("lic")
    license_key = generate_license_key()
    now = datetime.now(timezone.utc)
    
    license_doc = {
        "license_id": license_id,
        "school_id": license_data.school_id,
        "license_key": license_key,
        "license_type": license_data.license_type,
        "max_students": license_data.max_students,
        "max_teachers": license_data.max_teachers,
        "features": license_data.features,
        "status": "pending",
        "created_at": now.isoformat()
    }
    
    await db.licenses.insert_one(license_doc)
    
    license_doc["created_at"] = now
    return LicenseResponse(**license_doc)

@licenses_router.post("/{license_id}/activate", response_model=LicenseResponse)
async def activate_license(
    license_id: str,
    duration_days: int = 30,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN))
):
    license_doc = await db.licenses.find_one({"license_id": license_id}, {"_id": 0})
    if not license_doc:
        raise HTTPException(status_code=404, detail="الترخيص غير موجود")
    
    now = datetime.now(timezone.utc)
    
    if license_doc["license_type"] == "lifetime":
        expires_at = None
        grace_period_ends = None
    else:
        expires_at = now + timedelta(days=duration_days)
        grace_period_ends = expires_at + timedelta(days=7)  # 7 day grace period
    
    update_data = {
        "status": "active",
        "activated_at": now.isoformat(),
        "expires_at": expires_at.isoformat() if expires_at else None,
        "grace_period_ends": grace_period_ends.isoformat() if grace_period_ends else None
    }
    
    await db.licenses.update_one(
        {"license_id": license_id},
        {"$set": update_data}
    )
    
    # Update school license status
    await db.schools.update_one(
        {"school_id": license_doc["school_id"]},
        {"$set": {
            "license_status": "active",
            "license_expires_at": expires_at.isoformat() if expires_at else None
        }}
    )
    
    license_doc.update(update_data)
    
    for key in ["created_at", "activated_at", "expires_at", "grace_period_ends"]:
        if license_doc.get(key) and isinstance(license_doc[key], str):
            license_doc[key] = datetime.fromisoformat(license_doc[key])
    
    return LicenseResponse(**license_doc)

@licenses_router.post("/{license_id}/suspend")
async def suspend_license(
    license_id: str,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN))
):
    result = await db.licenses.update_one(
        {"license_id": license_id},
        {"$set": {"status": "suspended"}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="الترخيص غير موجود")
    
    license_doc = await db.licenses.find_one({"license_id": license_id}, {"_id": 0})
    await db.schools.update_one(
        {"school_id": license_doc["school_id"]},
        {"$set": {"license_status": "suspended"}}
    )
    
    return {"message": "تم تعليق الترخيص"}

@licenses_router.get("/", response_model=List[LicenseResponse])
async def list_licenses(
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT))
):
    licenses = await db.licenses.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for lic in licenses:
        for key in ["created_at", "activated_at", "expires_at", "grace_period_ends"]:
            if lic.get(key) and isinstance(lic[key], str):
                lic[key] = datetime.fromisoformat(lic[key])
        result.append(LicenseResponse(**lic))
    
    return result

@licenses_router.get("/school/{school_id}", response_model=LicenseResponse)
async def get_school_license(school_id: str, user: dict = Depends(get_current_user)):
    license_doc = await db.licenses.find_one(
        {"school_id": school_id},
        {"_id": 0},
        sort=[("created_at", -1)]
    )
    
    if not license_doc:
        raise HTTPException(status_code=404, detail="لا يوجد ترخيص لهذه المدرسة")
    
    for key in ["created_at", "activated_at", "expires_at", "grace_period_ends"]:
        if license_doc.get(key) and isinstance(license_doc[key], str):
            license_doc[key] = datetime.fromisoformat(license_doc[key])
    
    return LicenseResponse(**license_doc)

# ==================== STUDENTS ROUTES ====================

@students_router.post("/", response_model=StudentResponse)
async def create_student(
    student_data: StudentCreate,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_MANAGER))
):
    # Check school license
    if not await check_school_license(student_data.school_id):
        raise HTTPException(status_code=403, detail="ترخيص المدرسة غير فعال")
    
    student_id = generate_id("stu")
    now = datetime.now(timezone.utc)
    
    student_doc = {
        "student_id": student_id,
        "school_id": student_data.school_id,
        "name": student_data.name,
        "name_ar": student_data.name_ar,
        "email": student_data.email,
        "phone": student_data.phone,
        "date_of_birth": student_data.date_of_birth,
        "gender": student_data.gender,
        "national_id": student_data.national_id,
        "address": student_data.address,
        "grade_id": student_data.grade_id,
        "section_id": student_data.section_id,
        "parent_id": student_data.parent_id,
        "enrollment_date": student_data.enrollment_date or now.strftime("%Y-%m-%d"),
        "status": student_data.status,
        "avatar": student_data.avatar,
        "created_at": now.isoformat()
    }
    
    # Create user account if password provided
    if student_data.password and student_data.email:
        user_id = generate_id("user")
        user_doc = {
            "user_id": user_id,
            "email": student_data.email,
            "name": student_data.name,
            "name_ar": student_data.name_ar,
            "role": UserRole.STUDENT,
            "school_id": student_data.school_id,
            "is_active": True,
            "password": hash_password(student_data.password),
            "created_at": now.isoformat()
        }
        await db.users.insert_one(user_doc)
        student_doc["user_id"] = user_id
    
    await db.students.insert_one(student_doc)
    
    student_doc["created_at"] = now
    return StudentResponse(**student_doc)

@students_router.get("/", response_model=List[StudentResponse])
async def list_students(
    school_id: Optional[str] = None,
    grade_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    # Filter by user's school unless super admin
    query = {}
    if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if school_id:
            query["school_id"] = school_id
    else:
        query["school_id"] = user.get("school_id")
    
    if grade_id:
        query["grade_id"] = grade_id
    if status:
        query["status"] = status
    
    students = await db.students.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for student in students:
        if isinstance(student.get("created_at"), str):
            student["created_at"] = datetime.fromisoformat(student["created_at"])
        result.append(StudentResponse(**student))
    
    return result

@students_router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: str, user: dict = Depends(get_current_user)):
    student = await db.students.find_one({"student_id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")
    
    # Check access
    if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if student.get("school_id") != user.get("school_id"):
            raise HTTPException(status_code=403, detail="غير مصرح")
    
    if isinstance(student.get("created_at"), str):
        student["created_at"] = datetime.fromisoformat(student["created_at"])
    
    return StudentResponse(**student)

@students_router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: str,
    student_data: StudentBase,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_MANAGER))
):
    update_data = student_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.students.update_one(
        {"student_id": student_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")
    
    return await get_student(student_id, user)

@students_router.delete("/{student_id}")
async def delete_student(
    student_id: str,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN))
):
    result = await db.students.delete_one({"student_id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")
    return {"message": "تم حذف الطالب بنجاح"}

# ==================== TEACHERS ROUTES ====================

@teachers_router.post("/", response_model=TeacherResponse)
async def create_teacher(
    teacher_data: TeacherCreate,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_MANAGER))
):
    # Check school license
    if not await check_school_license(teacher_data.school_id):
        raise HTTPException(status_code=403, detail="ترخيص المدرسة غير فعال")
    
    teacher_id = generate_id("tch")
    user_id = generate_id("user")
    now = datetime.now(timezone.utc)
    
    # Create user account
    user_doc = {
        "user_id": user_id,
        "email": teacher_data.email,
        "name": teacher_data.name,
        "name_ar": teacher_data.name_ar,
        "role": UserRole.TEACHER,
        "school_id": teacher_data.school_id,
        "is_active": True,
        "password": hash_password(teacher_data.password),
        "created_at": now.isoformat()
    }
    await db.users.insert_one(user_doc)
    
    teacher_doc = {
        "teacher_id": teacher_id,
        "user_id": user_id,
        "school_id": teacher_data.school_id,
        "name": teacher_data.name,
        "name_ar": teacher_data.name_ar,
        "email": teacher_data.email,
        "phone": teacher_data.phone,
        "specialization": teacher_data.specialization,
        "qualification": teacher_data.qualification,
        "hire_date": teacher_data.hire_date or now.strftime("%Y-%m-%d"),
        "status": teacher_data.status,
        "avatar": teacher_data.avatar,
        "subjects": [],
        "classes": [],
        "created_at": now.isoformat()
    }
    
    await db.teachers.insert_one(teacher_doc)
    
    teacher_doc["created_at"] = now
    return TeacherResponse(**teacher_doc)

@teachers_router.get("/", response_model=List[TeacherResponse])
async def list_teachers(
    school_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if school_id:
            query["school_id"] = school_id
    else:
        query["school_id"] = user.get("school_id")
    
    if status:
        query["status"] = status
    
    teachers = await db.teachers.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for teacher in teachers:
        if isinstance(teacher.get("created_at"), str):
            teacher["created_at"] = datetime.fromisoformat(teacher["created_at"])
        result.append(TeacherResponse(**teacher))
    
    return result

@teachers_router.get("/{teacher_id}", response_model=TeacherResponse)
async def get_teacher(teacher_id: str, user: dict = Depends(get_current_user)):
    teacher = await db.teachers.find_one({"teacher_id": teacher_id}, {"_id": 0})
    if not teacher:
        raise HTTPException(status_code=404, detail="المعلم غير موجود")
    
    if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if teacher.get("school_id") != user.get("school_id"):
            raise HTTPException(status_code=403, detail="غير مصرح")
    
    if isinstance(teacher.get("created_at"), str):
        teacher["created_at"] = datetime.fromisoformat(teacher["created_at"])
    
    return TeacherResponse(**teacher)

# ==================== FINANCE ROUTES ====================

@finance_router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(
    invoice_data: InvoiceCreate,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT))
):
    invoice_id = generate_id("inv")
    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now(timezone.utc)
    
    invoice_doc = {
        "invoice_id": invoice_id,
        "invoice_number": invoice_number,
        "school_id": invoice_data.school_id,
        "student_id": invoice_data.student_id,
        "amount": invoice_data.amount,
        "paid_amount": 0,
        "description": invoice_data.description,
        "description_ar": invoice_data.description_ar,
        "due_date": invoice_data.due_date,
        "status": invoice_data.status,
        "created_at": now.isoformat()
    }
    
    await db.invoices.insert_one(invoice_doc)
    
    invoice_doc["created_at"] = now
    return InvoiceResponse(**invoice_doc)

@finance_router.get("/invoices", response_model=List[InvoiceResponse])
async def list_invoices(
    school_id: Optional[str] = None,
    student_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if school_id:
            query["school_id"] = school_id
    else:
        query["school_id"] = user.get("school_id")
    
    if student_id:
        query["student_id"] = student_id
    if status:
        query["status"] = status
    
    invoices = await db.invoices.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for invoice in invoices:
        if isinstance(invoice.get("created_at"), str):
            invoice["created_at"] = datetime.fromisoformat(invoice["created_at"])
        result.append(InvoiceResponse(**invoice))
    
    return result

@finance_router.post("/payments", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT))
):
    # Get invoice
    invoice = await db.invoices.find_one({"invoice_id": payment_data.invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="الفاتورة غير موجودة")
    
    payment_id = generate_id("pay")
    receipt_number = f"RCP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now(timezone.utc)
    
    payment_doc = {
        "payment_id": payment_id,
        "receipt_number": receipt_number,
        "school_id": payment_data.school_id,
        "invoice_id": payment_data.invoice_id,
        "amount": payment_data.amount,
        "payment_method": payment_data.payment_method,
        "notes": payment_data.notes,
        "created_at": now.isoformat()
    }
    
    await db.payments.insert_one(payment_doc)
    
    # Update invoice
    new_paid = invoice.get("paid_amount", 0) + payment_data.amount
    new_status = "paid" if new_paid >= invoice["amount"] else "pending"
    
    await db.invoices.update_one(
        {"invoice_id": payment_data.invoice_id},
        {"$set": {"paid_amount": new_paid, "status": new_status}}
    )
    
    payment_doc["created_at"] = now
    return PaymentResponse(**payment_doc)

@finance_router.get("/payments", response_model=List[PaymentResponse])
async def list_payments(
    school_id: Optional[str] = None,
    invoice_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if school_id:
            query["school_id"] = school_id
    else:
        query["school_id"] = user.get("school_id")
    
    if invoice_id:
        query["invoice_id"] = invoice_id
    
    payments = await db.payments.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for payment in payments:
        if isinstance(payment.get("created_at"), str):
            payment["created_at"] = datetime.fromisoformat(payment["created_at"])
        result.append(PaymentResponse(**payment))
    
    return result

@finance_router.get("/summary")
async def get_finance_summary(
    school_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if school_id:
            query["school_id"] = school_id
    else:
        query["school_id"] = user.get("school_id")
    
    # Get totals
    invoices = await db.invoices.find(query, {"_id": 0}).to_list(10000)
    payments = await db.payments.find(query, {"_id": 0}).to_list(10000)
    
    total_invoiced = sum(inv.get("amount", 0) for inv in invoices)
    total_collected = sum(pay.get("amount", 0) for pay in payments)
    total_pending = total_invoiced - total_collected
    
    pending_count = len([inv for inv in invoices if inv.get("status") == "pending"])
    paid_count = len([inv for inv in invoices if inv.get("status") == "paid"])
    overdue_count = len([inv for inv in invoices if inv.get("status") == "overdue"])
    
    return {
        "total_invoiced": total_invoiced,
        "total_collected": total_collected,
        "total_pending": total_pending,
        "invoice_counts": {
            "pending": pending_count,
            "paid": paid_count,
            "overdue": overdue_count,
            "total": len(invoices)
        }
    }

# ==================== ACADEMIC ROUTES ====================

@academic_router.post("/grades", response_model=GradeResponse)
async def create_grade(
    grade_data: GradeCreate,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN))
):
    grade_id = generate_id("grd")
    now = datetime.now(timezone.utc)
    
    grade_doc = {
        "grade_id": grade_id,
        "school_id": grade_data.school_id,
        "name": grade_data.name,
        "name_ar": grade_data.name_ar,
        "level": grade_data.level,
        "description": grade_data.description,
        "created_at": now.isoformat()
    }
    
    await db.grades.insert_one(grade_doc)
    
    grade_doc["created_at"] = now
    grade_doc["section_count"] = 0
    grade_doc["student_count"] = 0
    return GradeResponse(**grade_doc)

@academic_router.get("/grades", response_model=List[GradeResponse])
async def list_grades(
    school_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if school_id:
            query["school_id"] = school_id
    else:
        query["school_id"] = user.get("school_id")
    
    grades = await db.grades.find(query, {"_id": 0}).to_list(100)
    
    result = []
    for grade in grades:
        student_count = await db.students.count_documents({"grade_id": grade["grade_id"]})
        grade["student_count"] = student_count
        grade["section_count"] = 0
        
        if isinstance(grade.get("created_at"), str):
            grade["created_at"] = datetime.fromisoformat(grade["created_at"])
        result.append(GradeResponse(**grade))
    
    return result

@academic_router.post("/subjects", response_model=SubjectResponse)
async def create_subject(
    subject_data: SubjectCreate,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN))
):
    subject_id = generate_id("sub")
    now = datetime.now(timezone.utc)
    
    subject_doc = {
        "subject_id": subject_id,
        "school_id": subject_data.school_id,
        "name": subject_data.name,
        "name_ar": subject_data.name_ar,
        "code": subject_data.code,
        "credits": subject_data.credits,
        "description": subject_data.description,
        "grade_ids": subject_data.grade_ids,
        "created_at": now.isoformat()
    }
    
    await db.subjects.insert_one(subject_doc)
    
    subject_doc["created_at"] = now
    return SubjectResponse(**subject_doc)

@academic_router.get("/subjects", response_model=List[SubjectResponse])
async def list_subjects(
    school_id: Optional[str] = None,
    grade_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if school_id:
            query["school_id"] = school_id
    else:
        query["school_id"] = user.get("school_id")
    
    if grade_id:
        query["grade_ids"] = grade_id
    
    subjects = await db.subjects.find(query, {"_id": 0}).to_list(100)
    
    result = []
    for subject in subjects:
        if isinstance(subject.get("created_at"), str):
            subject["created_at"] = datetime.fromisoformat(subject["created_at"])
        result.append(SubjectResponse(**subject))
    
    return result

@academic_router.post("/exams", response_model=ExamResponse)
async def create_exam(
    exam_data: ExamCreate,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER))
):
    exam_id = generate_id("exm")
    now = datetime.now(timezone.utc)
    
    exam_doc = {
        "exam_id": exam_id,
        "school_id": exam_data.school_id,
        "name": exam_data.name,
        "name_ar": exam_data.name_ar,
        "exam_type": exam_data.exam_type,
        "subject_id": exam_data.subject_id,
        "grade_id": exam_data.grade_id,
        "max_score": exam_data.max_score,
        "date": exam_data.date,
        "duration_minutes": exam_data.duration_minutes,
        "created_at": now.isoformat()
    }
    
    await db.exams.insert_one(exam_doc)
    
    exam_doc["created_at"] = now
    return ExamResponse(**exam_doc)

@academic_router.get("/exams", response_model=List[ExamResponse])
async def list_exams(
    school_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    grade_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if school_id:
            query["school_id"] = school_id
    else:
        query["school_id"] = user.get("school_id")
    
    if subject_id:
        query["subject_id"] = subject_id
    if grade_id:
        query["grade_id"] = grade_id
    
    exams = await db.exams.find(query, {"_id": 0}).to_list(100)
    
    result = []
    for exam in exams:
        if isinstance(exam.get("created_at"), str):
            exam["created_at"] = datetime.fromisoformat(exam["created_at"])
        result.append(ExamResponse(**exam))
    
    return result

# ==================== ATTENDANCE ROUTES ====================

@academic_router.post("/attendance", response_model=AttendanceResponse)
async def record_attendance(
    attendance_data: AttendanceCreate,
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER))
):
    attendance_id = generate_id("att")
    now = datetime.now(timezone.utc)
    
    attendance_doc = {
        "attendance_id": attendance_id,
        "school_id": attendance_data.school_id,
        "student_id": attendance_data.student_id,
        "subject_id": attendance_data.subject_id,
        "date": attendance_data.date,
        "status": attendance_data.status,
        "notes": attendance_data.notes,
        "recorded_by": attendance_data.recorded_by,
        "created_at": now.isoformat()
    }
    
    await db.attendance.insert_one(attendance_doc)
    
    attendance_doc["created_at"] = now
    return AttendanceResponse(**attendance_doc)

@academic_router.get("/attendance", response_model=List[AttendanceResponse])
async def list_attendance(
    school_id: Optional[str] = None,
    student_id: Optional[str] = None,
    date: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if school_id:
            query["school_id"] = school_id
    else:
        query["school_id"] = user.get("school_id")
    
    if student_id:
        query["student_id"] = student_id
    if date:
        query["date"] = date
    
    records = await db.attendance.find(query, {"_id": 0}).to_list(1000)
    
    result = []
    for record in records:
        if isinstance(record.get("created_at"), str):
            record["created_at"] = datetime.fromisoformat(record["created_at"])
        result.append(AttendanceResponse(**record))
    
    return result

# ==================== NOTIFICATIONS ROUTES ====================

@notifications_router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification_data: NotificationCreate,
    user: dict = Depends(get_current_user)
):
    notification_id = generate_id("notif")
    now = datetime.now(timezone.utc)
    
    notification_doc = {
        "notification_id": notification_id,
        "school_id": notification_data.school_id,
        "sender_id": user["user_id"],
        "title": notification_data.title,
        "title_ar": notification_data.title_ar or notification_data.title,
        "message": notification_data.message,
        "message_ar": notification_data.message_ar or notification_data.message,
        "notification_type": notification_data.notification_type,
        "priority": notification_data.priority,
        "target_roles": notification_data.target_roles,
        "target_users": notification_data.target_users,
        "is_read": False,
        "created_at": now.isoformat()
    }
    
    await db.notifications.insert_one(notification_doc)
    
    # TODO: Send SMS if requested (Twilio integration)
    if notification_data.send_sms:
        # Placeholder for Twilio SMS
        pass
    
    notification_doc["created_at"] = now
    return NotificationResponse(**notification_doc)

@notifications_router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    school_id: Optional[str] = None,
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    query = {}
    
    if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
        if school_id:
            query["school_id"] = school_id
    else:
        query["$or"] = [
            {"school_id": user.get("school_id"), "target_roles": user["role"]},
            {"target_users": user["user_id"]}
        ]
    
    if unread_only:
        query["is_read"] = False
    
    notifications = await db.notifications.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for notif in notifications:
        if isinstance(notif.get("created_at"), str):
            notif["created_at"] = datetime.fromisoformat(notif["created_at"])
        result.append(NotificationResponse(**notif))
    
    return result

@notifications_router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, user: dict = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"notification_id": notification_id},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="الإشعار غير موجود")
    return {"message": "تم تحديث حالة الإشعار"}

# ==================== AI ASSISTANT ROUTES ====================

@ai_router.post("/chat", response_model=AIMessageResponse)
async def chat_with_ai(
    request: AIMessageRequest,
    user: dict = Depends(get_current_user)
):
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        system_message = """أنت مساعد ذكي لنظام إدارة المدارس. يمكنك مساعدة المستخدمين في:
        - الإجابة على أسئلة حول النظام
        - تقديم إرشادات حول استخدام الميزات
        - المساعدة في حل المشكلات
        - تقديم نصائح تعليمية وإدارية
        
        أجب دائماً باللغة العربية بشكل واضح ومفيد."""
        
        if request.context:
            system_message += f"\n\nسياق إضافي: {request.context}"
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"sms-{user['user_id']}-{datetime.now().strftime('%Y%m%d')}",
            system_message=system_message
        )
        chat.with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        return AIMessageResponse(
            response=response,
            timestamp=datetime.now(timezone.utc)
        )
    except ImportError:
        raise HTTPException(status_code=500, detail="AI module not installed")
    except Exception as e:
        logging.error(f"AI chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="خطأ في خدمة الذكاء الاصطناعي")

# ==================== DASHBOARD ROUTES ====================

@api_router.get("/dashboard/super-admin", response_model=DashboardStats)
async def get_super_admin_dashboard(
    user: dict = Depends(require_roles(UserRole.SUPER_ADMIN))
):
    total_schools = await db.schools.count_documents({})
    total_students = await db.students.count_documents({})
    total_teachers = await db.teachers.count_documents({})
    
    # Calculate revenue
    payments = await db.payments.find({}, {"_id": 0, "amount": 1}).to_list(10000)
    total_revenue = sum(p.get("amount", 0) for p in payments)
    
    # License stats
    active_licenses = await db.licenses.count_documents({"status": "active"})
    
    # Expiring in 30 days
    thirty_days = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    expiring_licenses = await db.licenses.count_documents({
        "status": "active",
        "expires_at": {"$lte": thirty_days}
    })
    
    return DashboardStats(
        total_schools=total_schools,
        total_students=total_students,
        total_teachers=total_teachers,
        total_revenue=total_revenue,
        active_licenses=active_licenses,
        expiring_licenses=expiring_licenses
    )

@api_router.get("/dashboard/school")
async def get_school_dashboard(user: dict = Depends(get_current_user)):
    school_id = user.get("school_id")
    if not school_id:
        raise HTTPException(status_code=400, detail="لا توجد مدرسة مرتبطة")
    
    total_students = await db.students.count_documents({"school_id": school_id})
    total_teachers = await db.teachers.count_documents({"school_id": school_id})
    
    # Finance summary
    invoices = await db.invoices.find({"school_id": school_id}, {"_id": 0}).to_list(10000)
    total_invoiced = sum(inv.get("amount", 0) for inv in invoices)
    total_collected = sum(inv.get("paid_amount", 0) for inv in invoices)
    
    # Today's attendance
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    attendance_today = await db.attendance.find(
        {"school_id": school_id, "date": today},
        {"_id": 0}
    ).to_list(10000)
    
    present_count = len([a for a in attendance_today if a.get("status") == "present"])
    absent_count = len([a for a in attendance_today if a.get("status") == "absent"])
    
    # Recent notifications
    recent_notifications = await db.notifications.find(
        {"school_id": school_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "finance": {
            "total_invoiced": total_invoiced,
            "total_collected": total_collected,
            "pending": total_invoiced - total_collected
        },
        "attendance_today": {
            "present": present_count,
            "absent": absent_count,
            "total": present_count + absent_count
        },
        "recent_notifications": recent_notifications
    }

# ==================== ROOT AND HEALTH ====================

@api_router.get("/")
async def root():
    return {"message": "School Management System API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include routers
api_router.include_router(auth_router)
api_router.include_router(schools_router)
api_router.include_router(students_router)
api_router.include_router(teachers_router)
api_router.include_router(licenses_router)
api_router.include_router(finance_router)
api_router.include_router(academic_router)
api_router.include_router(notifications_router)
api_router.include_router(ai_router)

# Include extended routes
from routes_extended import setup_extended_routes
extended_routers = setup_extended_routes(db, get_current_user, require_roles, UserRole)
api_router.include_router(extended_routers["sections_router"])
api_router.include_router(extended_routers["schedule_router"])
api_router.include_router(extended_routers["assignments_router"])
api_router.include_router(extended_routers["messages_router"])
api_router.include_router(extended_routers["reports_router"])
api_router.include_router(extended_routers["activity_router"])
api_router.include_router(extended_routers["settings_router"])
api_router.include_router(extended_routers["parent_router"])
api_router.include_router(extended_routers["levels_router"])

app.include_router(api_router)

# CORS middleware - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
