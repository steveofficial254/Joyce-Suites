"""
tests/test_caretaker.py - Tests for caretaker routes

Tests cover caretaker dashboard, maintenance requests, notifications, 
payment monitoring, and room management.
"""

import pytest


class TestCaretakerDashboard:
    """Test caretaker dashboard endpoint."""
    
    def test_dashboard_success(self, client, caretaker_user):
        """Test getting caretaker dashboard with valid token."""
        # Login as caretaker
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/dashboard', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'dashboard' in data
        assert 'total_maintenance_requests' in data['dashboard']
        print(f"✓ Dashboard retrieved successfully")
    
    def test_dashboard_unauthorized(self, client):
        """Test dashboard without token."""
        response = client.get('/api/caretaker/dashboard')
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
        print(f"✓ Dashboard access rejected without token")
    
    def test_dashboard_tenant_forbidden(self, client, tenant_user):
        """Test that tenant cannot access caretaker dashboard."""
        # Login as tenant
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/dashboard', headers=headers)
        
        assert response.status_code == 403
        print(f"✓ Tenant access to caretaker dashboard rejected")


class TestMaintenanceRequests:
    """Test maintenance request endpoints."""
    
    def test_get_maintenance_requests_success(self, client, caretaker_user):
        """Test getting maintenance requests."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/maintenance', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'maintenance_requests' in data
        assert 'pagination' in data
        print(f"✓ Maintenance requests retrieved successfully")
    
    def test_get_maintenance_requests_with_pagination(self, client, caretaker_user):
        """Test maintenance requests with pagination."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/maintenance?page=1&per_page=5', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['pagination']['page'] == 1
        assert data['pagination']['per_page'] == 5
        print(f"✓ Maintenance requests paginated successfully")
    
    def test_get_maintenance_requests_filter_by_status(self, client, caretaker_user):
        """Test filtering maintenance requests by status."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/maintenance?status=pending', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Maintenance requests filtered by status successfully")
    
    def test_get_maintenance_requests_filter_by_priority(self, client, caretaker_user):
        """Test filtering maintenance requests by priority."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/maintenance?priority=high', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Maintenance requests filtered by priority successfully")
    
    def test_get_maintenance_requests_invalid_pagination(self, client, caretaker_user):
        """Test maintenance requests with invalid pagination."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/maintenance?page=-1', headers=headers)
        
        assert response.status_code == 400
        print(f"✓ Invalid pagination rejected")
    
    def test_update_maintenance_status_success(self, client, caretaker_user):
        """Test updating maintenance request status."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/caretaker/maintenance/update/1',
            headers=headers,
            json={
                'status': 'in_progress',
                'priority': 'high',
                'assigned_to': 'John Kariuki',
                'notes': 'Started work on the issue'
            }
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['maintenance_request']['status'] == 'in_progress'
        assert data['maintenance_request']['assigned_to'] == 'John Kariuki'
        print(f"✓ Maintenance status updated successfully")
    
    def test_update_maintenance_status_invalid_status(self, client, caretaker_user):
        """Test updating maintenance with invalid status."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/caretaker/maintenance/update/1',
            headers=headers,
            json={'status': 'invalid_status'}
        )
        
        assert response.status_code == 400
        print(f"✓ Invalid status rejected")
    
    def test_update_maintenance_status_not_found(self, client, caretaker_user):
        """Test updating non-existent maintenance request."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/caretaker/maintenance/update/9999',
            headers=headers,
            json={'status': 'completed'}
        )
        
        assert response.status_code == 404
        print(f"✓ Non-existent request rejected")
    
    def test_get_maintenance_unauthorized(self, client):
        """Test getting maintenance without token."""
        response = client.get('/api/caretaker/maintenance')
        
        assert response.status_code == 401
        print(f"✓ Maintenance access rejected without token")


class TestNotifications:
    """Test notification endpoints."""
    
    def test_send_notification_success(self, client, caretaker_user):
        """Test sending notification to tenant."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/caretaker/tenant/notify',
            headers=headers,
            json={
                'tenant_id': 1,
                'type': 'rent_reminder',
                'title': 'Rent Payment Reminder',
                'message': 'Your rent for March 2025 is due on 2025-03-01'
            }
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'notification' in data
        print(f"✓ Notification sent successfully")
    
    def test_send_notification_missing_fields(self, client, caretaker_user):
        """Test sending notification with missing fields."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/caretaker/tenant/notify',
            headers=headers,
            json={
                'tenant_id': 1,
                'type': 'rent_reminder'
            }
        )
        
        assert response.status_code == 400
        print(f"✓ Missing fields rejected")
    
    def test_send_notification_invalid_type(self, client, caretaker_user):
        """Test sending notification with invalid type."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/caretaker/tenant/notify',
            headers=headers,
            json={
                'tenant_id': 1,
                'type': 'invalid_type',
                'title': 'Test',
                'message': 'Test message'
            }
        )
        
        assert response.status_code == 400
        print(f"✓ Invalid notification type rejected")
    
    def test_send_notification_short_message(self, client, caretaker_user):
        """Test sending notification with message too short."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/caretaker/tenant/notify',
            headers=headers,
            json={
                'tenant_id': 1,
                'type': 'rent_reminder',
                'title': 'Test',
                'message': 'Hi'
            }
        )
        
        assert response.status_code == 400
        print(f"✓ Short message rejected")


class TestPaymentMonitoring:
    """Test payment monitoring endpoints."""
    
    def test_get_pending_payments_success(self, client, caretaker_user):
        """Test getting pending payments."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/payments/pending', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'pending_payments' in data
        assert 'count' in data['pending_payments']
        assert 'total_balance' in data['pending_payments']
        assert 'tenants' in data['pending_payments']
        print(f"✓ Pending payments retrieved successfully")
    
    def test_get_pending_payments_sort_by_balance(self, client, caretaker_user):
        """Test getting pending payments sorted by balance."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/payments/pending?sort_by=balance&order=desc', 
            headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Pending payments sorted by balance")
    
    def test_get_pending_payments_sort_by_months_overdue(self, client, caretaker_user):
        """Test getting pending payments sorted by months overdue."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/payments/pending?sort_by=months_overdue', 
            headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Pending payments sorted by months overdue")
    
    def test_get_pending_payments_unauthorized(self, client):
        """Test getting pending payments without token."""
        response = client.get('/api/caretaker/payments/pending')
        
        assert response.status_code == 401
        print(f"✓ Pending payments access rejected without token")


class TestRoomMonitoring:
    """Test room monitoring endpoints."""
    
    def test_get_available_rooms_success(self, client, caretaker_user):
        """Test getting available rooms."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/rooms/available', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'available_rooms' in data
        assert 'summary' in data
        assert 'total_available' in data['summary']
        assert 'total_rooms' in data['summary']
        assert 'occupancy_rate' in data['summary']
        print(f"✓ Available rooms retrieved successfully")
    
    def test_get_available_rooms_filter_by_floor(self, client, caretaker_user):
        """Test getting available rooms filtered by floor."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/rooms/available?floor=1', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Available rooms filtered by floor")
    
    def test_get_available_rooms_filter_by_type(self, client, caretaker_user):
        """Test getting available rooms filtered by type."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/rooms/available?room_type=single', 
            headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Available rooms filtered by type")
    
    def test_get_occupied_rooms_success(self, client, caretaker_user):
        """Test getting occupied rooms."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/rooms/occupied', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'occupied_rooms' in data
        assert 'summary' in data
        assert 'total_occupied' in data['summary']
        print(f"✓ Occupied rooms retrieved successfully")
    
    def test_get_occupied_rooms_filter_by_floor(self, client, caretaker_user):
        """Test getting occupied rooms filtered by floor."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/rooms/occupied?floor=1', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Occupied rooms filtered by floor")
    
    def test_get_occupied_rooms_filter_by_type(self, client, caretaker_user):
        """Test getting occupied rooms filtered by type."""
        login_response = client.post('/api/auth/login', json={
            'email': caretaker_user['email'],
            'password': caretaker_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/caretaker/rooms/occupied?room_type=single', 
            headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Occupied rooms filtered by type")
    
    def test_get_occupied_rooms_unauthorized(self, client):
        """Test getting occupied rooms without token."""
        response = client.get('/api/caretaker/rooms/occupied')
        
        assert response.status_code == 401
        print(f"✓ Occupied rooms access rejected without token")


class TestCaretakerIntegration:
    """Integration tests for caretaker flow."""
    
    def test_complete_caretaker_flow(self, client):
        """Test complete caretaker user flow."""
        # 1. Register as caretaker
        reg_response = client.post('/api/auth/register', json={
            'email': 'integration.caretaker@test.com',
            'password': 'Integration@123456',
            'confirm_password': 'Integration@123456',
            'full_name': 'Integration Caretaker',
            'phone': '+254712345678',
            'role': 'caretaker'
        })
        assert reg_response.status_code == 201
        print(f"✓ Step 1: Registration successful")
        
        # 2. Login
        login_response = client.post('/api/auth/login', json={
            'email': 'integration.caretaker@test.com',
            'password': 'Integration@123456'
        })
        assert login_response.status_code == 200
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        print(f"✓ Step 2: Login successful")
        
        # 3. Get dashboard
        dash_response = client.get('/api/caretaker/dashboard', headers=headers)
        assert dash_response.status_code == 200
        print(f"✓ Step 3: Dashboard access successful")
        
        # 4. Get maintenance requests
        maint_response = client.get('/api/caretaker/maintenance', headers=headers)
        assert maint_response.status_code == 200
        print(f"✓ Step 4: Maintenance requests access successful")
        
        # 5. Send notification
        notif_response = client.post('/api/caretaker/tenant/notify',
            headers=headers,
            json={
                'tenant_id': 1,
                'type': 'rent_reminder',
                'title': 'Payment Reminder',
                'message': 'Integration test notification'
            }
        )
        assert notif_response.status_code == 201
        print(f"✓ Step 5: Notification sent successfully")
        
        # 6. Get pending payments
        payments_response = client.get('/api/caretaker/payments/pending', headers=headers)
        assert payments_response.status_code == 200
        print(f"✓ Step 6: Pending payments access successful")
        
        # 7. Get available rooms
        rooms_response = client.get('/api/caretaker/rooms/available', headers=headers)
        assert rooms_response.status_code == 200
        print(f"✓ Step 7: Available rooms access successful")
        
        # 8. Update maintenance status
        update_response = client.post('/api/caretaker/maintenance/update/1',
            headers=headers,
            json={
                'status': 'in_progress',
                'assigned_to': 'Test Worker'
            }
        )
        assert update_response.status_code == 200
        print(f"✓ Step 8: Maintenance status updated successfully")
        
        print(f"✓✓✓ Complete caretaker flow executed successfully!")