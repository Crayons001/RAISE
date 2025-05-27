import requests
import json
from datetime import datetime

BASE_URL = 'http://localhost:5000'

def print_response(response):
    """Print response details in a readable format."""
    print(f"\nStatus Code: {response.status_code}")
    try:
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
    except:
        print("Response Text:", response.text)
    print("-" * 80)

def test_login(email, password):
    """Test login with given credentials."""
    print(f"\nTesting login for {email}...")
    response = requests.post(
        f'{BASE_URL}/api/auth/login',
        json={'email': email, 'password': password}
    )
    print_response(response)
    return response.json() if response.status_code == 200 else None

def test_refresh_token(refresh_token):
    """Test token refresh."""
    print("\nTesting token refresh...")
    response = requests.post(
        f'{BASE_URL}/api/auth/refresh',
        headers={'Authorization': f'Bearer {refresh_token}'}
    )
    print_response(response)
    return response.json() if response.status_code == 200 else None

def test_get_current_user(access_token):
    """Test getting current user info."""
    print("\nTesting get current user...")
    response = requests.get(
        f'{BASE_URL}/api/auth/me',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    print_response(response)
    return response.json() if response.status_code == 200 else None

def test_register_user(access_token, user_data):
    """Test user registration."""
    print("\nTesting user registration...")
    response = requests.post(
        f'{BASE_URL}/api/auth/register',
        headers={'Authorization': f'Bearer {access_token}'},
        json=user_data
    )
    print_response(response)
    return response.json() if response.status_code == 201 else None

def test_logout(access_token):
    """Test user logout."""
    print("\nTesting logout...")
    response = requests.post(
        f'{BASE_URL}/api/auth/logout',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    print_response(response)
    return response.status_code == 200

def run_tests():
    """Run all authentication tests."""
    print("Starting Authentication System Tests")
    print("=" * 80)
    
    # Test admin login
    admin_data = test_login('admin@raise.ke', 'Admin@123')
    if not admin_data:
        print("Admin login failed. Stopping tests.")
        return
    
    admin_token = admin_data['access_token']
    admin_refresh_token = admin_data['refresh_token']
    
    # Test get current user as admin
    test_get_current_user(admin_token)
    
    # Test token refresh
    refresh_data = test_refresh_token(admin_refresh_token)
    if refresh_data:
        admin_token = refresh_data['access_token']
    
    # Test register new user (as admin)
    new_user = {
        'email': f'test.officer{datetime.now().strftime("%H%M%S")}@kenyainsurance.co.ke',
        'password': 'TestOfficer@123',
        'name': 'Test Officer',
        'role': 'insurance_officer',
        'company_id': 'INS001'
    }
    test_register_user(admin_token, new_user)
    
    # Test insurance officer login
    officer_data = test_login('john.doe@kenyainsurance.co.ke', 'Officer@123')
    if officer_data:
        officer_token = officer_data['access_token']
        # Try to register user as officer (should fail)
        test_register_user(officer_token, new_user)
    
    # Test police officer login
    police_data = test_login('officer1@police.go.ke', 'Police@123')
    if police_data:
        police_token = police_data['access_token']
        test_get_current_user(police_token)
    
    # Test invalid login
    print("\nTesting invalid login...")
    test_login('admin@raise.ke', 'wrongpassword')
    
    # Test logout
    test_logout(admin_token)
    
    # Test accessing protected endpoint after logout
    print("\nTesting access after logout...")
    test_get_current_user(admin_token)

if __name__ == '__main__':
    run_tests() 