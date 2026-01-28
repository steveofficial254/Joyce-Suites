# Deposit System Tests

This directory contains comprehensive tests for the Joyce Suites Deposit Management System.

## 💰 Test Coverage

### Model Tests (`TestDepositRecordModel`)
- ✅ Deposit record creation and validation
- ✅ Payment processing (partial and full payments)
- ✅ Refund processing (partial and full refunds)
- ✅ Status transitions (unpaid → paid → refunded)
- ✅ Notification tracking and management
- ✅ Balance calculations and edge cases
- ✅ Zero amount scenarios

### API Tests (`TestDepositEndpoints`)
- ✅ Caretaker tenant listing for deposits
- ✅ Deposit payment marking with details
- ✅ Quick status updates (paid/unpaid)
- ✅ Summary statistics and reporting
- ✅ Input validation and error handling
- ✅ Notification sending integration

### Admin Tests (`TestAdminDepositEndpoints`)
- ✅ Admin deposit listing and filtering
- ✅ Deposit details retrieval
- ✅ Deposit updates (admin override)
- ✅ Deposit deletion
- ✅ Refund processing
- ✅ Comprehensive admin summaries
- ✅ CSV export functionality

### Tenant Tests (`TestTenantDepositEndpoints`)
- ✅ Tenant deposit status viewing
- ✅ Payment and refund history
- ✅ Real-time status updates
- ✅ No active lease handling

### Edge Case Tests (`TestDepositEdgeCases`)
- ✅ Zero deposit amounts
- ✅ Overpayment scenarios
- ✅ Invalid ID handling
- ✅ Unauthorized access prevention
- ✅ Invalid status updates

### Notification Tests (`TestDepositNotifications`)
- ✅ Payment confirmation notifications
- ✅ Refund processing notifications
- ✅ Status update notifications
- ✅ Duplicate notification prevention

## 🚀 Running Tests

### Prerequisites
```bash
# Install test dependencies
pip install -r test-requirements.txt

# Ensure you're in the backend directory
cd /path/to/Joyce-Suites/backend
```

### Quick Start
```bash
# Run all deposit tests
python run_deposit_tests.py

# Run with verbose output
python run_deposit_tests.py --verbose

# Run specific test class
python run_deposit_tests.py --class TestDepositRecordModel

# Run specific test method
python run_deposit_tests.py --class TestDepositRecordModel --method test_deposit_record_creation
```

### Using Pytest Directly
```bash
# Run all tests
pytest tests/test_deposit.py -v

# Run with coverage
pytest tests/test_deposit.py --cov=models.rent_deposit --cov=routes.rent_deposit --cov=routes.admin_routes --cov=routes.tenant_routes

# Run specific tests
pytest tests/test_deposit.py::TestDepositRecordModel::test_deposit_record_creation -v

# Generate HTML coverage report
pytest tests/test_deposit.py --cov=models.rent_deposit --cov-report=html
```

## 📊 Test Categories

### 1. Model Layer Tests
**Purpose**: Verify DepositRecord model business logic
- Data validation and calculations
- Status transitions and balance tracking
- Payment and refund processing
- Notification timing and tracking

### 2. API Layer Tests
**Purpose**: Verify HTTP endpoints work correctly
- Request/response validation
- Authentication and authorization
- Error handling and edge cases
- Data serialization

### 3. Integration Tests
**Purpose**: Verify end-to-end workflows
- Caretaker payment → Tenant notification
- Admin refund → Tenant notification
- Status updates across all dashboards

### 4. Edge Case Tests
**Purpose**: Verify robustness
- Invalid inputs and boundary conditions
- Error scenarios and recovery
- Security checks and access control

## 🔧 Test Fixtures

The test suite uses pytest fixtures for consistent test data:

### User Fixtures
- `tenant_user`: Test tenant account
- `caretaker_user`: Test caretaker account  
- `admin_user`: Test admin account

### Data Fixtures
- `property_obj`: Test property
- `lease_obj`: Test lease agreement
- `deposit_record_obj`: Test deposit record

### Authentication Fixtures
- `tenant_headers`: JWT headers for tenant
- `caretaker_headers`: JWT headers for caretaker
- `admin_headers`: JWT headers for admin

## 📝 Test Data Examples

### Deposit Payment Input
```json
{
    "deposit_id": 1,
    "amount_paid": 5400.0,
    "payment_method": "M-Pesa",
    "payment_reference": "DEP123",
    "notes": "Full deposit payment",
    "send_notification": true
}
```

### Status Update Input
```json
{
    "deposit_id": 1,
    "status": "paid",
    "amount_paid": 5400.0,
    "payment_method": "Cash",
    "send_notification": true
}
```

### Refund Processing Input
```json
{
    "deposit_id": 1,
    "refund_amount": 2700.0,
    "refund_method": "Bank Transfer",
    "refund_reference": "REF123",
    "refund_notes": "Partial refund",
    "send_notification": true
}
```

## 🎯 Test Scenarios Covered

### Happy Path Scenarios
1. **Caretaker marks paid** → Status updates → Tenant notified
2. **Admin processes refund** → Status updates → Tenant notified
3. **Tenant checks dashboard** → Sees real-time deposit status
4. **Admin views reports** → Comprehensive analytics

### Edge Cases
1. **Zero deposit amounts** → Handled gracefully
2. **Overpayments** → Capped at required amount
3. **Invalid deposit IDs** → Proper error responses
4. **Unauthorized access** → Properly blocked

### Error Scenarios
1. **Missing required fields** → Validation errors
2. **Invalid status values** → Proper error handling
3. **Database errors** → Proper rollback
4. **Network issues** → Timeouts and retries

## 📈 Coverage Reports

Generate detailed coverage reports:

```bash
# Terminal coverage
pytest tests/test_deposit.py --cov=models.rent_deposit --cov-report=term-missing

# HTML coverage report
pytest tests/test_deposit.py --cov=models.rent_deposit --cov-report=html

# Open HTML report
open htmlcov/index.html
```

## 🐛 Debugging Tests

### Running Individual Tests
```bash
# Run with debugging
pytest tests/test_deposit.py::TestDepositRecordModel::test_deposit_record_creation -v -s

# Run with Python debugger
pytest tests/test_deposit.py::TestDepositRecordModel::test_deposit_record_creation --pdb
```

### Common Issues
1. **Import errors**: Ensure PYTHONPATH includes backend directory
2. **Database errors**: Check SQLite permissions and disk space
3. **Authentication failures**: Verify JWT token generation
4. **Timeout errors**: Increase test timeouts if needed

## 🔄 Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Deposit Tests
  run: |
    cd backend
    pip install -r test-requirements.txt
    python run_deposit_tests.py --verbose
```

## 📚 Test Documentation

Each test method includes:
- **Purpose**: What the test verifies
- **Setup**: Required test data
- **Execution**: Steps performed
- **Assertions**: Expected outcomes
- **Edge Cases**: Boundary conditions tested

## 🎉 Success Criteria

A successful test run should show:
- ✅ All tests pass (0 failures)
- ✅ High code coverage (>90%)
- ✅ All edge cases covered
- ✅ No security vulnerabilities
- ✅ Performance within acceptable limits

## 📞 Support

For test-related issues:
1. Check the test output for specific error messages
2. Verify all dependencies are installed
3. Ensure database permissions are correct
4. Review test fixtures for data consistency

Run `python run_deposit_tests.py --help` for more options.

## 🔄 Integration with Other Tests

The deposit tests integrate with:
- **Water Bill Tests**: Shared payment processing patterns
- **Auth Tests**: Shared authentication fixtures
- **Notification Tests**: Shared notification system

Run all tests together:
```bash
python run_all_tests.py  # If available
pytest tests/ -v  # Run all test files
```
