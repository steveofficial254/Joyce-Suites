from flask import Blueprint, request, jsonify

# Create the blueprint
auth_bp = Blueprint('auth_bp', __name__)

# Example route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Example logic
    if email == "admin@example.com" and password == "password123":
        return jsonify({"message": "Login successful!"}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    # Example logic
    if not all([name, email, password]):
        return jsonify({"error": "All fields are required"}), 400

    return jsonify({"message": f"User {name} registered successfully!"}), 201
