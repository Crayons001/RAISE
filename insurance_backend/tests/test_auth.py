import pytest
from app.models import User, UserRole
from app import create_app, db
from app.utils.seed_data import seed_database
import json

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            seed_database()  # Seed test data
            yield client

def test_login_admin(client):
    """Test admin login."""
    response = client.post('/api/auth/login',
        json={
            'email': 'admin@raise.ke',
            'password': 'Admin@123'
        }
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    assert 'refresh_token' in data
    assert data['user']['role'] == 'admin'
    return data['access_token']

def test_login_insurance_officer(client):
    """Test insurance officer login."""
    response = client.post('/api/auth/login',
        json={
            'email': 'john.doe@kenyainsurance.co.ke',
            'password': 'Officer@123'
        }
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    assert data['user']['role'] == 'insurance_officer'
    assert data['user']['company_id'] == 'INS001'
    return data['access_token']

def test_login_police_officer(client):
    """Test police officer login."""
    response = client.post('/api/auth/login',
        json={
            'email': 'officer1@police.go.ke',
            'password': 'Police@123'
        }
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    assert data['user']['role'] == 'police'
    return data['access_token']

def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post('/api/auth/login',
        json={
            'email': 'admin@raise.ke',
            'password': 'wrongpassword'
        }
    )
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'error' in data

def test_token_refresh(client):
    """Test token refresh."""
    # First login to get refresh token
    login_response = client.post('/api/auth/login',
        json={
            'email': 'admin@raise.ke',
            'password': 'Admin@123'
        }
    )
    refresh_token = json.loads(login_response.data)['refresh_token']
    
    # Use refresh token to get new access token
    response = client.post('/api/auth/refresh',
        headers={'Authorization': f'Bearer {refresh_token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data

def test_get_current_user(client):
    """Test getting current user info."""
    # Login as admin
    admin_token = test_login_admin(client)
    
    # Get current user info
    response = client.get('/api/auth/me',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['email'] == 'admin@raise.ke'
    assert data['role'] == 'admin'

def test_register_user_admin_only(client):
    """Test user registration (admin only)."""
    # Login as admin
    admin_token = test_login_admin(client)
    
    # Try to register new user as admin
    response = client.post('/api/auth/register',
        headers={'Authorization': f'Bearer {admin_token}'},
        json={
            'email': 'new.officer@kenyainsurance.co.ke',
            'password': 'NewOfficer@123',
            'name': 'New Officer',
            'role': 'insurance_officer',
            'company_id': 'INS001'
        }
    )
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['user']['email'] == 'new.officer@kenyainsurance.co.ke'
    
    # Try to register as insurance officer (should fail)
    officer_token = test_login_insurance_officer(client)
    response = client.post('/api/auth/register',
        headers={'Authorization': f'Bearer {officer_token}'},
        json={
            'email': 'another.officer@kenyainsurance.co.ke',
            'password': 'AnotherOfficer@123',
            'name': 'Another Officer',
            'role': 'insurance_officer',
            'company_id': 'INS001'
        }
    )
    assert response.status_code == 403

def test_logout(client):
    """Test user logout."""
    # Login as admin
    admin_token = test_login_admin(client)
    
    # Logout
    response = client.post('/api/auth/logout',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Successfully logged out'
    
    # Try to access protected endpoint after logout
    response = client.get('/api/auth/me',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert response.status_code == 401

def test_invalid_token(client):
    """Test access with invalid token."""
    response = client.get('/api/auth/me',
        headers={'Authorization': 'Bearer invalid_token'}
    )
    assert response.status_code == 401

def test_missing_token(client):
    """Test access without token."""
    response = client.get('/api/auth/me')
    assert response.status_code == 401

if __name__ == '__main__':
    pytest.main(['-v', 'test_auth.py']) 