"""
Extended API Routes for School Management System
Includes: Sections, Schedules, Assignments, Messages, Reports, etc.
"""
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import json
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_RIGHT, TA_CENTER

# Create routers
sections_router = APIRouter(prefix="/sections", tags=["Sections"])
schedule_router = APIRouter(prefix="/schedule", tags=["Schedule"])
assignments_router = APIRouter(prefix="/assignments", tags=["Assignments"])
messages_router = APIRouter(prefix="/messages", tags=["Messages"])
reports_router = APIRouter(prefix="/reports", tags=["Reports"])
activity_router = APIRouter(prefix="/activity", tags=["Activity Log"])
settings_router = APIRouter(prefix="/settings", tags=["Settings"])
parent_router = APIRouter(prefix="/parent", tags=["Parent Portal"])
levels_router = APIRouter(prefix="/levels", tags=["Academic Levels"])
onboarding_router = APIRouter(prefix="/onboarding", tags=["Onboarding"])
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])
export_router = APIRouter(prefix="/reports", tags=["Export Reports"])
rooms_router = APIRouter(prefix="/rooms", tags=["Rooms"])


def generate_id(prefix: str = "") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}" if prefix else uuid.uuid4().hex[:12]


def setup_extended_routes(db, get_current_user, require_roles, UserRole):
    """Setup all extended routes with database and auth dependencies"""
    
    # ==================== SECTIONS ROUTES ====================
    
    @sections_router.post("/")
    async def create_section(
        section_data: dict,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        section_id = generate_id("sec")
        now = datetime.now(timezone.utc)
        
        school_id = section_data.get("school_id") or user.get("school_id")
        
        section_doc = {
            "section_id": section_id,
            "school_id": school_id,
            "name": section_data.get("name"),
            "name_ar": section_data.get("name_ar"),
            "grade_id": section_data.get("grade_id"),
            "capacity": section_data.get("capacity", 30),
            "homeroom_teacher_id": section_data.get("homeroom_teacher_id"),
            "created_at": now.isoformat()
        }
        
        await db.sections.insert_one(section_doc)
        
        # Log activity
        await log_activity(db, user["user_id"], school_id, "created", "section", section_id)
        
        section_doc["student_count"] = 0
        section_doc["created_at"] = now
        return section_doc
    
    @sections_router.get("/")
    async def list_sections(
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
            query["grade_id"] = grade_id
        
        sections = await db.sections.find(query, {"_id": 0}).to_list(100)
        
        for section in sections:
            student_count = await db.students.count_documents({"section_id": section["section_id"]})
            section["student_count"] = student_count
        
        return sections
    
    @sections_router.put("/{section_id}")
    async def update_section(
        section_id: str,
        section_data: dict,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        update_data = {k: v for k, v in section_data.items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.sections.update_one(
            {"section_id": section_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="الشعبة غير موجودة")
        
        return {"message": "تم تحديث الشعبة بنجاح"}
    
    @sections_router.delete("/{section_id}")
    async def delete_section(
        section_id: str,
        user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN))
    ):
        result = await db.sections.delete_one({"section_id": section_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="الشعبة غير موجودة")
        return {"message": "تم حذف الشعبة بنجاح"}
    
    # ==================== ACADEMIC LEVELS ROUTES ====================
    
    @levels_router.post("/")
    async def create_level(
        level_data: dict,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        level_id = generate_id("lvl")
        now = datetime.now(timezone.utc)
        
        school_id = level_data.get("school_id") or user.get("school_id")
        
        level_doc = {
            "level_id": level_id,
            "school_id": school_id,
            "name": level_data.get("name"),
            "name_ar": level_data.get("name_ar"),
            "order": level_data.get("order", 1),
            "description": level_data.get("description"),
            "created_at": now.isoformat()
        }
        
        await db.academic_levels.insert_one(level_doc)
        level_doc.pop("_id", None)
        level_doc["grade_count"] = 0
        return level_doc
    
    @levels_router.get("/")
    async def list_levels(
        school_id: Optional[str] = None,
        user: dict = Depends(get_current_user)
    ):
        query = {}
        if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
            if school_id:
                query["school_id"] = school_id
        else:
            query["school_id"] = user.get("school_id")
        
        levels = await db.academic_levels.find(query, {"_id": 0}).sort("order", 1).to_list(100)
        
        for level in levels:
            grade_count = await db.grades.count_documents({
                "school_id": level["school_id"],
                "level_id": level["level_id"]
            })
            level["grade_count"] = grade_count
        
        return levels
    
    # ==================== SCHEDULE ROUTES ====================
    
    @schedule_router.post("/periods")
    async def create_schedule_period(
        period_data: dict,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_MANAGER]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        period_id = generate_id("prd")
        now = datetime.now(timezone.utc)
        
        school_id = period_data.get("school_id") or user.get("school_id")
        
        period_doc = {
            "period_id": period_id,
            "school_id": school_id,
            "day": period_data.get("day"),
            "period_number": period_data.get("period_number"),
            "start_time": period_data.get("start_time"),
            "end_time": period_data.get("end_time"),
            "subject_id": period_data.get("subject_id"),
            "teacher_id": period_data.get("teacher_id"),
            "section_id": period_data.get("section_id"),
            "room": period_data.get("room"),
            "created_at": now.isoformat()
        }
        
        await db.schedule_periods.insert_one(period_doc)
        period_doc["created_at"] = now
        return period_doc
    
    @schedule_router.get("/section/{section_id}")
    async def get_section_schedule(
        section_id: str,
        user: dict = Depends(get_current_user)
    ):
        periods = await db.schedule_periods.find(
            {"section_id": section_id},
            {"_id": 0}
        ).sort([("day", 1), ("period_number", 1)]).to_list(100)
        
        # Enrich with subject and teacher names
        for period in periods:
            if period.get("subject_id"):
                subject = await db.subjects.find_one(
                    {"subject_id": period["subject_id"]},
                    {"_id": 0, "name": 1, "name_ar": 1}
                )
                if subject:
                    period["subject_name"] = subject.get("name")
                    period["subject_name_ar"] = subject.get("name_ar")
            
            if period.get("teacher_id"):
                teacher = await db.teachers.find_one(
                    {"teacher_id": period["teacher_id"]},
                    {"_id": 0, "name": 1, "name_ar": 1}
                )
                if teacher:
                    period["teacher_name"] = teacher.get("name")
                    period["teacher_name_ar"] = teacher.get("name_ar")
        
        return periods
    
    @schedule_router.get("/teacher/{teacher_id}")
    async def get_teacher_schedule(
        teacher_id: str,
        user: dict = Depends(get_current_user)
    ):
        periods = await db.schedule_periods.find(
            {"teacher_id": teacher_id},
            {"_id": 0}
        ).sort([("day", 1), ("period_number", 1)]).to_list(100)
        
        # Enrich with section and subject names
        for period in periods:
            if period.get("subject_id"):
                subject = await db.subjects.find_one(
                    {"subject_id": period["subject_id"]},
                    {"_id": 0, "name": 1, "name_ar": 1}
                )
                if subject:
                    period["subject_name"] = subject.get("name")
                    period["subject_name_ar"] = subject.get("name_ar")
            
            if period.get("section_id"):
                section = await db.sections.find_one(
                    {"section_id": period["section_id"]},
                    {"_id": 0, "name": 1, "name_ar": 1, "grade_id": 1}
                )
                if section:
                    period["section_name"] = section.get("name")
                    period["section_name_ar"] = section.get("name_ar")
                    # Get grade info
                    grade = await db.grades.find_one(
                        {"grade_id": section.get("grade_id")},
                        {"_id": 0, "name": 1, "name_ar": 1}
                    )
                    if grade:
                        period["grade_name"] = grade.get("name")
                        period["grade_name_ar"] = grade.get("name_ar")
        
        return periods
    
    @schedule_router.put("/periods/{period_id}")
    async def update_schedule_period(
        period_id: str,
        period_data: dict,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.SCHOOL_MANAGER]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        update_data = {k: v for k, v in period_data.items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.schedule_periods.update_one(
            {"period_id": period_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="الحصة غير موجودة")
        
        return {"message": "تم تحديث الحصة بنجاح"}
    
    @schedule_router.delete("/periods/{period_id}")
    async def delete_schedule_period(
        period_id: str,
        user: dict = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN))
    ):
        result = await db.schedule_periods.delete_one({"period_id": period_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="الحصة غير موجودة")
        return {"message": "تم حذف الحصة بنجاح"}
    
    # ==================== ASSIGNMENTS ROUTES ====================
    
    @assignments_router.post("/")
    async def create_assignment(
        assignment_data: dict,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        assignment_id = generate_id("asgn")
        now = datetime.now(timezone.utc)
        
        school_id = assignment_data.get("school_id") or user.get("school_id")
        
        assignment_doc = {
            "assignment_id": assignment_id,
            "school_id": school_id,
            "teacher_id": assignment_data.get("teacher_id") or user.get("user_id"),
            "title": assignment_data.get("title"),
            "title_ar": assignment_data.get("title_ar"),
            "description": assignment_data.get("description"),
            "description_ar": assignment_data.get("description_ar"),
            "subject_id": assignment_data.get("subject_id"),
            "grade_id": assignment_data.get("grade_id"),
            "section_id": assignment_data.get("section_id"),
            "due_date": assignment_data.get("due_date"),
            "max_score": assignment_data.get("max_score", 100),
            "assignment_type": assignment_data.get("assignment_type", "homework"),
            "attachments": assignment_data.get("attachments", []),
            "created_at": now.isoformat()
        }
        
        await db.assignments.insert_one(assignment_doc)
        assignment_doc["created_at"] = now
        assignment_doc["submission_count"] = 0
        return assignment_doc
    
    @assignments_router.get("/")
    async def list_assignments(
        school_id: Optional[str] = None,
        teacher_id: Optional[str] = None,
        grade_id: Optional[str] = None,
        subject_id: Optional[str] = None,
        user: dict = Depends(get_current_user)
    ):
        query = {}
        
        if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
            if school_id:
                query["school_id"] = school_id
        elif user["role"] == UserRole.TEACHER:
            # Teachers see only their assignments
            query["school_id"] = user.get("school_id")
            query["teacher_id"] = user.get("user_id")
        elif user["role"] == UserRole.STUDENT:
            # Students see assignments for their grade/section
            student = await db.students.find_one(
                {"user_id": user["user_id"]},
                {"_id": 0, "grade_id": 1, "section_id": 1}
            )
            if student:
                query["school_id"] = user.get("school_id")
                query["grade_id"] = student.get("grade_id")
                # Include assignments for all sections or specific section
                query["$or"] = [
                    {"section_id": None},
                    {"section_id": student.get("section_id")}
                ]
        else:
            query["school_id"] = user.get("school_id")
        
        if teacher_id:
            query["teacher_id"] = teacher_id
        if grade_id:
            query["grade_id"] = grade_id
        if subject_id:
            query["subject_id"] = subject_id
        
        assignments = await db.assignments.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        
        for assignment in assignments:
            submission_count = await db.assignment_submissions.count_documents({
                "assignment_id": assignment["assignment_id"]
            })
            assignment["submission_count"] = submission_count
        
        return assignments
    
    @assignments_router.post("/{assignment_id}/submit")
    async def submit_assignment(
        assignment_id: str,
        submission_data: dict,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] != UserRole.STUDENT:
            raise HTTPException(status_code=403, detail="فقط الطلاب يمكنهم تسليم الواجبات")
        
        # Get student info
        student = await db.students.find_one(
            {"user_id": user["user_id"]},
            {"_id": 0, "student_id": 1}
        )
        
        if not student:
            raise HTTPException(status_code=404, detail="لم يتم العثور على بيانات الطالب")
        
        submission_id = generate_id("sub")
        now = datetime.now(timezone.utc)
        
        submission_doc = {
            "submission_id": submission_id,
            "assignment_id": assignment_id,
            "student_id": student["student_id"],
            "school_id": user.get("school_id"),
            "content": submission_data.get("content"),
            "attachments": submission_data.get("attachments", []),
            "status": "submitted",
            "submitted_at": now.isoformat()
        }
        
        await db.assignment_submissions.insert_one(submission_doc)
        submission_doc["submitted_at"] = now
        return submission_doc
    
    @assignments_router.get("/{assignment_id}/submissions")
    async def get_assignment_submissions(
        assignment_id: str,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        submissions = await db.assignment_submissions.find(
            {"assignment_id": assignment_id},
            {"_id": 0}
        ).to_list(1000)
        
        # Enrich with student names
        for submission in submissions:
            student = await db.students.find_one(
                {"student_id": submission["student_id"]},
                {"_id": 0, "name": 1, "name_ar": 1}
            )
            if student:
                submission["student_name"] = student.get("name")
                submission["student_name_ar"] = student.get("name_ar")
        
        return submissions
    
    @assignments_router.put("/submissions/{submission_id}/grade")
    async def grade_submission(
        submission_id: str,
        grade_data: dict,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        now = datetime.now(timezone.utc)
        
        update_data = {
            "score": grade_data.get("score"),
            "feedback": grade_data.get("feedback"),
            "status": "graded",
            "graded_at": now.isoformat(),
            "graded_by": user["user_id"]
        }
        
        result = await db.assignment_submissions.update_one(
            {"submission_id": submission_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="التسليم غير موجود")
        
        return {"message": "تم تقييم الواجب بنجاح"}
    
    # ==================== MESSAGES ROUTES ====================
    
    @messages_router.post("/")
    async def send_message(
        message_data: dict,
        user: dict = Depends(get_current_user)
    ):
        message_id = generate_id("msg")
        now = datetime.now(timezone.utc)
        
        school_id = message_data.get("school_id") or user.get("school_id")
        
        message_doc = {
            "message_id": message_id,
            "school_id": school_id,
            "sender_id": user["user_id"],
            "subject": message_data.get("subject"),
            "subject_ar": message_data.get("subject_ar"),
            "content": message_data.get("content"),
            "content_ar": message_data.get("content_ar"),
            "message_type": message_data.get("message_type", "general"),
            "recipient_type": message_data.get("recipient_type", "user"),
            "recipient_ids": message_data.get("recipient_ids", []),
            "attachments": message_data.get("attachments", []),
            "is_read": False,
            "read_by": [],
            "created_at": now.isoformat()
        }
        
        await db.messages.insert_one(message_doc)
        message_doc.pop("_id", None)  # Remove MongoDB ObjectId
        message_doc["created_at"] = now
        message_doc["sender_name"] = user.get("name") or user.get("name_ar")
        return message_doc
    
    @messages_router.get("/")
    async def list_messages(
        inbox: bool = True,
        sent: bool = False,
        unread_only: bool = False,
        skip: int = 0,
        limit: int = 50,
        user: dict = Depends(get_current_user)
    ):
        query = {"school_id": user.get("school_id")}
        
        if sent:
            query["sender_id"] = user["user_id"]
        elif inbox:
            query["$or"] = [
                {"recipient_ids": user["user_id"]},
                {"recipient_type": "all"},
                {"recipient_ids": user.get("role")}
            ]
        
        if unread_only:
            query["read_by"] = {"$ne": user["user_id"]}
        
        messages = await db.messages.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        
        # Enrich with sender names
        for msg in messages:
            sender = await db.users.find_one(
                {"user_id": msg["sender_id"]},
                {"_id": 0, "name": 1, "name_ar": 1}
            )
            if sender:
                msg["sender_name"] = sender.get("name_ar") or sender.get("name")
            msg["is_read"] = user["user_id"] in msg.get("read_by", [])
        
        return messages
    
    @messages_router.put("/{message_id}/read")
    async def mark_message_read(
        message_id: str,
        user: dict = Depends(get_current_user)
    ):
        result = await db.messages.update_one(
            {"message_id": message_id},
            {"$addToSet": {"read_by": user["user_id"]}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="الرسالة غير موجودة")
        
        return {"message": "تم تحديث حالة الرسالة"}
    
    @messages_router.get("/unread-count")
    async def get_unread_count(user: dict = Depends(get_current_user)):
        query = {
            "school_id": user.get("school_id"),
            "$or": [
                {"recipient_ids": user["user_id"]},
                {"recipient_type": "all"},
                {"recipient_ids": user.get("role")}
            ],
            "read_by": {"$ne": user["user_id"]}
        }
        
        count = await db.messages.count_documents(query)
        return {"unread_count": count}
    
    # ==================== REPORTS ROUTES ====================
    
    @reports_router.post("/attendance")
    async def generate_attendance_report(
        report_data: dict,
        user: dict = Depends(get_current_user)
    ):
        school_id = report_data.get("school_id") or user.get("school_id")
        start_date = report_data.get("start_date")
        end_date = report_data.get("end_date")
        grade_id = report_data.get("grade_id")
        section_id = report_data.get("section_id")
        
        query = {"school_id": school_id}
        
        if start_date and end_date:
            query["date"] = {"$gte": start_date, "$lte": end_date}
        
        # Get all attendance records
        attendance_records = await db.attendance.find(query, {"_id": 0}).to_list(10000)
        
        # Calculate statistics
        total_records = len(attendance_records)
        present_count = len([r for r in attendance_records if r.get("status") == "present"])
        absent_count = len([r for r in attendance_records if r.get("status") == "absent"])
        late_count = len([r for r in attendance_records if r.get("status") == "late"])
        excused_count = len([r for r in attendance_records if r.get("status") == "excused"])
        
        attendance_rate = (present_count / total_records * 100) if total_records > 0 else 0
        
        report = {
            "report_id": generate_id("rpt"),
            "report_type": "attendance",
            "title": "Attendance Report",
            "title_ar": "تقرير الحضور",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "period": {"start": start_date, "end": end_date},
            "data": attendance_records[:100],  # Limit for response size
            "summary": {
                "total_records": total_records,
                "present": present_count,
                "absent": absent_count,
                "late": late_count,
                "excused": excused_count,
                "attendance_rate": round(attendance_rate, 2)
            }
        }
        
        return report
    
    @reports_router.post("/grades")
    async def generate_grades_report(
        report_data: dict,
        user: dict = Depends(get_current_user)
    ):
        school_id = report_data.get("school_id") or user.get("school_id")
        grade_id = report_data.get("grade_id")
        subject_id = report_data.get("subject_id")
        student_id = report_data.get("student_id")
        
        query = {"school_id": school_id}
        
        if grade_id:
            query["grade_id"] = grade_id
        if subject_id:
            query["subject_id"] = subject_id
        
        # Get exam scores
        exams = await db.exams.find(query, {"_id": 0}).to_list(100)
        
        # Get student scores (exam_scores collection)
        scores_query = {"school_id": school_id}
        if student_id:
            scores_query["student_id"] = student_id
        
        scores = await db.exam_scores.find(scores_query, {"_id": 0}).to_list(10000)
        
        # Calculate statistics
        total_scores = len(scores)
        avg_score = sum([s.get("score", 0) for s in scores]) / total_scores if total_scores > 0 else 0
        
        # Get pass/fail counts
        pass_count = len([s for s in scores if s.get("score", 0) >= 50])
        fail_count = len([s for s in scores if s.get("score", 0) < 50])
        
        report = {
            "report_id": generate_id("rpt"),
            "report_type": "grades",
            "title": "Grades Report",
            "title_ar": "تقرير الدرجات",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "data": scores[:100],
            "summary": {
                "total_scores": total_scores,
                "average_score": round(avg_score, 2),
                "pass_count": pass_count,
                "fail_count": fail_count,
                "pass_rate": round((pass_count / total_scores * 100) if total_scores > 0 else 0, 2)
            }
        }
        
        return report
    
    @reports_router.post("/finance")
    async def generate_finance_report(
        report_data: dict,
        user: dict = Depends(get_current_user)
    ):
        school_id = report_data.get("school_id") or user.get("school_id")
        start_date = report_data.get("start_date")
        end_date = report_data.get("end_date")
        
        # Get invoices
        invoice_query = {"school_id": school_id}
        invoices = await db.invoices.find(invoice_query, {"_id": 0}).to_list(10000)
        
        # Get payments
        payment_query = {"school_id": school_id}
        payments = await db.payments.find(payment_query, {"_id": 0}).to_list(10000)
        
        # Calculate statistics
        total_invoiced = sum([i.get("amount", 0) for i in invoices])
        total_collected = sum([p.get("amount", 0) for p in payments])
        total_pending = total_invoiced - total_collected
        
        pending_invoices = len([i for i in invoices if i.get("status") == "pending"])
        paid_invoices = len([i for i in invoices if i.get("status") == "paid"])
        overdue_invoices = len([i for i in invoices if i.get("status") == "overdue"])
        
        report = {
            "report_id": generate_id("rpt"),
            "report_type": "finance",
            "title": "Finance Report",
            "title_ar": "التقرير المالي",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "period": {"start": start_date, "end": end_date},
            "data": {
                "invoices": invoices[:50],
                "payments": payments[:50]
            },
            "summary": {
                "total_invoiced": total_invoiced,
                "total_collected": total_collected,
                "total_pending": total_pending,
                "collection_rate": round((total_collected / total_invoiced * 100) if total_invoiced > 0 else 0, 2),
                "invoice_counts": {
                    "pending": pending_invoices,
                    "paid": paid_invoices,
                    "overdue": overdue_invoices,
                    "total": len(invoices)
                },
                "payment_count": len(payments)
            }
        }
        
        return report
    
    @reports_router.post("/students")
    async def generate_students_report(
        report_data: dict,
        user: dict = Depends(get_current_user)
    ):
        school_id = report_data.get("school_id") or user.get("school_id")
        grade_id = report_data.get("grade_id")
        section_id = report_data.get("section_id")
        
        query = {"school_id": school_id}
        if grade_id:
            query["grade_id"] = grade_id
        if section_id:
            query["section_id"] = section_id
        
        students = await db.students.find(query, {"_id": 0}).to_list(10000)
        
        # Statistics
        total_students = len(students)
        male_count = len([s for s in students if s.get("gender") == "male"])
        female_count = len([s for s in students if s.get("gender") == "female"])
        active_count = len([s for s in students if s.get("status") == "active"])
        
        # Group by grade
        by_grade = {}
        for student in students:
            gid = student.get("grade_id", "unknown")
            by_grade[gid] = by_grade.get(gid, 0) + 1
        
        report = {
            "report_id": generate_id("rpt"),
            "report_type": "students",
            "title": "Students Report",
            "title_ar": "تقرير الطلاب",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "data": students[:100],
            "summary": {
                "total_students": total_students,
                "male_count": male_count,
                "female_count": female_count,
                "active_count": active_count,
                "by_grade": by_grade
            }
        }
        
        return report
    
    @reports_router.get("/student/{student_id}/report-card")
    async def get_student_report_card(
        student_id: str,
        semester: Optional[str] = None,
        user: dict = Depends(get_current_user)
    ):
        # Get student info
        student = await db.students.find_one({"student_id": student_id}, {"_id": 0})
        if not student:
            raise HTTPException(status_code=404, detail="الطالب غير موجود")
        
        # Get student's exam scores
        scores = await db.exam_scores.find(
            {"student_id": student_id},
            {"_id": 0}
        ).to_list(100)
        
        # Get attendance summary
        attendance = await db.attendance.find(
            {"student_id": student_id},
            {"_id": 0}
        ).to_list(1000)
        
        present_days = len([a for a in attendance if a.get("status") == "present"])
        absent_days = len([a for a in attendance if a.get("status") == "absent"])
        
        # Calculate GPA
        if scores:
            total_score = sum([s.get("score", 0) for s in scores])
            avg_score = total_score / len(scores)
        else:
            avg_score = 0
        
        # Get grade info
        grade = None
        if student.get("grade_id"):
            grade = await db.grades.find_one(
                {"grade_id": student["grade_id"]},
                {"_id": 0, "name": 1, "name_ar": 1}
            )
        
        report_card = {
            "report_id": generate_id("rc"),
            "student": {
                "id": student_id,
                "name": student.get("name"),
                "name_ar": student.get("name_ar"),
                "grade": grade.get("name_ar") if grade else None
            },
            "scores": scores,
            "attendance": {
                "present_days": present_days,
                "absent_days": absent_days,
                "total_days": present_days + absent_days,
                "attendance_rate": round((present_days / (present_days + absent_days) * 100) if (present_days + absent_days) > 0 else 0, 2)
            },
            "gpa": round(avg_score, 2),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        return report_card
    
    # ==================== ACTIVITY LOG ROUTES ====================
    
    @activity_router.get("/")
    async def list_activity_logs(
        school_id: Optional[str] = None,
        user_id: Optional[str] = None,
        entity_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.SUPPORT_AGENT]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        query = {}
        
        if user["role"] in [UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT]:
            if school_id:
                query["school_id"] = school_id
        else:
            query["school_id"] = user.get("school_id")
        
        if user_id:
            query["user_id"] = user_id
        if entity_type:
            query["entity_type"] = entity_type
        
        logs = await db.activity_logs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        
        # Enrich with user names
        for log in logs:
            log_user = await db.users.find_one(
                {"user_id": log["user_id"]},
                {"_id": 0, "name": 1, "name_ar": 1}
            )
            if log_user:
                log["user_name"] = log_user.get("name_ar") or log_user.get("name")
        
        return logs
    
    # ==================== SETTINGS ROUTES ====================
    
    @settings_router.get("/")
    async def get_school_settings(user: dict = Depends(get_current_user)):
        school_id = user.get("school_id")
        if not school_id:
            raise HTTPException(status_code=400, detail="لا توجد مدرسة مرتبطة")
        
        school = await db.schools.find_one({"school_id": school_id}, {"_id": 0})
        if not school:
            raise HTTPException(status_code=404, detail="المدرسة غير موجودة")
        
        return school
    
    @settings_router.put("/")
    async def update_school_settings(
        settings_data: dict,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        school_id = settings_data.get("school_id") or user.get("school_id")
        
        update_data = {k: v for k, v in settings_data.items() if v is not None and k != "school_id"}
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.schools.update_one(
            {"school_id": school_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="المدرسة غير موجودة")
        
        # Log activity
        await log_activity(db, user["user_id"], school_id, "updated", "settings", school_id)
        
        return {"message": "تم تحديث الإعدادات بنجاح"}
    
    # ==================== PARENT PORTAL ROUTES ====================
    
    @parent_router.get("/children")
    async def get_parent_children(user: dict = Depends(get_current_user)):
        if user["role"] != UserRole.PARENT:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        # Get linked students
        links = await db.parent_student_links.find(
            {"parent_id": user["user_id"]},
            {"_id": 0}
        ).to_list(10)
        
        children = []
        for link in links:
            student = await db.students.find_one(
                {"student_id": link["student_id"]},
                {"_id": 0}
            )
            if student:
                # Get grade info
                grade = None
                if student.get("grade_id"):
                    grade = await db.grades.find_one(
                        {"grade_id": student["grade_id"]},
                        {"_id": 0, "name": 1, "name_ar": 1}
                    )
                
                student["grade"] = grade
                student["relationship"] = link.get("relationship", "parent")
                children.append(student)
        
        return children
    
    @parent_router.get("/child/{student_id}/attendance")
    async def get_child_attendance(
        student_id: str,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] != UserRole.PARENT:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        # Verify parent has access to this student
        link = await db.parent_student_links.find_one({
            "parent_id": user["user_id"],
            "student_id": student_id
        })
        
        if not link:
            raise HTTPException(status_code=403, detail="لا يمكنك الوصول لهذا الطالب")
        
        attendance = await db.attendance.find(
            {"student_id": student_id},
            {"_id": 0}
        ).sort("date", -1).to_list(100)
        
        return attendance
    
    @parent_router.get("/child/{student_id}/grades")
    async def get_child_grades(
        student_id: str,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] != UserRole.PARENT:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        # Verify parent has access to this student
        link = await db.parent_student_links.find_one({
            "parent_id": user["user_id"],
            "student_id": student_id
        })
        
        if not link:
            raise HTTPException(status_code=403, detail="لا يمكنك الوصول لهذا الطالب")
        
        scores = await db.exam_scores.find(
            {"student_id": student_id},
            {"_id": 0}
        ).to_list(100)
        
        return scores
    
    @parent_router.get("/child/{student_id}/invoices")
    async def get_child_invoices(
        student_id: str,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] != UserRole.PARENT:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        # Verify parent has access to this student
        link = await db.parent_student_links.find_one({
            "parent_id": user["user_id"],
            "student_id": student_id
        })
        
        if not link:
            raise HTTPException(status_code=403, detail="لا يمكنك الوصول لهذا الطالب")
        
        invoices = await db.invoices.find(
            {"student_id": student_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return invoices
    
    @parent_router.post("/link-student")
    async def link_parent_to_student(
        link_data: dict,
        user: dict = Depends(get_current_user)
    ):
        if user["role"] not in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]:
            raise HTTPException(status_code=403, detail="غير مصرح")
        
        link_id = generate_id("link")
        now = datetime.now(timezone.utc)
        
        link_doc = {
            "link_id": link_id,
            "school_id": link_data.get("school_id") or user.get("school_id"),
            "parent_id": link_data.get("parent_id"),
            "student_id": link_data.get("student_id"),
            "relationship": link_data.get("relationship", "parent"),
            "created_at": now.isoformat()
        }
        
        await db.parent_student_links.insert_one(link_doc)
        link_doc["created_at"] = now
        return link_doc
    
    # ==================== ONBOARDING ====================
    @onboarding_router.post("/complete")
    async def complete_onboarding(data: dict, user: dict = Depends(get_current_user)):
        school_id = user.get("school_id")
        if not school_id:
            raise HTTPException(status_code=400, detail="No school associated")
        
        await db.schools.update_one(
            {"school_id": school_id},
            {"$set": {
                "name": data.get("school_name"),
                "name_ar": data.get("school_name_ar"),
                "email": data.get("email"),
                "phone": data.get("phone"),
                "address_ar": data.get("address_ar"),
                "academic_system": data.get("academic_system"),
                "grading_system": data.get("grading_system"),
                "currency": data.get("currency"),
                "onboarding_completed": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        for grade_data in data.get("grades", []):
            grade_doc = {
                "grade_id": generate_id("grade"),
                "school_id": school_id,
                "name": grade_data.get("name"),
                "name_ar": grade_data.get("name_ar"),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.grades.insert_one(grade_doc)
        
        return {"success": True, "message": "Onboarding completed"}

    # ==================== NOTIFICATIONS ====================
    @notifications_router.get("/")
    async def list_notifications(skip: int = 0, limit: int = 50, user: dict = Depends(get_current_user)):
        query = {"user_id": user["user_id"]}
        cursor = db.notifications.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    @notifications_router.put("/{notification_id}/read")
    async def mark_notification_read(notification_id: str, user: dict = Depends(get_current_user)):
        await db.notifications.update_one(
            {"notification_id": notification_id, "user_id": user["user_id"]},
            {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"success": True}

    @notifications_router.put("/read-all")
    async def mark_all_notifications_read(user: dict = Depends(get_current_user)):
        await db.notifications.update_many(
            {"user_id": user["user_id"], "is_read": False},
            {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"success": True}

    @notifications_router.get("/unread-count")
    async def get_unread_count(user: dict = Depends(get_current_user)):
        count = await db.notifications.count_documents({"user_id": user["user_id"], "is_read": False})
        return {"count": count}

    # ==================== EXPORT REPORTS ====================
    @export_router.post("/{report_type}/preview")
    async def preview_report(report_type: str, data: dict, user: dict = Depends(get_current_user)):
        school_id = user.get("school_id") or data.get("school_id")
        
        if report_type == "students":
            students = await db.students.find({"school_id": school_id}, {"_id": 0}).to_list(1000)
            return {
                "summary": {"total": len(students), "active": len([s for s in students if s.get("status") == "active"])},
                "columns": ["الاسم", "الصف", "الحالة", "تاريخ التسجيل"],
                "rows": [[s.get("name_ar", s.get("name", "")), s.get("grade_name", ""), s.get("status", "active"), s.get("created_at", "")[:10] if s.get("created_at") else ""] for s in students[:50]]
            }
        elif report_type == "attendance":
            records = await db.attendance.find({"school_id": school_id}, {"_id": 0}).to_list(1000)
            present = len([r for r in records if r.get("status") == "present"])
            return {
                "summary": {"total": len(records), "present": present, "absent": len(records) - present, "rate": f"{(present/max(len(records),1))*100:.1f}%"},
                "columns": ["التاريخ", "الطالب", "الحالة"],
                "rows": [[r.get("date", ""), r.get("student_name", ""), r.get("status", "")] for r in records[:50]]
            }
        elif report_type == "finance":
            invoices = await db.invoices.find({"school_id": school_id}, {"_id": 0}).to_list(1000)
            total = sum(i.get("amount", 0) for i in invoices)
            paid = sum(i.get("amount", 0) for i in invoices if i.get("status") == "paid")
            return {
                "summary": {"total_invoices": len(invoices), "total_amount": total, "paid": paid, "pending": total - paid},
                "columns": ["رقم الفاتورة", "الطالب", "المبلغ", "الحالة"],
                "rows": [[i.get("invoice_number", ""), i.get("student_name", ""), str(i.get("amount", 0)), i.get("status", "")] for i in invoices[:50]]
            }
        else:
            return {"summary": {}, "columns": [], "rows": []}

    @export_router.post("/{report_type}/export")
    async def export_report(report_type: str, data: dict, user: dict = Depends(get_current_user)):
        from fastapi.responses import StreamingResponse
        from io import BytesIO
        
        export_format = data.get("format", "pdf")
        preview = await preview_report(report_type, data, user)
        
        if export_format == "xlsx":
            try:
                import openpyxl
                from openpyxl.styles import Font, Alignment
                
                wb = openpyxl.Workbook()
                ws = wb.active
                ws.title = report_type
                
                for col, header in enumerate(preview["columns"], 1):
                    cell = ws.cell(row=1, column=col, value=header)
                    cell.font = Font(bold=True)
                    cell.alignment = Alignment(horizontal="center")
                
                for row_idx, row in enumerate(preview["rows"], 2):
                    for col_idx, value in enumerate(row, 1):
                        ws.cell(row=row_idx, column=col_idx, value=value)
                
                buffer = BytesIO()
                wb.save(buffer)
                buffer.seek(0)
                
                return StreamingResponse(
                    buffer,
                    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    headers={"Content-Disposition": f"attachment; filename={report_type}_report.xlsx"}
                )
            except ImportError:
                raise HTTPException(status_code=500, detail="Excel export not available")
        
        # PDF Export
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []
        
        elements.append(Paragraph(f"{report_type.title()} Report", styles['Title']))
        elements.append(Spacer(1, 20))
        
        table_data = [preview["columns"]] + preview["rows"]
        pdf_table = Table(table_data)
        pdf_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(pdf_table)
        
        doc.build(elements)
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={report_type}_report.pdf"}
        )
    
    return {
        "sections_router": sections_router,
        "schedule_router": schedule_router,
        "assignments_router": assignments_router,
        "messages_router": messages_router,
        "reports_router": reports_router,
        "activity_router": activity_router,
        "settings_router": settings_router,
        "parent_router": parent_router,
        "levels_router": levels_router,
        "onboarding_router": onboarding_router,
        "notifications_router": notifications_router,
        "export_router": export_router
    }


async def log_activity(db, user_id: str, school_id: str, action: str, entity_type: str, entity_id: str = None, details: dict = None):
    """Helper function to log activities"""
    log_doc = {
        "log_id": generate_id("log"),
        "user_id": user_id,
        "school_id": school_id,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "details": details,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.activity_logs.insert_one(log_doc)
