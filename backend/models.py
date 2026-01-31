"""
Extended Models for School Management System
Includes: Academic Levels, Sections, Schedules, Assignments, Messages, etc.
"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# ==================== ACADEMIC STRUCTURE ====================

class AcademicYearBase(BaseModel):
    name: str  # e.g., "2024-2025"
    name_ar: str  # e.g., "العام الدراسي 2024-2025"
    start_date: str
    end_date: str
    is_current: bool = False
    semesters: List[Dict] = []  # [{name, start_date, end_date}]

class AcademicYearCreate(AcademicYearBase):
    school_id: str

class AcademicYearResponse(AcademicYearBase):
    year_id: str
    school_id: str
    created_at: datetime

class AcademicLevelBase(BaseModel):
    """Academic Stage: Primary, Middle, High School"""
    name: str  # e.g., "Primary"
    name_ar: str  # e.g., "المرحلة الابتدائية"
    order: int = 1
    description: Optional[str] = None

class AcademicLevelCreate(AcademicLevelBase):
    school_id: str

class AcademicLevelResponse(AcademicLevelBase):
    level_id: str
    school_id: str
    grade_count: int = 0
    created_at: datetime

class SectionBase(BaseModel):
    """Classroom/Section within a Grade"""
    name: str  # e.g., "A", "B", "1"
    name_ar: str  # e.g., "شعبة أ"
    grade_id: str
    capacity: int = 30
    homeroom_teacher_id: Optional[str] = None

class SectionCreate(SectionBase):
    school_id: str

class SectionResponse(SectionBase):
    section_id: str
    school_id: str
    student_count: int = 0
    created_at: datetime

# ==================== SCHEDULE ====================

class SchedulePeriodBase(BaseModel):
    """Single period in the timetable"""
    day: int  # 0=Sunday, 1=Monday, etc.
    period_number: int  # 1, 2, 3, etc.
    start_time: str  # "08:00"
    end_time: str  # "08:45"
    subject_id: Optional[str] = None
    teacher_id: Optional[str] = None
    section_id: str
    room: Optional[str] = None

class SchedulePeriodCreate(SchedulePeriodBase):
    school_id: str

class SchedulePeriodResponse(SchedulePeriodBase):
    period_id: str
    school_id: str
    subject_name: Optional[str] = None
    teacher_name: Optional[str] = None
    created_at: datetime

class ScheduleTemplateBase(BaseModel):
    """School day schedule template"""
    name: str
    name_ar: str
    periods: List[Dict]  # [{period_number, start_time, end_time}]

class ScheduleTemplateCreate(ScheduleTemplateBase):
    school_id: str

class ScheduleTemplateResponse(ScheduleTemplateBase):
    template_id: str
    school_id: str
    created_at: datetime

# ==================== ASSIGNMENTS ====================

class AssignmentBase(BaseModel):
    title: str
    title_ar: str
    description: Optional[str] = None
    description_ar: Optional[str] = None
    subject_id: str
    grade_id: str
    section_id: Optional[str] = None  # None = all sections
    due_date: str
    max_score: float = 100
    assignment_type: str = "homework"  # homework, project, research
    attachments: List[str] = []

class AssignmentCreate(AssignmentBase):
    school_id: str
    teacher_id: str

class AssignmentResponse(AssignmentBase):
    assignment_id: str
    school_id: str
    teacher_id: str
    submission_count: int = 0
    created_at: datetime

class AssignmentSubmissionBase(BaseModel):
    assignment_id: str
    student_id: str
    content: Optional[str] = None
    attachments: List[str] = []
    score: Optional[float] = None
    feedback: Optional[str] = None
    status: str = "submitted"  # submitted, graded, late

class AssignmentSubmissionCreate(AssignmentSubmissionBase):
    school_id: str

class AssignmentSubmissionResponse(AssignmentSubmissionBase):
    submission_id: str
    school_id: str
    submitted_at: datetime
    graded_at: Optional[datetime] = None

# ==================== MESSAGES ====================

class MessageBase(BaseModel):
    subject: str
    subject_ar: Optional[str] = None
    content: str
    content_ar: Optional[str] = None
    message_type: str = "general"  # general, announcement, urgent
    recipient_type: str = "user"  # user, role, all
    recipient_ids: List[str] = []  # user_ids or role names
    attachments: List[str] = []

class MessageCreate(MessageBase):
    school_id: str
    sender_id: str

class MessageResponse(MessageBase):
    message_id: str
    school_id: str
    sender_id: str
    sender_name: Optional[str] = None
    is_read: bool = False
    read_by: List[str] = []
    created_at: datetime

class MessageThreadBase(BaseModel):
    participants: List[str]
    subject: str
    last_message: Optional[str] = None

class MessageThreadCreate(MessageThreadBase):
    school_id: str

class MessageThreadResponse(MessageThreadBase):
    thread_id: str
    school_id: str
    message_count: int = 0
    updated_at: datetime
    created_at: datetime

# ==================== ACTIVITY LOG ====================

class ActivityLogBase(BaseModel):
    user_id: str
    action: str  # created, updated, deleted, viewed, login, logout
    entity_type: str  # student, teacher, grade, etc.
    entity_id: Optional[str] = None
    details: Optional[Dict] = None
    ip_address: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    school_id: Optional[str] = None

class ActivityLogResponse(ActivityLogBase):
    log_id: str
    school_id: Optional[str] = None
    user_name: Optional[str] = None
    created_at: datetime

# ==================== SCHOOL SETTINGS ====================

class SchoolSettingsBase(BaseModel):
    school_name: str
    school_name_ar: str
    logo_url: Optional[str] = None
    address: Optional[str] = None
    address_ar: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    primary_color: str = "#047857"
    secondary_color: str = "#475569"
    academic_system: str = "semester"
    grading_system: str = "percentage"  # percentage, gpa, letter
    attendance_system: str = "daily"  # daily, per_subject
    currency: str = "LYD"
    timezone: str = "Africa/Tripoli"
    language: str = "ar"
    features: Dict = {}  # {sms: true, email: true, etc.}

class SchoolSettingsUpdate(SchoolSettingsBase):
    pass

class SchoolSettingsResponse(SchoolSettingsBase):
    school_id: str
    updated_at: datetime

# ==================== REPORTS ====================

class ReportRequest(BaseModel):
    report_type: str  # attendance, grades, finance, students, teachers
    school_id: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade_id: Optional[str] = None
    section_id: Optional[str] = None
    student_id: Optional[str] = None
    teacher_id: Optional[str] = None
    format: str = "json"  # json, pdf, excel

class ReportResponse(BaseModel):
    report_id: str
    report_type: str
    title: str
    title_ar: str
    generated_at: datetime
    data: Any
    summary: Dict

# ==================== CERTIFICATES ====================

class CertificateTemplateBase(BaseModel):
    name: str
    name_ar: str
    template_type: str  # report_card, certificate, transcript
    html_template: str
    css_styles: Optional[str] = None
    is_default: bool = False

class CertificateTemplateCreate(CertificateTemplateBase):
    school_id: str

class CertificateTemplateResponse(CertificateTemplateBase):
    template_id: str
    school_id: str
    created_at: datetime

class CertificateRequest(BaseModel):
    template_id: str
    student_id: str
    academic_year_id: Optional[str] = None
    semester: Optional[str] = None
    data: Optional[Dict] = None

class CertificateResponse(BaseModel):
    certificate_id: str
    student_id: str
    template_id: str
    generated_at: datetime
    pdf_url: Optional[str] = None

# ==================== MEDIA LIBRARY ====================

class MediaFileBase(BaseModel):
    filename: str
    file_type: str  # image, document, video, audio
    file_size: int
    url: str
    folder: Optional[str] = None
    description: Optional[str] = None
    tags: List[str] = []

class MediaFileCreate(MediaFileBase):
    school_id: str
    uploaded_by: str

class MediaFileResponse(MediaFileBase):
    file_id: str
    school_id: str
    uploaded_by: str
    created_at: datetime

# ==================== PARENT LINKING ====================

class ParentStudentLinkBase(BaseModel):
    parent_id: str
    student_id: str
    relationship: str = "parent"  # parent, guardian, other

class ParentStudentLinkCreate(ParentStudentLinkBase):
    school_id: str

class ParentStudentLinkResponse(ParentStudentLinkBase):
    link_id: str
    school_id: str
    student_name: Optional[str] = None
    parent_name: Optional[str] = None
    created_at: datetime

# ==================== STUDENT TRANSFER ====================

class StudentTransferBase(BaseModel):
    student_id: str
    from_grade_id: str
    from_section_id: Optional[str] = None
    to_grade_id: str
    to_section_id: Optional[str] = None
    transfer_date: str
    reason: Optional[str] = None
    academic_year_id: Optional[str] = None

class StudentTransferCreate(StudentTransferBase):
    school_id: str
    processed_by: str

class StudentTransferResponse(StudentTransferBase):
    transfer_id: str
    school_id: str
    processed_by: str
    status: str = "completed"
    created_at: datetime

# ==================== ARCHIVE ====================

class ArchivedStudentBase(BaseModel):
    student_id: str
    archive_reason: str  # graduated, transferred, withdrawn, expelled
    archive_date: str
    notes: Optional[str] = None
    final_grade_id: Optional[str] = None
    final_gpa: Optional[float] = None

class ArchivedStudentCreate(ArchivedStudentBase):
    school_id: str
    archived_by: str

class ArchivedStudentResponse(ArchivedStudentBase):
    archive_id: str
    school_id: str
    archived_by: str
    student_data: Dict  # Full student data snapshot
    created_at: datetime
