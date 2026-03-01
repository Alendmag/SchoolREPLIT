"""
Backend API Tests for School Management System
Tests: Authentication, Dashboard, Academic (Subjects, Exams), Schedule, Reports, Settings, Activity Log, Messages
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://libyan-edu-mgr.preview.emergentagent.com')

# Test credentials
SUPER_ADMIN_EMAIL = "admin@schoolsms.ly"
SUPER_ADMIN_PASSWORD = "Admin@123"
SCHOOL_ADMIN_EMAIL = "school_admin@test.ly"
SCHOOL_ADMIN_PASSWORD = "Admin@123"


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"✓ Health check passed: {data}")
    
    def test_root_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "School Management System API"
        assert data["version"] == "1.0.0"
        print(f"✓ Root endpoint passed: {data}")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_super_admin_login(self):
        """Test Super Admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "super_admin"
        assert data["user"]["email"] == SUPER_ADMIN_EMAIL
        print(f"✓ Super Admin login passed: {data['user']['name']}")
    
    def test_school_admin_login(self):
        """Test School Admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SCHOOL_ADMIN_EMAIL,
            "password": SCHOOL_ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "school_admin"
        assert data["user"]["school_id"] is not None
        print(f"✓ School Admin login passed: {data['user']['name']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")
    
    def test_get_current_user(self):
        """Test /auth/me endpoint"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get current user
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == SUPER_ADMIN_EMAIL
        print(f"✓ Get current user passed: {data['email']}")


class TestDashboard:
    """Dashboard endpoint tests"""
    
    @pytest.fixture
    def super_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def school_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SCHOOL_ADMIN_EMAIL,
            "password": SCHOOL_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_super_admin_dashboard(self, super_admin_token):
        """Test Super Admin dashboard stats"""
        response = requests.get(f"{BASE_URL}/api/dashboard/super-admin", headers={
            "Authorization": f"Bearer {super_admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "total_schools" in data
        assert "total_students" in data
        assert "total_teachers" in data
        print(f"✓ Super Admin dashboard: {data}")
    
    def test_school_dashboard(self, school_admin_token):
        """Test School Admin dashboard stats"""
        response = requests.get(f"{BASE_URL}/api/dashboard/school", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "total_teachers" in data
        assert "finance" in data
        print(f"✓ School dashboard: students={data['total_students']}, teachers={data['total_teachers']}")


class TestAcademicSubjects:
    """Academic Subjects endpoint tests"""
    
    @pytest.fixture
    def school_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SCHOOL_ADMIN_EMAIL,
            "password": SCHOOL_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_list_subjects(self, school_admin_token):
        """Test listing subjects"""
        response = requests.get(f"{BASE_URL}/api/academic/subjects/", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ List subjects: {len(data)} subjects found")
    
    def test_create_subject(self, school_admin_token):
        """Test creating a new subject"""
        # Get school_id from user
        user_response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        school_id = user_response.json()["school_id"]
        
        response = requests.post(f"{BASE_URL}/api/academic/subjects/", 
            headers={"Authorization": f"Bearer {school_admin_token}"},
            json={
                "name": "TEST_Mathematics",
                "name_ar": "الرياضيات",
                "code": "TEST_MATH101",
                "credits": 3,
                "description": "Test subject",
                "school_id": school_id,
                "grade_ids": []
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Mathematics"
        assert data["code"] == "TEST_MATH101"
        print(f"✓ Create subject passed: {data['name']}")


class TestAcademicExams:
    """Academic Exams endpoint tests"""
    
    @pytest.fixture
    def school_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SCHOOL_ADMIN_EMAIL,
            "password": SCHOOL_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_list_exams(self, school_admin_token):
        """Test listing exams"""
        response = requests.get(f"{BASE_URL}/api/academic/exams/", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ List exams: {len(data)} exams found")
    
    def test_create_exam(self, school_admin_token):
        """Test creating a new exam"""
        user_response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        school_id = user_response.json()["school_id"]
        
        response = requests.post(f"{BASE_URL}/api/academic/exams/", 
            headers={"Authorization": f"Bearer {school_admin_token}"},
            json={
                "name": "TEST_Midterm Exam",
                "name_ar": "اختبار منتصف الفصل",
                "exam_type": "midterm",
                "subject_id": "",
                "grade_id": "",
                "max_score": 100,
                "date": "2026-03-15",
                "duration_minutes": 60,
                "school_id": school_id
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Midterm Exam"
        print(f"✓ Create exam passed: {data['name']}")


class TestSchedule:
    """Schedule endpoint tests"""
    
    @pytest.fixture
    def school_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SCHOOL_ADMIN_EMAIL,
            "password": SCHOOL_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_list_sections(self, school_admin_token):
        """Test listing sections"""
        response = requests.get(f"{BASE_URL}/api/sections/", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ List sections: {len(data)} sections found")


class TestReports:
    """Reports endpoint tests"""
    
    @pytest.fixture
    def school_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SCHOOL_ADMIN_EMAIL,
            "password": SCHOOL_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_attendance_report(self, school_admin_token):
        """Test generating attendance report"""
        user_response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        school_id = user_response.json()["school_id"]
        
        response = requests.post(f"{BASE_URL}/api/reports/attendance", 
            headers={"Authorization": f"Bearer {school_admin_token}"},
            json={
                "school_id": school_id,
                "start_date": "2026-01-01",
                "end_date": "2026-03-01"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "report_type" in data
        assert data["report_type"] == "attendance"
        assert "summary" in data
        print(f"✓ Attendance report generated: {data['summary']}")
    
    def test_finance_report(self, school_admin_token):
        """Test generating finance report"""
        user_response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        school_id = user_response.json()["school_id"]
        
        response = requests.post(f"{BASE_URL}/api/reports/finance", 
            headers={"Authorization": f"Bearer {school_admin_token}"},
            json={
                "school_id": school_id,
                "start_date": "2026-01-01",
                "end_date": "2026-03-01"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["report_type"] == "finance"
        print(f"✓ Finance report generated: {data['summary']}")


class TestSettings:
    """Settings endpoint tests"""
    
    @pytest.fixture
    def school_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SCHOOL_ADMIN_EMAIL,
            "password": SCHOOL_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_settings(self, school_admin_token):
        """Test getting school settings"""
        response = requests.get(f"{BASE_URL}/api/settings/", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "school_id" in data
        print(f"✓ Get settings passed: {data.get('name', 'N/A')}")


class TestActivityLog:
    """Activity Log endpoint tests"""
    
    @pytest.fixture
    def school_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SCHOOL_ADMIN_EMAIL,
            "password": SCHOOL_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_list_activity_logs(self, school_admin_token):
        """Test listing activity logs"""
        response = requests.get(f"{BASE_URL}/api/activity/", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ List activity logs: {len(data)} logs found")


class TestMessages:
    """Messages endpoint tests"""
    
    @pytest.fixture
    def school_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SCHOOL_ADMIN_EMAIL,
            "password": SCHOOL_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_list_messages(self, school_admin_token):
        """Test listing messages"""
        response = requests.get(f"{BASE_URL}/api/messages/?inbox=true", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ List messages: {len(data)} messages found")
    
    def test_unread_count(self, school_admin_token):
        """Test getting unread message count"""
        response = requests.get(f"{BASE_URL}/api/messages/unread-count", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "unread_count" in data
        print(f"✓ Unread count: {data['unread_count']}")
    
    def test_send_message(self, school_admin_token):
        """Test sending a message"""
        user_response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        school_id = user_response.json()["school_id"]
        
        response = requests.post(f"{BASE_URL}/api/messages/", 
            headers={"Authorization": f"Bearer {school_admin_token}"},
            json={
                "subject": "TEST_Message",
                "subject_ar": "رسالة اختبار",
                "content": "This is a test message",
                "content_ar": "هذه رسالة اختبار",
                "recipient_type": "all",
                "recipient_ids": [],
                "message_type": "general",
                "school_id": school_id
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["subject"] == "TEST_Message"
        print(f"✓ Send message passed: {data['message_id']}")


class TestGrades:
    """Grades endpoint tests"""
    
    @pytest.fixture
    def school_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SCHOOL_ADMIN_EMAIL,
            "password": SCHOOL_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_list_grades(self, school_admin_token):
        """Test listing grades"""
        response = requests.get(f"{BASE_URL}/api/academic/grades/", headers={
            "Authorization": f"Bearer {school_admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ List grades: {len(data)} grades found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
