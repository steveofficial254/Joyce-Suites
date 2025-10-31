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
    """
    Validate email format.
    
    Args:
        email: Email address to validate
    
    Returns:
        True if valid, False otherwise
    """
    import re
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    return True, None


def validate_phone(phone: str) -> bool:
    """
    Validate phone number format (Kenya format).
    
    Args:
        phone: Phone number to validate
    
    Returns:
        True if valid, False otherwise
    """
    import re
    # Kenya phone format: +254 or 0 followed by 9-10 digits
    pattern = r"^(\+254|0)[1-9]\d{8}$"
    return re.match(pattern, phone) is not None


def generate_jwt_token(user_id: int, role: str) -> str:
    """
    Generate a JWT token for authenticated user.
    
    Args:
        user_id: User's unique identifier
        role: User's role
    
    Returns:
        Encoded JWT token
    """
    payload = {
        "user_id": user_id,
        "role": role,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode JWT token.
    
    Args:
        token: JWT token to verify
    
    Returns:
        Decoded token payload
    
    Raises:
        jwt.InvalidTokenError: If token is invalid
    """
    if token in blacklisted_tokens:
        raise jwt.InvalidTokenError("Token has been blacklisted")
    
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    return payload


def token_required(f):
    """
    Decorator to require valid JWT token.
    
    Args:
        f: Flask route function
    
    Returns:
        Wrapped function
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Extract token from Authorization header
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
    """
    Decorator to require admin role.
    
    Args:
        f: Flask route function
    
    Returns:
        Wrapped function
    """
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user_role != UserRole.ADMIN.value:
            return jsonify({
                "success": False,
                "error": "Admin access required"
            }), 403
        return f(*args, **kwargs)
    
    return decorated


# ==================== AUTH ROUTES ====================

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user (tenant, caretaker, or admin).
    
    Request body:
    {
        "email": "user@example.com",
        "password": "SecurePass123",
        "confirm_password": "SecurePass123",
        "full_name": "John Doe",
        "phone": "+254712345678",
        "role": "tenant"  # or "caretaker", "admin"
    }
    
    Returns:
        JSON response with user data or error message
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ["email", "password", "confirm_password", "full_name", "phone", "role"]
        missing = [field for field in required_fields if field not in data or not data[field]]
        if missing:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing)}"
            }), 400
        
        email = data["email"].strip().lower()
        password = data["password"]
        confirm_password = data["confirm_password"]
        full_name = data["full_name"].strip()
        phone = data["phone"].strip()
        role = data["role"].lower()
        
        # Validate email format
        if not validate_email(email):
            return jsonify({
                "success": False,
                "error": "Invalid email format"
            }), 400
        
        # Check if email already exists
        if email in users_db:
            return jsonify({
                "success": False,
                "error": "Email already registered"
            }), 409
        
        # Validate password strength
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400
        
        # Validate passwords match
        if password != confirm_password:
            return jsonify({
                "success": False,
                "error": "Passwords do not match"
            }), 400
        
        # Validate phone format
        if not validate_phone(phone):
            return jsonify({
                "success": False,
                "error": "Invalid phone number format"
            }), 400
        
        # Validate role
        valid_roles = [r.value for r in UserRole]
        if role not in valid_roles:
            return jsonify({
                "success": False,
                "error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            }), 400
        
        # Create user (in production, use SQLAlchemy)
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
        
        # Store user (mock database)
        users_db[email] = user
        
        # Generate JWT token
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
        return jsonify({
            "success": False,
            "error": f"Registration failed: {str(e)}"
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user and return JWT token.
    
    Request body:
    {
        "email": "user@example.com",
        "password": "SecurePass123"
    }
    
    Returns:
        JSON response with JWT token or error message
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get("email") or not data.get("password"):
            return jsonify({
                "success": False,
                "error": "Email and password are required"
            }), 400
        
        email = data["email"].strip().lower()
        password = data["password"]
        
        # Find user (mock database)
        user = users_db.get(email)
        
        if not user:
            return jsonify({
                "success": False,
                "error": "Invalid email or password"
            }), 401
        
        # Verify password
        if not check_password_hash(user["password_hash"], password):
            return jsonify({
                "success": False,
                "error": "Invalid email or password"
            }), 401
        
        # Check if user is active
        if not user.get("is_active", True):
            return jsonify({
                "success": False,
                "error": "User account is inactive"
            }), 403
        
        # Generate JWT token
        token = generate_jwt_token(user["user_id"], user["role"])
        
        # Update last login (in production, update in database)
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
        return jsonify({
            "success": False,
            "error": f"Login failed: {str(e)}"
        }), 500


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout():
    """
    Log out user by blacklisting their token.
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        JSON response confirming logout
    """
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.split(" ")[1] if " " in auth_header else None
        
        if token:
            # Add token to blacklist
            blacklisted_tokens.add(token)
        
        return jsonify({
            "success": True,
            "message": "Logged out successfully"
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Logout failed: {str(e)}"
        }), 500


@auth_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    """
    Get authenticated user's profile information.
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        JSON response with user profile data
    """
    try:
        # Find user by user_id from token
        user = None
        for u in users_db.values():
            if u["user_id"] == request.user_id:
                user = u
                break
        
        if not user:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        return jsonify({
            "success": True,
            "user": {
                "user_id": user["user_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "phone": user["phone"],
                "role": user["role"],
                "created_at": user["created_at"],
                "updated_at": user["updated_at"],
                "is_active": user["is_active"],
                "last_login": user.get("last_login")
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve profile: {str(e)}"
        }), 500


@auth_bp.route("/profile/update", methods=["PUT"])
@token_required
def update_profile():
    """
    Update authenticated user's profile information.
    
    Request body:
    {
        "full_name": "John Smith",
        "phone": "+254712345678"
    }
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        JSON response with updated user data
    """
    try:
        data = request.get_json()
        
        # Find user by user_id from token
        user = None
        user_email = None
        for email, u in users_db.items():
            if u["user_id"] == request.user_id:
                user = u
                user_email = email
                break
        
        if not user:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        # Update allowed fields
        allowed_fields = ["full_name", "phone"]
        updated_fields = {}
        
        for field in allowed_fields:
            if field in data and data[field]:
                value = data[field].strip()
                
                # Validate phone if provided
                if field == "phone" and not validate_phone(value):
                    return jsonify({
                        "success": False,
                        "error": "Invalid phone number format"
                    }), 400
                
                updated_fields[field] = value
        
        # Update user data
        user.update(updated_fields)
        user["updated_at"] = datetime.utcnow().isoformat()
        
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "user_id": user["user_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "phone": user["phone"],
                "role": user["role"],
                "updated_at": user["updated_at"]
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to update profile: {str(e)}"
        }), 500


@auth_bp.route("/delete/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id: int):
    """
    Delete a user account (admin only).
    
    URL parameters:
        user_id: ID of user to delete
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        JSON response confirming deletion
    """
    try:
        # Find and delete user (mock database)
        user_to_delete = None
        user_email_to_delete = None
        
        for email, u in users_db.items():
            if u["user_id"] == user_id:
                user_to_delete = u
                user_email_to_delete = email
                break
        
        if not user_to_delete:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        # Prevent self-deletion
        if request.user_id == user_id:
            return jsonify({
                "success": False,
                "error": "Cannot delete your own account"
            }), 400
        
        # Delete user from mock database
        del users_db[user_email_to_delete]
        
        return jsonify({
            "success": True,
            "message": f"User {user_id} deleted successfully"
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to delete user: {str(e)}"
        }), 500