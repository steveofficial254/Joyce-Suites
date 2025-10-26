from flask import Blueprint, jsonify, request

# Create the caretaker blueprint
caretaker_bp = Blueprint('caretaker_bp', __name__)

# Example route: get all caretakers
@caretaker_bp.route('/caretakers', methods=['GET'])
def get_caretakers():
    caretakers = [
        {"id": 1, "name": "John Doe", "phone": "0712345678"},
        {"id": 2, "name": "Jane Smith", "phone": "0723456789"}
    ]
    return jsonify(caretakers), 200

# Example route: add a caretaker
@caretaker_bp.route('/caretakers', methods=['POST'])
def add_caretaker():
    data = request.get_json()
    name = data.get('name')
    phone = data.get('phone')

    if not name or not phone:
        return jsonify({"error": "Name and phone are required"}), 400

    new_caretaker = {"id": 3, "name": name, "phone": phone}
    return jsonify({"message": "Caretaker added successfully", "caretaker": new_caretaker}), 201
