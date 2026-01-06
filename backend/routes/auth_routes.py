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
from typing import Tuple, Dict, Any, Optional

from models.base import db
from models.user import User

# Blueprint initialization
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Configuration
# In production, these should be strictly from environment variables
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

class UserRole(Enum):
    """Enumeration for user roles."""
    ADMIN = "admin"
    CARETAKER = "caretaker"
    TENANT = "tenant"
    LANDLORD = "landlord"

# In-memory blacklist for tokens (Note: In a multi-worker production env, use Redis)
blacklisted_tokens = set()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
    # Kenya phone format: +254 or 0 followed by 9-10 digits
    pattern = r"^(\+254|0)[1-9]\d{8}$"
    return re.match(pattern, phone) is not None

def generate_jwt_token(user_id: int, role: str) -> str:
    """Generate a JWT token for authenticated user."""
    # Get secret from app config
    jwt_secret = current_app.config.get('JWT_SECRET') or os.getenv("JWT_SECRET", "dev-secret-key")
    
    payload = {
        "user_id": user_id,
        "role": role,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, jwt_secret, algorithm=JWT_ALGORITHM)
    return token

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token."""
    if token in blacklisted_tokens:
        raise jwt.InvalidTokenError("Token has been blacklisted")
    
    jwt_secret = current_app.config.get('JWT_SECRET') or os.getenv("JWT_SECRET", "dev-secret-key")
    payload = jwt.decode(token, jwt_secret, algorithms=[JWT_ALGORITHM])
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
    Handles both JSON and FormData (multipart/form-data with file uploads).
    """
    # Rate limiting is applied globally via app.limiter
    # Additional endpoint-specific limit
    limiter = getattr(current_app, 'limiter', None)
    if limiter:
        # 5 registrations per hour per IP
        limiter.limit("5 per hour")(lambda: None)()
    
    try:
        # Handle FormData (multipart/form-data)
        if request.form:
            data = request.form.to_dict()
        else:
            # Fallback to JSON
            data = request.get_json()
        
        print(f"[DEBUG] Received registration data keys: {list(data.keys())}")  # Debug log
        
        # Extract file uploads if present
        photo = request.files.get('photo')
        id_document = request.files.get('idDocument') or request.files.get('id_document')
        
        # Handle full_name or fullName
        full_name = data.get("full_name") or data.get("fullName")
        if not full_name or not full_name.strip():
            return jsonify({
                "success": False,
                "error": "Full name is required"
            }), 400
        
        # Handle id_number or idNumber
        id_number = data.get("id_number") or data.get("idNumber")
        if not id_number:
            print(f"[ERROR] ID number is missing. Available keys: {list(data.keys())}")
            return jsonify({
                "success": False,
                "error": "National ID is required"
            }), 400
        
        # Handle room_number or roomNumber
        room_number = data.get("room_number") or data.get("roomNumber")
        
        # Validate other required fields
        required_fields = ["email", "password", "phone", "role"]
        missing = [field for field in required_fields if field not in data or not data[field]]
        if missing:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing)}"
            }), 400
        
        email = data["email"].strip().lower()
        password = data["password"]
        phone = data["phone"].strip()
        role = data["role"].lower()
        
        print(f"[DEBUG] Processing registration - Email: {email}, ID: {id_number}, Room: {room_number}")
        
        # Validate email format
        if not validate_email(email):
            return jsonify({"success": False, "error": "Invalid email format"}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return jsonify({"success": False, "error": "Email already registered"}), 409
        
        # Validate password strength
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return jsonify({"success": False, "error": error_msg}), 400
        
        # Validate phone format
        if not validate_phone(phone):
            return jsonify({"success": False, "error": "Invalid phone number format"}), 400
        
        # Validate role
        valid_roles = [r.value for r in UserRole]
        if role not in valid_roles:
            return jsonify({
                "success": False,
                "error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            }), 400

        # Validate and convert national ID to integer
        try:
            id_number = int(id_number)
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "National ID must be a valid number"}), 400

        # Handle file uploads
        photo_path = None
        id_document_path = None
        
        upload_folder = os.path.join(current_app.root_path, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        if photo and allowed_file(photo.filename):
            filename = secure_filename(f"{email}_photo_{photo.filename}")
            photo_save_path = os.path.join(upload_folder, 'photos')
            os.makedirs(photo_save_path, exist_ok=True)
            photo.save(os.path.join(photo_save_path, filename))
            photo_path = f"uploads/photos/{filename}"
            print(f"[DEBUG] Photo saved: {photo_path}")
            
        if id_document and allowed_file(id_document.filename):
            filename = secure_filename(f"{email}_doc_{id_document.filename}")
            doc_save_path = os.path.join(upload_folder, 'documents')
            os.makedirs(doc_save_path, exist_ok=True)
            id_document.save(os.path.join(doc_save_path, filename))
            id_document_path = f"uploads/documents/{filename}"
            print(f"[DEBUG] ID document saved: {id_document_path}")

        # Split full name into first and last name
        names = full_name.split(' ', 1)
        first_name = names[0]
        last_name = names[1] if len(names) > 1 else ""
        
        # Auto-generate username from email (required by model but not exposed to user)
        import uuid
        username = f"{email.split('@')[0]}_{str(uuid.uuid4())[:8]}"

        new_user = User(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone,
            role=role,
            national_id=id_number,
            room_number=room_number,
            photo_path=photo_path,
            id_document_path=id_document_path,
            is_active=True
        )
        new_user.password = password  # Use property setter
        
        db.session.add(new_user)
        db.session.commit()
        
        print(f"[SUCCESS] User registered: ID={new_user.id}, Email={email}, Room={room_number}")
        
        # Generate JWT token
        token = generate_jwt_token(new_user.id, role)
        
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "user": {
                "user_id": new_user.id,
                "email": new_user.email,
                "full_name": new_user.full_name,
                "phone": new_user.phone_number,
                "role": new_user.role,
                "room_number": new_user.room_number,
                "created_at": new_user.created_at.isoformat() if new_user.created_at else None
            },
            "token": token
        }), 201
    
    except Exception as e:
        db.session.rollback()
        # Log the error for debugging
        print(f"[ERROR] Registration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Registration failed: {str(e)}"
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT token."""
    # Rate limiting temporarily disabled for debugging
    # from flask import current_app
    # limiter = getattr(current_app, 'limiter', None)
    # if limiter:
    #     limiter.limit("5 per minute")(lambda: None)()
    
    try:
        data = request.get_json()
        
        if not data or not data.get("email") or not data.get("password"):
            return jsonify({"success": False, "error": "Email and password are required"}), 400
        
        email = data["email"].strip().lower()
        password = data["password"]
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.verify_password(password):  # Use verify_password
            return jsonify({"success": False, "error": "Invalid email or password"}), 401
        
        if not user.is_active:
            return jsonify({"success": False, "error": "User account is inactive"}), 403
        
        # Generate JWT token
        token = generate_jwt_token(user.id, user.role)
        
        # Update last login (optional, if model supports it)
        # user.last_login = datetime.utcnow()
        # db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "user_id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role
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
    """Get authenticated user's profile information."""
    try:
        user = User.query.get(request.user_id)
        
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        return jsonify({
            "success": True,
            "user": {
                "user_id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone_number,
                "role": user.role,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "is_active": user.is_active,
                "room_number": user.room_number,
                "photo_path": user.photo_path,
                "national_id": user.national_id,
                "id_number": user.national_id
            }
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to retrieve profile: {str(e)}"}), 500


@auth_bp.route("/profile/update", methods=["PUT"])
@token_required
def update_profile():
    """Update authenticated user's profile information."""
    try:
        data = request.get_json()
        user = User.query.get(request.user_id)
        
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        if "full_name" in data:
            names = data["full_name"].strip().split(' ', 1)
            user.first_name = names[0]
            user.last_name = names[1] if len(names) > 1 else ""
            
        if "phone" in data:
            phone = data["phone"].strip()
            if not validate_phone(phone):
                return jsonify({"success": False, "error": "Invalid phone number format"}), 400
            user.phone_number = phone
            
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "user_id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone_number,
                "role": user.role,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Failed to update profile: {str(e)}"}), 500


@auth_bp.route("/rooms/available", methods=["GET"])
def get_available_rooms():
    """
    Get all available rooms for tenant registration.
    This is a public endpoint that doesn't require authentication.
    """
    try:
        # Import Property model here to avoid circular imports
        from models.property import Property
        
        # Get only vacant rooms
        vacant_rooms = Property.query.filter_by(status='vacant').all()
        
        rooms_data = []
        for room in vacant_rooms:
            # Get landlord info if available
            landlord_name = "Unknown"
            if room.landlord:
                landlord_name = f"{room.landlord.first_name} {room.landlord.last_name}"
            
            # Extract room number from name (e.g., "Room 1" -> "1")
            room_number = ""
            if room.name:
                import re
                match = re.search(r'\d+', room.name)
                if match:
                    room_number = match.group()
            
            rooms_data.append({
                "id": room.id,
                "name": room.name,
                "room_number": room_number,
                "property_type": room.property_type,
                "rent_amount": float(room.rent_amount) if room.rent_amount else 0.0,
                "deposit_amount": float(room.deposit_amount) if room.deposit_amount else 0.0,
                "description": room.description,
                "paybill_number": room.paybill_number,
                "account_number": room.account_number,
                "landlord_name": landlord_name,
                "status": room.status
            })
        
        return jsonify({
            "success": True,
            "count": len(rooms_data),
            "rooms": rooms_data
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error fetching available rooms: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to fetch available rooms: {str(e)}"
        }), 500

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
        return jsonify({"success": False, "error": f"Failed to delete user: {str(e)}"}), 500