from flask import Blueprint, jsonify, request

# Create the tenant blueprint
tenant_bp = Blueprint('tenant_bp', __name__)

# Example: Get all tenants
@tenant_bp.route('/tenants', methods=['GET'])
def get_tenants():
    tenants = [
        {"id": 1, "name": "Alice", "room_number": "A1", "phone": "0711111111"},
        {"id": 2, "name": "Bob", "room_number": "B2", "phone": "0722222222"}
    ]
    return jsonify(tenants), 200

# Example: Add a tenant
@tenant_bp.route('/tenants', methods=['POST'])
def add_tenant():
    data = request.get_json()
    name = data.get('name')
    room_number = data.get('room_number')
    phone = data.get('phone')

    if not name or not room_number or not phone:
        return jsonify({"error": "All fields are required"}), 400

    new_tenant = {
        "id": 3,
        "name": name,
        "room_number": room_number,
        "phone": phone
    }
    return jsonify({"message": "Tenant added successfully", "tenant": new_tenant}), 201
