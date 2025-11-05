"""
Authentication Routes Module

Handles user registration, login, logout, and profile management for Joyce Suites.
Implements JWT-based authentication with role-based access control.

Supported roles: Admin, Caretaker, Tenant
"""

from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
from datetime import datetime, timedelta
from enum import Enum
import jwt
import os
import uuid
from typing import Tuple, Dict, Any, Optional

from models.base import db
from models.user import User


# Blueprint initialization
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# File upload configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
ALLOWED_PHOTO_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
ALLOWED_DOCUMENT_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


class UserRole(Enum):
    """Enumeration for user roles."""
    ADMIN = "admin"
    CARETAKER = "caretaker"
    TENANT = "tenant"


# Blacklisted tokens (in production, use Redis or database)
blacklisted_tokens = set()


class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass


def ensure_upload_folders():
    """Ensure upload directories exist."""
    folders = [
        os.path.join(UPLOAD_FOLDER, 'photos'),
        os.path.join(UPLOAD_FOLDER, 'documents')
    ]
    for folder in folders:
        if not os.path.exists(folder):
            os.makedirs(folder)


def allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


def save_file(file, folder, allowed_extensions):
    """Save uploaded file and return the path."""
    if not file or file.filename == '':
        return None

    if not allowed_file(file.filename, allowed_extensions):
        raise ValidationError(f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}")

    # Generate unique filename
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"

    # Ensure folder exists
    folder_path = os.path.join(UPLOAD_FOLDER, folder)
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    # Save file
    file_path = os.path.join(folder_path, unique_filename)
    file.save(file_path)

    # Return relative path for database storage
    return os.path.join(folder, unique_filename)


def validate_email(email: str) -> bool:
    """Validate email format."""
    import re
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    return True, None


def validate_phone(phone: str) -> bool:
    """Validate phone number format (Kenya format)."""
    import re
    pattern = r"^(\+254|0)[1-9]\d{8}$"
    return re.match(pattern, phone) is not None


def generate_jwt_token(user_id: int, role: str) -> str:
    """Generate a JWT token for authenticated user."""
    payload = {
        "user_id": user_id,
        "role": role,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token."""
    if token in blacklisted_tokens:
        raise jwt.InvalidTokenError("Token has been blacklisted")
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    return payload


def token_required(f):
    """Decorator to require valid JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"success": False, "error": "Invalid token format"}), 401
        if not token:
            return jsonify({"success": False, "error": "Token is missing"}), 401
        try:
            payload = verify_jwt_token(token)
            request.user_id = payload["user_id"]
            request.user_role = payload["role"]
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Token has expired"}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({"success": False, "error": f"Invalid token: {str(e)}"}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Decorator to require admin role."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user_role != UserRole.ADMIN.value:
            return jsonify({"success": False, "error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated


def tenant_required(f):
    """Decorator to require tenant role."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user_role != UserRole.TENANT.value:
            return jsonify({"success": False, "error": "Tenant access required"}), 403
        return f(*args, **kwargs)
    return decorated


# ==================== AUTH ROUTES ====================

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user (JSON format - for backwards compatibility)."""
    try:
        data = request.get_json()
        required_fields = ["email", "password", "confirm_password", "full_name", "phone", "role"]
        missing = [f for f in required_fields if f not in data or not data[f]]
        if missing:
            return jsonify({"success": False, "error": f"Missing fields: {', '.join(missing)}"}), 400

        email = data["email"].strip().lower()
        password = data["password"]
        confirm_password = data["confirm_password"]
        full_name = data["full_name"].strip()
        phone = data["phone"].strip()
        role = data["role"].lower()

        if not validate_email(email):
            return jsonify({"success": False, "error": "Invalid email format"}), 400

        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({"success": False, "error": "Email already registered"}), 409

        valid_pw, msg = validate_password(password)
        if not valid_pw:
            return jsonify({"success": False, "error": msg}), 400
        if password != confirm_password:
            return jsonify({"success": False, "error": "Passwords do not match"}), 400
        if not validate_phone(phone):
            return jsonify({"success": False, "error": "Invalid phone number format. Use +254XXXXXXXXX or 07XXXXXXXX"}), 400

        valid_roles = [r.value for r in UserRole]
        if role not in valid_roles:
            return jsonify({"success": False, "error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400

        # Split full name into first and last name
        name_parts = full_name.split(maxsplit=1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Generate username from email
        username = email.split('@')[0]
        # Ensure username is unique
        base_username = username
        counter = 1
        while User.query.filter_by(username=username).first():
            username = f"{base_username}{counter}"
            counter += 1

        # Generate a dummy national_id (you may want to collect this from frontend)
        import random
        national_id = random.randint(10000000, 99999999)
        while User.query.filter_by(national_id=national_id).first():
            national_id = random.randint(10000000, 99999999)

        # Create new user
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone,
            national_id=national_id,
            role=role,
            is_active=True
        )
        user.password = password  # Uses property setter to hash password

        db.session.add(user)
        db.session.commit()

        token = generate_jwt_token(user.id, role)

        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "user": {
                "user_id": user.id,
                "email": user.email,
                "full_name": f"{user.first_name} {user.last_name}",
                "phone": user.phone_number,
                "role": user.role,
                "created_at": user.created_at.isoformat() if user.created_at else None
            },
            "token": token
        }), 201
    except ValueError as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"success": False, "error": f"Registration failed: {str(e)}"}), 500


@auth_bp.route("/register-tenant", methods=["POST"])
def register_tenant():
    """Register a new tenant with file uploads (FormData format)."""
    try:
        ensure_upload_folders()

        # Get form data
        full_name = request.form.get('fullName', '').strip()
        email = request.form.get('email', '').strip().lower()
        phone = request.form.get('phone', '').strip()
        id_number = request.form.get('idNumber', '').strip()
        room_number = request.form.get('roomNumber', '').strip()
        password = request.form.get('password', '')

        # Get files
        photo = request.files.get('photo')
        id_document = request.files.get('idDocument')

        # Validate required fields
        required_fields = {
            'fullName': full_name,
            'email': email,
            'phone': phone,
            'idNumber': id_number,
            'roomNumber': room_number,
            'password': password
        }
        missing = [k for k, v in required_fields.items() if not v]
        if missing:
            return jsonify({"success": False, "error": f"Missing fields: {', '.join(missing)}"}), 400

        # Validate email
        if not validate_email(email):
            return jsonify({"success": False, "error": "Invalid email format"}), 400

        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({"success": False, "error": "Email already registered"}), 409

        # Validate password
        valid_pw, msg = validate_password(password)
        if not valid_pw:
            return jsonify({"success": False, "error": msg}), 400

        # Validate phone
        if not validate_phone(phone):
            return jsonify({"success": False, "error": "Invalid phone number format. Use +254XXXXXXXXX or 07XXXXXXXX"}), 400

        # Split full name
        name_parts = full_name.split(maxsplit=1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Generate username from email
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.query.filter_by(username=username).first():
            username = f"{base_username}{counter}"
            counter += 1

        # Convert ID number to integer
        try:
            national_id = int(id_number)
        except ValueError:
            return jsonify({"success": False, "error": "ID number must be numeric"}), 400

        # Check if national_id is unique
        if User.query.filter_by(national_id=national_id).first():
            return jsonify({"success": False, "error": "National ID already registered"}), 409

        # Handle file uploads
        photo_path = None
        id_doc_path = None

        try:
            if photo:
                photo_path = save_file(photo, 'photos', ALLOWED_PHOTO_EXTENSIONS)
            if id_document:
                id_doc_path = save_file(id_document, 'documents', ALLOWED_DOCUMENT_EXTENSIONS)
        except ValidationError as e:
            return jsonify({"success": False, "error": str(e)}), 400

        # Create new tenant user
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone,
            national_id=national_id,
            role='tenant',
            is_active=True,
            photo_path=photo_path,
            id_document_path=id_doc_path,
            room_number=room_number
        )
        user.password = password  # Uses property setter to hash password

        db.session.add(user)
        db.session.commit()

        token = generate_jwt_token(user.id, 'tenant')

        return jsonify({
            "success": True,
            "message": "Tenant registered successfully",
            "tenantId": user.id,
            "user": {
                "user_id": user.id,
                "email": user.email,
                "full_name": f"{user.first_name} {user.last_name}",
                "phone": user.phone_number,
                "role": user.role,
                "room_number": user.room_number,
                "created_at": user.created_at.isoformat() if user.created_at else None
            },
            "token": token,
            "unitData": {
                "room_number": room_number
            }
        }), 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Tenant registration error: {str(e)}")
        return jsonify({"success": False, "error": f"Registration failed: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT token."""
    try:
        data = request.get_json()
        if not data or not data.get("email") or not data.get("password"):
            return jsonify({"success": False, "error": "Email and password are required"}), 400

        email = data["email"].strip().lower()
        password = data["password"]

        user = User.query.filter_by(email=email).first()

        if not user or not user.verify_password(password):
            return jsonify({"success": False, "error": "Invalid email or password"}), 401

        if not user.is_active:
            return jsonify({"success": False, "error": "User account is inactive"}), 403

        token = generate_jwt_token(user.id, user.role)

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "user_id": user.id,
                "email": user.email,
                "full_name": f"{user.first_name} {user.last_name}",
                "role": user.role
            },
            "token": token
        }), 200
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({"success": False, "error": f"Login failed: {str(e)}"}), 500


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout():
    """Log out user by blacklisting their token."""
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.split(" ")[1] if " " in auth_header else None
        if token:
            blacklisted_tokens.add(token)
        return jsonify({"success": True, "message": "Logged out successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Logout failed: {str(e)}"}), 500


@auth_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    """Get authenticated user's profile."""
    try:
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        return jsonify({"success": True, "user": user.to_dict()}), 200
    except Exception as e:
        current_app.logger.error(f"Get profile error: {str(e)}")
        return jsonify({"success": False, "error": f"Failed to retrieve profile: {str(e)}"}), 500


@auth_bp.route("/profile/update", methods=["PUT"])
@token_required
def update_profile():
    """Update authenticated user's profile."""
    try:
        data = request.get_json()
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404

        allowed_fields = ["full_name", "phone"]

        if "full_name" in data and data["full_name"]:
            name_parts = data["full_name"].strip().split(maxsplit=1)
            user.first_name = name_parts[0]
            user.last_name = name_parts[1] if len(name_parts) > 1 else ""

        if "phone" in data and data["phone"]:
            if not validate_phone(data["phone"]):
                return jsonify({"success": False, "error": "Invalid phone number format"}), 400
            user.phone_number = data["phone"].strip()

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update profile error: {str(e)}")
        return jsonify({"success": False, "error": f"Failed to update profile: {str(e)}"}), 500


@auth_bp.route("/delete/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id: int):
    """Delete a user account (admin only)."""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        if request.user_id == user_id:
            return jsonify({"success": False, "error": "Cannot delete your own account"}), 400

        db.session.delete(user)
        db.session.commit()

        return jsonify({"success": True, "message": f"User {user_id} deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete user error: {str(e)}")
        return jsonify({"success": False, "error": f"Failed to delete user: {str(e)}"}), 500
