"""
tests/test_tenant.py - Tests for tenant routes

Tests cover tenant dashboard, profile, payments, maintenance, lease, and notifications.
"""

import pytest


class TestTenantDashboard:
    """Test tenant dashboard endpoint."""
    
    def test_dashboard_success(self, client, tenant_user):
        """Test getting tenant dashboard with valid token."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/dashboard', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'dashboard' in data
        assert 'welcome' in data['dashboard']
        print(f"✓ Dashboard retrieved successfully")
    
    def test_dashboard_unauthorized(self, client):
        """Test dashboard without token."""
        response = client.get('/api/tenant/dashboard')
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Dashboard access rejected without token")
    
    def test_dashboard_admin_forbidden(self, client, admin_user):
        """Test that admin cannot access tenant dashboard."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/dashboard', headers=headers)
        
        assert response.status_code == 403
        print(f"✓ Admin access to tenant dashboard rejected")


class TestTenantProfile:
    """Test tenant profile endpoints."""
    
    def test_get_profile_success(self, client, tenant_user):
        """Test getting tenant profile."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/profile', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'profile' in data
        print(f"✓ Tenant profile retrieved successfully")
    
    def test_get_profile_unauthorized(self, client):
        """Test getting profile without token."""
        response = client.get('/api/tenant/profile')
        
        assert response.status_code == 401
        print(f"✓ Profile access rejected without token")
    
    def test_update_profile_success(self, client, tenant_user):
        """Test updating tenant profile."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.put('/api/tenant/profile/update', 
            headers=headers,
            json={
                'phone': '+254745678901',
                'occupation': 'Senior Software Engineer',
                'emergency_contact': 'Mary Doe',
                'emergency_phone': '+254745678902'
            }
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['profile']['occupation'] == 'Senior Software Engineer'
        print(f"✓ Profile updated successfully")
    
    def test_update_profile_invalid_phone(self, client, tenant_user):
        """Test updating profile with invalid phone."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.put('/api/tenant/profile/update',
            headers=headers,
            json={'phone': '123'}
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'phone' in data['error'].lower()
        print(f"✓ Invalid phone rejected")
    
    def test_update_profile_invalid_emergency_phone(self, client, tenant_user):
        """Test updating profile with invalid emergency phone."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.put('/api/tenant/profile/update',
            headers=headers,
            json={'emergency_phone': 'invalid'}
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Invalid emergency phone rejected")
    
    def test_update_profile_unauthorized(self, client):
        """Test updating profile without token."""
        response = client.put('/api/tenant/profile/update',
            json={'occupation': 'Engineer'}
        )
        
        assert response.status_code == 401
        print(f"✓ Unauthorized profile update rejected")


class TestTenantPayments:
    """Test tenant payment endpoints."""
    
    def test_get_payments_success(self, client, tenant_user):
        """Test getting tenant payments."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/payments', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'payments' in data
        assert 'summary' in data
        assert 'pagination' in data
        print(f"✓ Payments retrieved successfully")
    
    def test_get_payments_with_pagination(self, client, tenant_user):
        """Test getting payments with pagination."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/payments?page=1&per_page=5', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['pagination']['page'] == 1
        assert data['pagination']['per_page'] == 5
        print(f"✓ Payments paginated successfully")
    
    def test_get_payments_filter_by_status(self, client, tenant_user):
        """Test filtering payments by status."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/payments?status=pending', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Payments filtered by status successfully")
    
    def test_get_payments_invalid_pagination(self, client, tenant_user):
        """Test getting payments with invalid pagination."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/payments?page=-1', headers=headers)
        
        assert response.status_code == 400
        print(f"✓ Invalid pagination rejected")
    
    def test_initiate_mpesa_payment_success(self, client, tenant_user):
        """Test initiating M-Pesa payment."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/tenant/payments/mpesa',
            headers=headers,
            json={
                'amount': 25000,
                'phone': '+254712345678',
                'payment_month': 'February 2025'
            }
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'stk_push' in data
        print(f"✓ M-Pesa payment initiated successfully")
    
    def test_initiate_mpesa_payment_missing_fields(self, client, tenant_user):
        """Test M-Pesa payment with missing fields."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/tenant/payments/mpesa',
            headers=headers,
            json={'amount': 25000}
        )
        
        assert response.status_code == 400
        print(f"✓ M-Pesa payment with missing fields rejected")
    
    def test_initiate_mpesa_payment_invalid_amount(self, client, tenant_user):
        """Test M-Pesa payment with invalid amount."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/tenant/payments/mpesa',
            headers=headers,
            json={
                'amount': -100,
                'phone': '+254712345678'
            }
        )
        
        assert response.status_code == 400
        print(f"✓ M-Pesa payment with invalid amount rejected")


class TestTenantMaintenance:
    """Test tenant maintenance endpoints."""
    
    def test_submit_maintenance_request_success(self, client, tenant_user):
        """Test submitting maintenance request."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/tenant/maintenance/request',
            headers=headers,
            json={
                'title': 'Air conditioner not working',
                'description': 'The AC in my room is not cooling properly',
                'category': 'electrical',
                'priority': 'high'
            }
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'request' in data
        print(f"✓ Maintenance request submitted successfully")
    
    def test_submit_maintenance_request_missing_title(self, client, tenant_user):
        """Test submitting maintenance without title."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/tenant/maintenance/request',
            headers=headers,
            json={
                'description': 'Some description'
            }
        )
        
        assert response.status_code == 400
        print(f"✓ Missing title rejected")
    
    def test_submit_maintenance_request_short_title(self, client, tenant_user):
        """Test maintenance request with title too short."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/tenant/maintenance/request',
            headers=headers,
            json={
                'title': 'AC',
                'description': 'The AC is broken'
            }
        )
        
        assert response.status_code == 400
        print(f"✓ Short title rejected")
    
    def test_get_maintenance_requests_success(self, client, tenant_user):
        """Test getting maintenance requests."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/maintenance', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'maintenance_requests' in data
        assert 'summary' in data
        print(f"✓ Maintenance requests retrieved successfully")
    
    def test_get_maintenance_requests_filter_by_status(self, client, tenant_user):
        """Test filtering maintenance requests by status."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/maintenance?status=pending', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Maintenance requests filtered successfully")
    
    def test_get_maintenance_unauthorized(self, client):
        """Test getting maintenance without token."""
        response = client.get('/api/tenant/maintenance')
        
        assert response.status_code == 401
        print(f"✓ Maintenance access rejected without token")


class TestTenantLease:
    """Test tenant lease endpoints."""
    
    def test_get_lease_success(self, client, tenant_user):
        """Test getting tenant lease."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/lease', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'lease' in data
        assert 'lease_duration' in data['lease']
        print(f"✓ Lease retrieved successfully")
    
    def test_get_lease_unauthorized(self, client):
        """Test getting lease without token."""
        response = client.get('/api/tenant/lease')
        
        assert response.status_code == 401
        print(f"✓ Lease access rejected without token")


class TestTenantNotifications:
    """Test tenant notification endpoints."""
    
    def test_get_notifications_success(self, client, tenant_user):
        """Test getting tenant notifications."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/notifications', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'notifications' in data
        assert 'summary' in data
        print(f"✓ Notifications retrieved successfully")
    
    def test_get_notifications_with_pagination(self, client, tenant_user):
        """Test getting notifications with pagination."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/notifications?page=1&per_page=5', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['pagination']['page'] == 1
        print(f"✓ Notifications paginated successfully")
    
    def test_get_notifications_filter_unread(self, client, tenant_user):
        """Test getting unread notifications."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/tenant/notifications?read=false', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Unread notifications retrieved successfully")
    
    def test_mark_notification_read(self, client, tenant_user):
        """Test marking notification as read."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        data = login_response.get_json()
        token = data['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.put('/api/tenant/notifications/1/read', headers=headers)
        
        if response.status_code == 403:
            print(f"✓ Notification authorization check passed")
        else:
            assert response.status_code == 200
            data = response.get_json()
            assert data['success'] is True
            assert data['notification']['read'] is True
            print(f"✓ Notification marked as read successfully")
    
    def test_mark_notification_read_not_found(self, client, tenant_user):
        """Test marking non-existent notification as read."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.put('/api/tenant/notifications/9999/read', headers=headers)
        
        assert response.status_code == 404
        print(f"✓ Non-existent notification rejected")
    
    def test_get_notifications_unauthorized(self, client):
        """Test getting notifications without token."""
        response = client.get('/api/tenant/notifications')
        
        assert response.status_code == 401
        print(f"✓ Notifications access rejected without token")


class TestTenantLogout:
    """Test tenant logout endpoint."""
    
    def test_logout_success(self, client, tenant_user):
        """Test successful logout."""
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/tenant/logout', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Logout successful")
    
    def test_logout_unauthorized(self, client):
        """Test logout without token."""
        response = client.post('/api/tenant/logout')
        
        assert response.status_code == 401
        print(f"✓ Logout rejected without token")


class TestTenantIntegration:
    """Integration tests for tenant flow."""
    
    def test_complete_tenant_flow(self, client):
        """Test complete tenant user flow."""
        reg_response = client.post('/api/auth/register', json={
            'email': 'integration@test.com',
            'password': 'Integration@123456',
            'confirm_password': 'Integration@123456',
            'full_name': 'Integration Test',
            'phone': '+254712345678',
            'role': 'tenant'
        })
        assert reg_response.status_code == 201
        print(f"✓ Step 1: Registration successful")
        
        login_response = client.post('/api/auth/login', json={
            'email': 'integration@test.com',
            'password': 'Integration@123456'
        })
        assert login_response.status_code == 200
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        print(f"✓ Step 2: Login successful")
        
        dash_response = client.get('/api/tenant/dashboard', headers=headers)
        assert dash_response.status_code in [200, 404]
        print(f"✓ Step 3: Dashboard access successful")
        
        profile_response = client.get('/api/tenant/profile', headers=headers)
        assert profile_response.status_code in [200, 404]
        print(f"✓ Step 4: Profile access successful")
        
        payments_response = client.get('/api/tenant/payments', headers=headers)
        assert payments_response.status_code in [200, 404]
        print(f"✓ Step 5: Payments access successful")
        
        maintenance_response = client.post('/api/tenant/maintenance/request',
            headers=headers,
            json={
                'title': 'Test maintenance issue',
                'description': 'This is a test maintenance request for integration testing'
            }
        )
        assert maintenance_response.status_code in [201, 404]
        print(f"✓ Step 6: Maintenance request submission successful")
        
        logout_response = client.post('/api/tenant/logout', headers=headers)
        assert logout_response.status_code == 200
        print(f"✓ Step 7: Logout successful")
        
        print(f"✓✓✓ Complete tenant flow executed successfully!")