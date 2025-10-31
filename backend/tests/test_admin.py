
import pytest


class TestAdminDashboard:
    """Test admin dashboard endpoint."""
    
    def test_overview_success(self, client, admin_user):
        """Test getting admin overview with valid token."""
        # Login as admin
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/overview', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'overview' in data
        assert 'total_tenants' in data['overview']
        assert 'total_rooms' in data['overview']
        print(f"✓ Overview retrieved successfully")
    
    def test_overview_unauthorized(self, client):
        """Test overview without token."""
        response = client.get('/api/admin/overview')
        
        assert response.status_code == 401
        print(f"✓ Overview access rejected without token")
    
    def test_overview_tenant_forbidden(self, client, tenant_user):
        """Test that tenant cannot access admin overview."""
        # Login as tenant
        login_response = client.post('/api/auth/login', json={
            'email': tenant_user['email'],
            'password': tenant_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/overview', headers=headers)
        
        assert response.status_code == 403
        print(f"✓ Tenant access to admin overview rejected")


class TestTenantManagement:
    """Test tenant management endpoints."""
    
    def test_get_all_tenants_success(self, client, admin_user):
        """Test getting all tenants."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/tenants', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'tenants' in data
        assert 'pagination' in data
        print(f"✓ All tenants retrieved successfully")
    
    def test_get_all_tenants_with_pagination(self, client, admin_user):
        """Test getting tenants with pagination."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/tenants?page=1&per_page=5', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['pagination']['current_page'] == 1
        assert data['pagination']['per_page'] == 5
        print("✓ Tenants paginated successfully")

    
    def test_get_tenant_details_success(self, client, admin_user):
        """Test getting specific tenant details."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/tenant/1', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'tenant' in data
        print(f"✓ Tenant details retrieved successfully")
    
    def test_get_tenant_details_not_found(self, client, admin_user):
        """Test getting non-existent tenant."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/tenant/9999', headers=headers)
        
        assert response.status_code == 404
        print(f"✓ Non-existent tenant rejected")
    
    def test_create_tenant_success(self, client, admin_user):
        """Test creating a new tenant."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/admin/tenant/create',
            headers=headers,
            json={
                'full_name': 'New Tenant',
                'email': 'new.tenant@example.com',
                'phone': '+254745678901',
                'id_number': '99999999',
                'occupation': 'Engineer',
                'emergency_contact': 'Emergency Person',
                'emergency_phone': '+254745678902',
                'room_id': 103
            }
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'tenant' in data
        print(f"✓ Tenant created successfully")
    
    def test_create_tenant_missing_fields(self, client, admin_user):
        """Test creating tenant with missing required fields."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/admin/tenant/create',
            headers=headers,
            json={
                'full_name': 'New Tenant',
                'email': 'new.tenant@example.com'
            }
        )
        
        assert response.status_code == 400
        print(f"✓ Missing fields rejected")
    
    def test_create_tenant_invalid_email(self, client, admin_user):
        """Test creating tenant with invalid email."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/admin/tenant/create',
            headers=headers,
            json={
                'full_name': 'New Tenant',
                'email': 'invalid-email',
                'phone': '+254745678901',
                'id_number': '99999999'
            }
        )
        
        assert response.status_code == 400
        print(f"✓ Invalid email rejected")
    
    def test_create_tenant_invalid_phone(self, client, admin_user):
        """Test creating tenant with invalid phone."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.post('/api/admin/tenant/create',
            headers=headers,
            json={
                'full_name': 'New Tenant',
                'email': 'new@example.com',
                'phone': '123',
                'id_number': '99999999'
            }
        )
        
        assert response.status_code == 400
        print(f"✓ Invalid phone rejected")
    
    def test_update_tenant_success(self, client, admin_user):
        """Test updating tenant information."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.put('/api/admin/tenant/update/1',
            headers=headers,
            json={
                'occupation': 'Senior Engineer',
                'phone': '+254745678901'
            }
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['tenant']['occupation'] == 'Senior Engineer'
        print(f"✓ Tenant updated successfully")
    
    def test_update_tenant_invalid_phone(self, client, admin_user):
        """Test updating tenant with invalid phone."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.put('/api/admin/tenant/update/1',
            headers=headers,
            json={'phone': 'invalid'}
        )
        
        assert response.status_code == 400
        print(f"✓ Invalid phone rejected")
    
    def test_delete_tenant_success(self, client, admin_user):
        """Test deleting a tenant."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Create a tenant first
        create_response = client.post('/api/admin/tenant/create',
            headers=headers,
            json={
                'full_name': 'Temp Tenant',
                'email': 'temp@example.com',
                'phone': '+254745678901',
                'id_number': '88888888'
            }
        )
        
        tenant_id = create_response.get_json()['tenant']['tenant_id']
        
        # Delete the tenant
        delete_response = client.delete(f'/api/admin/tenant/delete/{tenant_id}',
            headers=headers
        )
        
        assert delete_response.status_code == 200
        print(f"✓ Tenant deleted successfully")
    
    def test_get_tenants_unauthorized(self, client):
        """Test getting tenants without token."""
        response = client.get('/api/admin/tenants')
        
        assert response.status_code == 401
        print(f"✓ Tenants access rejected without token")


class TestContractManagement:
    """Test contract management endpoints."""
    
    def test_get_all_contracts_success(self, client, admin_user):
        """Test getting all contracts."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/contracts', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'contracts' in data
        print(f"✓ All contracts retrieved successfully")
    
    def test_get_all_contracts_filter_by_status(self, client, admin_user):
        """Test getting contracts filtered by status."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/contracts?status=active', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        print(f"✓ Contracts filtered by status")
    
    def test_get_all_contracts_with_pagination(self, client, admin_user):
        """Test getting contracts with pagination."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/contracts?page=1&per_page=5', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['pagination']['current_page'] == 1
        print(f"✓ Contracts paginated successfully")
    
    def test_get_contracts_unauthorized(self, client):
        """Test getting contracts without token."""
        response = client.get('/api/admin/contracts')
        
        assert response.status_code == 401
        print(f"✓ Contracts access rejected without token")


class TestReportGeneration:
    """Test report generation endpoints."""
    
    def test_get_payment_report_success(self, client, admin_user):
        """Test generating payment report."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/payments/report', headers=headers)
        
        assert response.status_code == 200
        print(f"✓ Payment report generated successfully")
    
    def test_get_occupancy_report_success(self, client, admin_user):
        """Test generating occupancy report."""
        login_response = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password']
        })
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/admin/occupancy/report', headers=headers)
        
        assert response.status_code == 200
        print(f"✓ Occupancy report generated successfully")
    
    def test_get_payment_report_unauthorized(self, client):
        """Test getting payment report without token."""
        response = client.get('/api/admin/payments/report')
        
        assert response.status_code == 401
        print(f"✓ Payment report access rejected without token")


class TestAdminIntegration:
    """Integration tests for admin flow."""
    
    def test_complete_admin_flow(self, client):
        """Test complete admin user flow."""
        # 1. Register as admin
        reg_response = client.post('/api/auth/register', json={
            'email': 'integration.admin@test.com',
            'password': 'Integration@123456',
            'confirm_password': 'Integration@123456',
            'full_name': 'Integration Admin',
            'phone': '+254712345678',
            'role': 'admin'
        })
        assert reg_response.status_code == 201
        print(f"✓ Step 1: Registration successful")
        
        # 2. Login
        login_response = client.post('/api/auth/login', json={
            'email': 'integration.admin@test.com',
            'password': 'Integration@123456'
        })
        assert login_response.status_code == 200
        token = login_response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        print(f"✓ Step 2: Login successful")
        
        # 3. Get overview
        overview_response = client.get('/api/admin/overview', headers=headers)
        assert overview_response.status_code == 200
        print(f"✓ Step 3: Overview access successful")
        
        # 4. Get all tenants
        tenants_response = client.get('/api/admin/tenants', headers=headers)
        assert tenants_response.status_code == 200
        print(f"✓ Step 4: Tenants list access successful")
        
        # 5. Get tenant details
        details_response = client.get('/api/admin/tenant/1', headers=headers)
        assert details_response.status_code == 200
        print(f"✓ Step 5: Tenant details access successful")
        
        # 6. Create new tenant
        create_response = client.post('/api/admin/tenant/create',
            headers=headers,
            json={
                'full_name': 'Integration Test Tenant',
                'email': 'integration.tenant@test.com',
                'phone': '+254745678901',
                'id_number': 'INT123456',
                'room_id': 103
            }
        )
        assert create_response.status_code == 201
        print(f"✓ Step 6: Tenant created successfully")
        
        # 7. Update tenant
        update_response = client.put('/api/admin/tenant/update/1',
            headers=headers,
            json={'occupation': 'Test Occupation'}
        )
        assert update_response.status_code == 200
        print(f"✓ Step 7: Tenant updated successfully")
        
        # 8. Get contracts
        contracts_response = client.get('/api/admin/contracts', headers=headers)
        assert contracts_response.status_code == 200
        print(f"✓ Step 8: Contracts access successful")
        
        # 9. Get payment report
        report_response = client.get('/api/admin/payments/report', headers=headers)
        assert report_response.status_code == 200
        print(f"✓ Step 9: Payment report generated successfully")
        
        # 10. Get occupancy report
        occupancy_response = client.get('/api/admin/occupancy/report', headers=headers)
        assert occupancy_response.status_code == 200
        print(f"✓ Step 10: Occupancy report generated successfully")
        
        print(f"✓✓✓ Complete admin flow executed successfully!")