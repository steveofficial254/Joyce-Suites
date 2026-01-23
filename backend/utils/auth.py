from functools import wraps
from flask import request, jsonify
from routes.auth_routes import token_required


def role_required(allowed_roles):
    """Decorator to require specific user roles."""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if request.user_role not in allowed_roles:
                return jsonify({
                    'error': f'Access denied. Required roles: {", ".join(allowed_roles)}'
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
