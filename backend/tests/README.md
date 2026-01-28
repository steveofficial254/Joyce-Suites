# Water Bill System Tests

This directory contains comprehensive tests for the Joyce Suites Water Bill Management System.

## 🧪 Test Coverage

### Model Tests (`TestWaterBillModel`)
- ✅ Water bill creation and validation
- ✅ Amount calculation and consumption tracking
- ✅ Payment processing (partial and full payments)
- ✅ Overdue status detection
- ✅ Notification timing logic
- ✅ Negative consumption prevention
- ✅ Edge cases (zero readings, high consumption)

### API Endpoint Tests (`TestWaterBillEndpoints`)
- ✅ Caretaker water reading recording
- ✅ Tenant list retrieval for readings
- ✅ Payment marking functionality
- ✅ Notification sending
- ✅ Summary statistics
- ✅ Input validation and error handling

### Admin Endpoint Tests (`TestAdminWaterBillEndpoints`)
- ✅ Admin water bill listing and filtering
- ✅ Water bill details retrieval
- ✅ Water bill updates (admin override)
- ✅ Water bill deletion
- ✅ Comprehensive admin summaries
- ✅ CSV export functionality

### Edge Case Tests (`TestWaterBillEdgeCases`)
- ✅ Zero consumption scenarios
- ✅ Very high consumption handling
- ✅ Overpayment scenarios
- ✅ Invalid ID handling
- ✅ Unauthorized access prevention

### Notification Tests (`TestWaterBillNotifications`)
- ✅ 5th day notification creation
- ✅ Overdue notification creation
- ✅ Notification timing logic
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
# Run all water bill tests
python run_water_bill_tests.py

# Run with verbose output
python run_water_bill_tests.py --verbose

# Run specific test class
python run_water_bill_tests.py --class TestWaterBillModel

# Run specific test method
python run_water_bill_tests.py --class TestWaterBillModel --method test_water_bill_creation
```

### Using Pytest Directly
```bash
# Run all tests
pytest tests/test_water_bill.py -v

# Run with coverage
pytest tests/test_water_bill.py --cov=models.water_bill --cov=routes.rent_deposit --cov=routes.admin_routes

# Run specific tests
pytest tests/test_water_bill.py::TestWaterBillModel::test_water_bill_creation -v

# Generate HTML coverage report
pytest tests/test_water_bill.py --cov=models.water_bill --cov-report=html
```

## 📊 Test Categories

### 1. Model Layer Tests
**Purpose**: Verify WaterBill model business logic
- Data validation
- Calculations (consumption, amounts, balances)
- Status transitions
- Notification timing

### 2. API Layer Tests
**Purpose**: Verify HTTP endpoints work correctly
- Request/response validation
- Authentication and authorization
- Error handling
- Data serialization

### 3. Integration Tests
**Purpose**: Verify end-to-end workflows
- Caretaker reading → Bill creation → Tenant notification
- Payment processing → Status updates
- Admin oversight and reporting

### 4. Edge Case Tests
**Purpose**: Verify robustness
- Invalid inputs
- Boundary conditions
- Error scenarios
- Security checks

## 🔧 Test Fixtures

The test suite uses pytest fixtures for consistent test data:

### User Fixtures
- `tenant_user`: Test tenant account
- `caretaker_user`: Test caretaker account  
- `admin_user`: Test admin account

### Data Fixtures
- `property_obj`: Test property
- `lease_obj`: Test lease agreement
- `water_bill_obj`: Test water bill

### Authentication Fixtures
- `tenant_headers`: JWT headers for tenant
- `caretaker_headers`: JWT headers for caretaker
- `admin_headers`: JWT headers for admin

## 📝 Test Data Examples

### Water Reading Input
```json
{
    "month": 1,
    "year": 2024,
    "unit_rate": 50.0,
    "readings": [
        {
            "tenant_id": 1,
            "current_reading": 150.0,
            "previous_reading": 100.0
        }
    ]
}
```

### Payment Input
```json
{
    "bill_id": 1,
    "amount_paid": 1000.0,
    "payment_method": "M-Pesa",
    "payment_reference": "ABC123",
    "notes": "Partial payment"
}
```

## 🎯 Test Scenarios Covered

### Happy Path Scenarios
1. **Caretaker records readings** → Bills created automatically
2. **Tenant views dashboard** → Sees water bill amounts
3. **5th day arrives** → Automatic notifications sent
4. **Tenant pays bill** → Status updated to paid
5. **Admin views reports** → Comprehensive analytics

### Edge Cases
1. **Negative consumption** → Prevented by system
2. **Zero readings** → Handled gracefully
3. **Overpayment** → Capped at amount due
4. **Invalid bill IDs** → Proper error responses
5. **Unauthorized access** → Properly blocked

### Error Scenarios
1. **Missing required fields** → Validation errors
2. **Invalid dates** → Handled appropriately
3. **Database errors** → Proper rollback
4. **Network issues** → Timeouts and retries

## 📈 Coverage Reports

Generate detailed coverage reports:

```bash
# Terminal coverage
pytest tests/test_water_bill.py --cov=models.water_bill --cov-report=term-missing

# HTML coverage report
pytest tests/test_water_bill.py --cov=models.water_bill --cov-report=html

# Open HTML report
open htmlcov/index.html
```

## 🐛 Debugging Tests

### Running Individual Tests
```bash
# Run with debugging
pytest tests/test_water_bill.py::TestWaterBillModel::test_water_bill_creation -v -s

# Run with Python debugger
pytest tests/test_water_bill.py::TestWaterBillModel::test_water_bill_creation --pdb
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
- name: Run Water Bill Tests
  run: |
    cd backend
    pip install -r test-requirements.txt
    python run_water_bill_tests.py --verbose
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

Run `python run_water_bill_tests.py --help` for more options.
