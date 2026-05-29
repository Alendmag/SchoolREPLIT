"""
Regression tests for Phase 1 creation chain mirroring actual React UI payloads:
Level -> Grade -> Section -> Subject -> Room -> Teacher -> Student.

Payload shapes match exactly what GradesPage.js / TeachersPage.js / StudentsPage.js
POST after the fixes in iteration 5.
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://sms-libya-final.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = os.environ.get("SMS_TEST_SCHOOL_ADMIN_EMAIL", "school_admin@test.ly")
ADMIN_PASSWORD = os.environ.get("SMS_TEST_SCHOOL_ADMIN_PASSWORD", "Admin@123")

UNIQUE = f"UI{int(time.time())}"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token, f"no token: {data}"
    s.headers.update({"Authorization": f"Bearer {token}"})
    s.school_id = data.get("user", {}).get("school_id")
    assert s.school_id, f"missing school_id: {data}"
    return s


@pytest.fixture(scope="module")
def created(session):
    """Carry IDs across tests."""
    return {}


# ---------- LEVEL ----------
def test_create_level(session, created):
    payload = {
        "name": f"TEST_{UNIQUE}_Level",
        "name_ar": f"اختبار {UNIQUE} مرحلة",
        "description": "",
        "school_id": session.school_id,
    }
    r = session.post(f"{BASE_URL}/api/levels/", json=payload)
    assert r.status_code in (200, 201), f"{r.status_code} {r.text}"
    data = r.json()
    assert "level_id" in data
    assert data["name"] == payload["name"]
    created["level_id"] = data["level_id"]
    created["level_order"] = data.get("order", 1)


# ---------- GRADE (UI sends level + level_id) ----------
def test_create_grade(session, created):
    payload = {
        "name": f"TEST_{UNIQUE}_Grade",
        "name_ar": f"اختبار {UNIQUE} صف",
        "description": "",
        "school_id": session.school_id,
        "level_id": created["level_id"],
        "level": created.get("level_order", 1),
    }
    r = session.post(f"{BASE_URL}/api/academic/grades/", json=payload, allow_redirects=True)
    assert r.status_code in (200, 201), f"{r.status_code} {r.text}"
    data = r.json()
    assert "grade_id" in data
    assert data.get("level_id") == created["level_id"] or data.get("level") == payload["level"]
    created["grade_id"] = data["grade_id"]


# ---------- SECTION ----------
def test_create_section(session, created):
    payload = {
        "name": f"TEST_{UNIQUE}_Sec",
        "name_ar": f"اختبار {UNIQUE} شعبة",
        "description": "",
        "school_id": session.school_id,
        "grade_id": created["grade_id"],
    }
    r = session.post(f"{BASE_URL}/api/sections/", json=payload)
    assert r.status_code in (200, 201), f"{r.status_code} {r.text}"
    data = r.json()
    assert "section_id" in data
    assert data["grade_id"] == created["grade_id"]
    created["section_id"] = data["section_id"]


# ---------- SUBJECT ----------
def test_create_subject(session, created):
    payload = {
        "name": f"TEST_{UNIQUE}_Subj",
        "name_ar": f"اختبار {UNIQUE} مادة",
        "code": f"T{UNIQUE[-4:]}",
        "credits": 2,
        "icon": "📐",
        "school_id": session.school_id,
    }
    r = session.post(f"{BASE_URL}/api/academic/subjects/", json=payload, allow_redirects=True)
    assert r.status_code in (200, 201), f"{r.status_code} {r.text}"
    data = r.json()
    assert "subject_id" in data
    created["subject_id"] = data["subject_id"]


# ---------- ROOM ----------
def test_create_room(session, created):
    payload = {
        "name": f"TEST_{UNIQUE}_Room",
        "name_ar": f"اختبار {UNIQUE} قاعة",
        "capacity": 30,
        "type": "classroom",
        "school_id": session.school_id,
    }
    r = session.post(f"{BASE_URL}/api/rooms/", json=payload)
    assert r.status_code in (200, 201), f"{r.status_code} {r.text}"
    data = r.json()
    assert data.get("room_id") or data.get("id")
    created["room_id"] = data.get("room_id") or data.get("id")


# ---------- TEACHER (relationship IDs from prior steps) ----------
def test_create_teacher_with_relations(session, created):
    payload = {
        "name": f"TEST_{UNIQUE}_Teacher",
        "name_ar": f"اختبار {UNIQUE} معلم",
        "email": f"test_{UNIQUE.lower()}_t@test.ly",
        "phone": None,
        "specialization": None,
        "qualification": None,
        "hire_date": None,
        "status": "active",
        "subject_ids": [created["subject_id"]],
        "grade_ids": [created["grade_id"]],
        "section_ids": [created["section_id"]],
        "school_id": session.school_id,
        "password": "Test@1234",
    }
    r = session.post(f"{BASE_URL}/api/teachers/", json=payload)
    assert r.status_code in (200, 201), f"{r.status_code} {r.text}"
    data = r.json()
    assert "teacher_id" in data
    assert created["subject_id"] in (data.get("subject_ids") or [])
    assert created["grade_id"] in (data.get("grade_ids") or [])
    assert created["section_id"] in (data.get("section_ids") or [])
    created["teacher_id"] = data["teacher_id"]


# ---------- STUDENT (optional empty email/password should be normalized client-side) ----------
def test_create_student_with_grade_section(session, created):
    payload = {
        "name": f"TEST_{UNIQUE}_Student",
        "name_ar": f"اختبار {UNIQUE} طالب",
        "email": None,
        "phone": None,
        "date_of_birth": None,
        "gender": "male",
        "national_id": None,
        "grade_id": created["grade_id"],
        "section_id": created["section_id"],
        "status": "active",
        "school_id": session.school_id,
        "password": None,
    }
    r = session.post(f"{BASE_URL}/api/students/", json=payload)
    assert r.status_code in (200, 201), f"{r.status_code} {r.text}"
    data = r.json()
    assert "student_id" in data
    assert data["grade_id"] == created["grade_id"]
    assert data["section_id"] == created["section_id"]
    created["student_id"] = data["student_id"]


# ---------- Verify lists include new records ----------
def test_lists_contain_new_records(session, created):
    g = session.get(f"{BASE_URL}/api/teachers/")
    assert g.status_code == 200
    assert any(t.get("teacher_id") == created["teacher_id"] for t in g.json())

    s = session.get(f"{BASE_URL}/api/students/")
    assert s.status_code == 200
    assert any(st.get("student_id") == created["student_id"] for st in s.json())


# ---------- Cleanup ----------
def test_cleanup(session, created):
    if "student_id" in created:
        session.delete(f"{BASE_URL}/api/students/{created['student_id']}")
    if "teacher_id" in created:
        session.delete(f"{BASE_URL}/api/teachers/{created['teacher_id']}")
    if "room_id" in created:
        session.delete(f"{BASE_URL}/api/rooms/{created['room_id']}")
    if "subject_id" in created:
        session.delete(f"{BASE_URL}/api/academic/subjects/{created['subject_id']}")
    if "section_id" in created:
        session.delete(f"{BASE_URL}/api/sections/{created['section_id']}")
    if "grade_id" in created:
        session.delete(f"{BASE_URL}/api/academic/grades/{created['grade_id']}")
    if "level_id" in created:
        session.delete(f"{BASE_URL}/api/levels/{created['level_id']}")
