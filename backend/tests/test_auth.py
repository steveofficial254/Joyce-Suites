"""
tests/test_auth.py - Tests for authentication routes

Tests cover registration, login, profile management, and authorization.
"""

import pytest


class TestAuthRegistration:
    """Test user registration endpoint."""
    
    def test_register_user_success(self, client):
        """Test successful user registration."""
        response = client.post('/api/auth/register', json={
            'email': 'newuser@test.com',
            'password': 'NewPass@123456',
            'confirm_password': 'NewPass@123456',
            'full_name': 'New User',
            'phone': '+254712345678',
            'role': 'tenant'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert data['user']['email'] == 'newuser@test.com'
        assert data['user']['full_name'] == 'New User'
        assert 'token' in data
        print(f"✓ User registered successfully: {data['user']['email']}")
    
    def test_register_user_duplicate_email(self, client, tenant_user):
        """Test registration with duplicate email fails."""
        response = client.post('/api/auth/register', json={
            'email': tenant_user['email'],
            'password': 'Pass@123456',
            'confirm_password': 'Pass@123456',
            'full_name': 'Duplicate User',
            'phone': '+254712345678',
            'role': 'tenant'
        })
        
        assert response.status_code == 409
        data = response.get_json()
        assert data['success'] is False
        assert 'Email already registered' in data['error']
        print(f"✓ Duplicate email rejected: {tenant_user['email']}")
    
    def test_register_weak_password(self, client):
        """Test registration with weak password fails."""
        response = client.post('/api/auth/register', json={
            'email': 'weakpass@test.com',
            'password': 'weak',
            'confirm_password': 'weak',
            'full_name': 'Weak Pass User',
            'phone': '+254712345678',
            'role': 'tenant'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'password' in data['error'].lower()
        print(f"✓ Weak password rejected")
    
    def test_register_passwords_mismatch(self, client):
        """Test registration with mismatched passwords fails."""
        response = client.post('/api/auth/register', json={
            'email': 'mismatch@test.com',
            'password': 'Pass@123456',
            'confirm_password': 'Different@123456',
            'full_name': 'Mismatch User',
            'phone': '+254712345678',
            'role': 'tenant'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'passwords do not match' in data['error'].lower()
        print(f"✓ Password mismatch rejected")
    
    def test_register_missing_fields(self, client):
        """Test registration with missing required fields fails."""
        response = client.post('/api/auth/register', json={
            'email': 'incomplete@test.com',
            'password': 'Pass@123456'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Missing fields rejected")
    
    def test_register_invalid_phone(self, client):
        """Test registration with invalid phone format fails."""
        response = client.post('/api/auth/register', json={
            'email': 'invalidphone@test.com',
            'password': 'Pass@123456',
            'confirm_password': 'Pass@123456',
            'full_name': 'Invalid Phone',
            'phone': '123',
            'role': 'tenant'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'phone' in data['error'].lower()
        print(f"✓ Invalid phone format rejected")
    
    def test_register_invalid_role(self, client):
        """Test registration with invalid role fails."""
        response = client.post('/api/auth/register', json={
            'email': 'invalidrole@test.com',
            'password': 'Pass@123456',
            'confirm_password': 'Pass@123456',
            'full_name': 'Invalid Role',
            'phone': '+254712345678',
            'role': 'superadmin'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Invalid role rejected")
    
    def test_register_invalid_email_format(self, client):
        """Test registration with invalid email format fails."""
        response = client.post('/api/auth/register', json={
            'email': 'invalidemail',
            'password': 'Pass@123456',
            'confirm_password': 'Pass@123456',
            'full_name': 'Invalid Email',
            'phone': '+254712345678',
            'role': 'tenant'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Invalid email format rejected")


class TestAuthLogin:
    """Test user login endpoint."""
    
    def test_login_success(self, client, tenant_user):
        """Test successful login."""
        response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['user']['email'] == tenant_user['email']
        assert 'token' in data
        print(f"✓ Login successful for: {tenant_user['email']}")
    
    def test_login_invalid_email(self, client):
        """Test login with non-existent email."""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@test.com',
            'password': 'Pass@123456'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Login rejected for non-existent email")
    
    def test_login_invalid_password(self, client, tenant_user):
        """Test login with incorrect password."""
        response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': 'WrongPassword@123456'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Login rejected with wrong password")
    
    def test_login_missing_email(self, client):
        """Test login with missing email."""
        response = client.post('/api/auth/login', json={
            'password': 'Pass@123456'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Login rejected with missing email")
    
    def test_login_missing_password(self, client):
        """Test login with missing password."""
        response = client.post('/api/auth/login', json={
            'email': 'test@test.com'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Login rejected with missing password")
    
    def test_login_all_roles(self, client, admin_user, caretaker_user, tenant_user):
        """Test login works for all user roles."""
        test_cases = [
            (admin_user['email'], admin_user['password'], 'admin'),
            (caretaker_user['email'], caretaker_user['password'], 'caretaker'),
            (tenant_user['email'], tenant_user['password'], 'tenant'),
        ]
        
        for email, password, role in test_cases:
            response = client.post('/api/auth/login', json={
                'email': email,
                'password': password
            })
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['success'] is True
            assert data['user']['role'] == role
            print(f"✓ {role.capitalize()} login successful")


class TestAuthProfile:
    """Test user profile endpoints."""
    
    def test_get_profile_success(self, client, auth_headers):
        """Test getting user profile with valid token."""
        response = client.get('/api/auth/profile', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'user' in data
        assert 'email' in data['user']
        print(f"✓ Profile retrieved successfully")
    
    def test_get_profile_unauthorized(self, client):
        """Test getting profile without token."""
        response = client.get('/api/auth/profile')
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Profile access rejected without token")
    
    def test_get_profile_invalid_token(self, client):
        """Test getting profile with invalid token."""
        response = client.get('/api/auth/profile',
            headers={'Authorization': 'Bearer invalid_token'}
        )
        
        assert response.status_code == 401
        print(f"✓ Profile access rejected with invalid token")
    
    def test_update_profile_success(self, client, auth_headers):
        """Test updating user profile."""
        response = client.put('/api/auth/profile/update', 
            headers=auth_headers,
            json={
                'full_name': 'Updated Admin Name',
                'phone': '+254712999999'
            }
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['user']['full_name'] == 'Updated Admin Name'
        print(f"✓ Profile updated successfully")
    
    def test_update_profile_invalid_phone(self, client, auth_headers):
        """Test updating profile with invalid phone."""
        response = client.put('/api/auth/profile/update',
            headers=auth_headers,
            json={
                'phone': '123'
            }
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Profile update rejected with invalid phone")
    
    def test_update_profile_unauthorized(self, client):
        """Test updating profile without token."""
        response = client.put('/api/auth/profile/update', json={
            'full_name': 'Updated Name'
        })
        
        assert response.status_code == 401
        print(f"✓ Profile update rejected without token")
    
    def test_update_profile_partial(self, client, auth_headers):
        """Test updating only some profile fields."""
        response = client.put('/api/auth/profile/update',
            headers=auth_headers,
            json={
                'full_name': 'Only Name Updated'
            }
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['user']['full_name'] == 'Only Name Updated'
        print(f"✓ Partial profile update successful")


class TestAuthLogout:
    """Test user logout endpoint."""
    
    def test_logout_success(self, client, auth_headers):
        """Test successful logout."""
        response = client.post('/api/auth/logout', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Logout successful")
    
    def test_logout_unauthorized(self, client):
        """Test logout without token."""
        response = client.post('/api/auth/logout')
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Logout rejected without token")


class TestAuthDelete:
    """Test user deletion (admin only)."""
    
    def test_delete_user_admin_success(self, client, admin_user, tenant_user):
        """Test admin deleting a user."""
        # Create a fresh user to delete (to avoid issues with fixture reuse)
        fresh_user = {
            'email': 'delete_target@test.com',
            'password': 'DeleteTarget@123456',
            'confirm_password': 'DeleteTarget@123456',
            'full_name': 'Delete Target User',
            'phone': '+254745678901',
            'role': 'tenant'
        }
        client.post('/api/auth/register', json=fresh_user)
        
        # Login as admin to get fresh token
        admin_login = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        assert admin_login.status_code == 200, f"Admin login failed: {admin_login.get_json()}"
        admin_data = admin_login.get_json()
        admin_token = admin_data['token']
        admin_headers = {'Authorization': f'Bearer {admin_token}'}
        
        # Get the fresh user's ID by logging in
        target_login = client.post('/api/auth/login', json={
            'email': fresh_user['email'],
            'password': fresh_user['password']
        })
        assert target_login.status_code == 200, f"Target login failed: {target_login.get_json()}"
        target_data = target_login.get_json()
        target_id = target_data['user']['user_id']
        
        # Now delete as admin
        response = client.delete(f'/api/auth/delete/{target_id}', headers=admin_headers)
        
        assert response.status_code == 200, f"Delete failed: {response.get_json()}"
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Admin deleted user successfully")
    
    def test_delete_user_not_found(self, client, admin_user):
        """Test deleting non-existent user."""
        # Login as admin to get fresh token
        admin_login = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        admin_token = admin_login.get_json()['token']
        admin_headers = {'Authorization': f'Bearer {admin_token}'}
        
        response = client.delete('/api/auth/delete/9999', headers=admin_headers)
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Delete non-existent user rejected")
    
    def test_delete_own_account(self, client, admin_user):
        """Test cannot delete own account."""
        # Login as admin to get fresh token and ID
        admin_login = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        admin_data = admin_login.get_json()
        admin_token = admin_data['token']
        admin_id = admin_data['user']['user_id']
        admin_headers = {'Authorization': f'Bearer {admin_token}'}
        
        response = client.delete(f'/api/auth/delete/{admin_id}', headers=admin_headers)
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'Cannot delete your own account' in data['error']
        print(f"✓ Self-deletion rejected")
    
    def test_delete_user_unauthorized(self, client, tenant_user):
        """Test non-admin cannot delete users."""
        response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Try to delete another user
        response = client.delete(f'/api/auth/delete/9999', headers=headers)
        
        assert response.status_code == 403
        print(f"✓ Non-admin delete rejected")


class TestAuthTokens:
    """Test JWT token validation and security."""
    
    def test_invalid_token_format(self, client):
        """Test with invalid token format."""
        response = client.get('/api/auth/profile',
            headers={'Authorization': 'InvalidFormat'}
        )
        
        assert response.status_code == 401
        print(f"✓ Invalid token format rejected")
    
    def test_missing_bearer_prefix(self, client):
        """Test with missing Bearer prefix."""
        response = client.get('/api/auth/profile',
            headers={'Authorization': 'some_random_token'}
        )
        
        assert response.status_code == 401
        print(f"✓ Missing Bearer prefix rejected")
    
    def test_empty_auth_header(self, client):
        """Test with empty Authorization header."""
        response = client.get('/api/auth/profile',
            headers={'Authorization': ''}
        )
        
        assert response.status_code == 401
        print(f"✓ Empty auth header rejected")
    
    def test_token_in_response(self, client, tenant_user):
        """Test that token is returned in login response."""
        response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        
        data = response.get_json()
        assert 'token' in data
        assert len(data['token']) > 0
        assert data['token'].count('.') == 2
        print(f"✓ Valid JWT token returned")


class TestAuthIntegration:
    """Integration tests for auth flow."""
    
    def test_full_auth_flow(self, client):
        """Test complete registration -> login -> profile flow."""
        # 1. Register
        register_response = client.post('/api/auth/register', json={
            'email': 'flow@test.com',
            'password': 'FlowTest@123456',
            'confirm_password': 'FlowTest@123456',
            'full_name': 'Flow Test User',
            'phone': '+254712345678',
            'role': 'tenant'
        })
        assert register_response.status_code == 201
        token = register_response.get_json()['token']
        print(f"✓ Step 1: Registration successful")
        
        # 2. Login
        login_response = client.post('/api/auth/login', json={
            'email': 'flow@test.com',
            'password': 'FlowTest@123456'
        })
        assert login_response.status_code == 200
        token = login_response.get_json()['token']
        print(f"✓ Step 2: Login successful")
        
        # 3. Get Profile
        profile_response = client.get('/api/auth/profile',
            headers={'Authorization': f'Bearer {token}'}
        )
        assert profile_response.status_code == 200
        assert profile_response.get_json()['user']['email'] == 'flow@test.com'
        print(f"✓ Step 3: Profile retrieval successful")
        
        # 4. Update Profile
        update_response = client.put('/api/auth/profile/update',
            headers={'Authorization': f'Bearer {token}'},
            json={'full_name': 'Updated Flow User'}
        )
        assert update_response.status_code == 200
        print(f"✓ Step 4: Profile update successful")
        
        # 5. Logout
        logout_response = client.post('/api/auth/logout',
            headers={'Authorization': f'Bearer {token}'}
        )
        assert logout_response.status_code == 200
        print(f"✓ Step 5: Logout successful")
        
        print(f"✓✓✓ Full auth flow completed successfully!")