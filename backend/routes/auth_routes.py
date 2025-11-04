"""
Authentication Routes Module

Handles user registration, login, logout, and profile management for Joyce Suites.
Implements JWT-based authentication with role-based access control.

Supported roles: Admin, Caretaker, Tenant
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, timedelta
from enum import Enum
import jwt
import os
from typing import Tuple, Dict, Any, Optional


# Blueprint initialization
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


class UserRole(Enum):
    """Enumeration for user roles."""
    ADMIN = "admin"
    CARETAKER = "caretaker"
    TENANT = "tenant"


# Mock database (replace with SQLAlchemy models in production)
users_db = {}
blacklisted_tokens = set()


class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass


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


# ==================== AUTH ROUTES ====================

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user."""
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
        if email in users_db:
            return jsonify({"success": False, "error": "Email already registered"}), 409

        valid_pw, msg = validate_password(password)
        if not valid_pw:
            return jsonify({"success": False, "error": msg}), 400
        if password != confirm_password:
            return jsonify({"success": False, "error": "Passwords do not match"}), 400
        if not validate_phone(phone):
            return jsonify({"success": False, "error": "Invalid phone number format"}), 400

        valid_roles = [r.value for r in UserRole]
        if role not in valid_roles:
            return jsonify({"success": False, "error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400

        user_id = len(users_db) + 1
        user = {
            "user_id": user_id,
            "email": email,
            "password_hash": generate_password_hash(password),
            "full_name": full_name,
            "phone": phone,
            "role": role,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "is_active": True
        }
        users_db[email] = user
        token = generate_jwt_token(user_id, role)

        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "user": {
                "user_id": user["user_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "phone": user["phone"],
                "role": user["role"],
                "created_at": user["created_at"]
            },
            "token": token
        }), 201
    except Exception as e:
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
        user = users_db.get(email)
        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"success": False, "error": "Invalid email or password"}), 401
        if not user.get("is_active", True):
            return jsonify({"success": False, "error": "User account is inactive"}), 403

        token = generate_jwt_token(user["user_id"], user["role"])
        user["last_login"] = datetime.utcnow().isoformat()

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "user_id": user["user_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"]
            },
            "token": token
        }), 200
    except Exception as e:
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
        user = next((u for u in users_db.values() if u["user_id"] == request.user_id), None)
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        return jsonify({"success": True, "user": user}), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to retrieve profile: {str(e)}"}), 500


@auth_bp.route("/profile/update", methods=["PUT"])
@token_required
def update_profile():
    """Update authenticated user's profile."""
    try:
        data = request.get_json()
        user_email, user = next(((email, u) for email, u in users_db.items() if u["user_id"] == request.user_id), (None, None))
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404

        allowed_fields = ["full_name", "phone"]
        for field in allowed_fields:
            if field in data and data[field]:
                if field == "phone" and not validate_phone(data[field]):
                    return jsonify({"success": False, "error": "Invalid phone number format"}), 400
                user[field] = data[field].strip()
        user["updated_at"] = datetime.utcnow().isoformat()
        return jsonify({"success": True, "message": "Profile updated successfully", "user": user}), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to update profile: {str(e)}"}), 500


@auth_bp.route("/delete/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id: int):
    """Delete a user account (admin only)."""
    try:
        user_email_to_delete = next((email for email, u in users_db.items() if u["user_id"] == user_id), None)
        if not user_email_to_delete:
            return jsonify({"success": False, "error": "User not found"}), 404
        if request.user_id == user_id:
            return jsonify({"success": False, "error": "Cannot delete your own account"}), 400
        del users_db[user_email_to_delete]
        return jsonify({"success": True, "message": f"User {user_id} deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to delete user: {str(e)}"}), 500
