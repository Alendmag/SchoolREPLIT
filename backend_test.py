import requests
import sys
from datetime import datetime

class SchoolManagementAPITester:
    def __init__(self, base_url="https://libyan-edu-mgr.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {str(response_data)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "/health",
            200
        )

    def test_super_admin_login(self):
        """Test super admin login"""
        success, response = self.run_test(
            "Super Admin Login",
            "POST",
            "/auth/login",
            200,
            data={"email": "admin@schoolsms.ly", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True, response
        return False, {}

    def test_auth_me(self):
        """Test /auth/me endpoint"""
        if not self.token:
            print("❌ No token available for /auth/me test")
            return False, {}
        
        return self.run_test(
            "Get Current User (/auth/me)",
            "GET",
            "/auth/me",
            200
        )

    def test_super_admin_dashboard(self):
        """Test super admin dashboard endpoint"""
        if not self.token:
            print("❌ No token available for dashboard test")
            return False, {}
        
        return self.run_test(
            "Super Admin Dashboard",
            "GET",
            "/dashboard/super-admin",
            200
        )

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        return self.run_test(
            "Invalid Login Test",
            "POST",
            "/auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpassword"}
        )

def main():
    print("🚀 Starting School Management System API Tests")
    print("=" * 60)
    
    # Setup
    tester = SchoolManagementAPITester()
    
    # Run tests in sequence
    print("\n📋 Running API Tests...")
    
    # 1. Health check
    tester.test_health_check()
    
    # 2. Invalid login test
    tester.test_invalid_login()
    
    # 3. Super admin login
    login_success, login_response = tester.test_super_admin_login()
    
    if login_success:
        # 4. Test /auth/me
        tester.test_auth_me()
        
        # 5. Test super admin dashboard
        tester.test_super_admin_dashboard()
    else:
        print("❌ Cannot proceed with authenticated tests - login failed")

    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"   {i}. {test['name']}")
            if 'error' in test:
                print(f"      Error: {test['error']}")
            else:
                print(f"      Expected: {test['expected']}, Got: {test['actual']}")
                print(f"      Response: {test['response']}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())