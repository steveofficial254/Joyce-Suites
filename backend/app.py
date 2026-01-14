from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv
import os
import logging
from datetime import datetime
from logging.handlers import RotatingFileHandler

# Import blueprints
from routes.auth_routes import auth_bp
from routes.tenant_routes import tenant_bp
from routes.admin_routes import admin_bp
from routes.caretaker_routes import caretaker_bp
from routes.mpesa_routes import mpesa_bp, payment_bp

# Import configuration and database
from config import Config
from models.base import db

# Import all models so db.create_all() knows about them
from models.user import User
from models.payment import Payment
from models.lease import Lease
from models.maintenance import MaintenanceRequest
from models.vacate_notice import VacateNotice
from models.bill import Bill
from models.message import Message
from models.notification import Notification
from models.property import Property
from models.property_image import PropertyImage
from models.reset_password import ResetPassword

# Load environment variables
load_dotenv()


def create_app():
    """Application factory for Joyce Suites backend."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    Migrate(app, db)
    
    # CORS configuration
    cors_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",

        # Vercel production
        "https://joyce-suites.vercel.app",

        # Preview deployments (optional)
        "https://joyce-suites-jcfw.vercel.app",
        "https://joyce-suites-git-main-steves-projects-d95e3bef.vercel.app",
        "https://joyce-suites-git-feature-backend-steves-projects-d95e3bef.vercel.app",
        "https://joyce-suites-ptgu4rwra-steves-projects-d95e3bef.vercel.app",
    ]
    
    CORS(app, 
         resources={
             r"/api/*": {
                 "origins": cors_origins,
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                 "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
                 "expose_headers": ["Content-Type", "Authorization"],
                 "supports_credentials": True,
                 "max_age": 3600
             }
         })
    
    # Rate limiting
    is_development = os.getenv("FLASK_ENV", "development") == "development"
    
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["1000 per day", "200 per hour"] if is_development else ["200 per day", "50 per hour"],
        storage_uri="memory://",
        default_limits_exempt_when=lambda: request.method == "OPTIONS"
    )
    app.limiter = limiter
    
    # CSRF Protection
    csrf = CSRFProtect(app)
    csrf.exempt(auth_bp)
    csrf.exempt(tenant_bp)
    csrf.exempt(admin_bp)
    csrf.exempt(caretaker_bp)
    csrf.exempt(mpesa_bp)
    csrf.exempt(payment_bp)

    configure_logging(app)
    register_blueprints(app)
    register_error_handlers(app)
    register_cli_commands(app)
    register_request_logging(app)

    app.logger.info("Application initialized")

    return app


def register_blueprints(app: Flask) -> None:
    """Register all blueprints with the app."""
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(caretaker_bp, url_prefix="/api/caretaker")
    app.register_blueprint(tenant_bp, url_prefix="/api/tenant")
    app.register_blueprint(mpesa_bp, url_prefix="/api/mpesa")
    app.register_blueprint(payment_bp, url_prefix="/api/payments")

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "service": "Joyce Suites API",
            "status": "running",
            "environment": os.getenv("FLASK_ENV", "development"),
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat()
        }), 200

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "success": True,
            "status": "healthy",
            "service": "Joyce Suites API",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat()
        }), 200

    @app.route("/api/status", methods=["GET"])
    def get_status():
        return jsonify({
            "success": True,
            "status": "operational",
            "service": "Joyce Suites Apartment Management System",
            "version": "1.0.0",
            "environment": os.getenv("FLASK_ENV", "development"),
            "database": "Connected" if check_db_connection(app) else "Disconnected",
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    
    @app.route("/api/test-cors", methods=["GET", "OPTIONS"])
    def test_cors():
        return jsonify({
            "success": True,
            "message": "CORS is working correctly!",
            "origin": request.headers.get("Origin"),
            "method": request.method,
            "timestamp": datetime.utcnow().isoformat()
        }), 200


def register_error_handlers(app: Flask) -> None:
    """Register common HTTP error handlers."""
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"success": False, "error": "Unauthorized", "message": "Missing or invalid credentials"}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"success": False, "error": "Forbidden", "message": "You do not have permission"}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "error": "Not Found", "message": "The requested resource was not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"success": False, "error": "Method Not Allowed", "message": "Unsupported HTTP method"}), 405
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        return jsonify({
            "success": False, 
            "error": "Too Many Requests", 
            "message": "Rate limit exceeded. Please try again later."
        }), 429

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {str(error)}")
        return jsonify({"success": False, "error": "Internal Server Error", "message": "An unexpected error occurred"}), 500


def register_cli_commands(app: Flask) -> None:
    """Register CLI commands for DB management."""
    @app.cli.command("init-db")
    def init_db():
        if os.getenv("FLASK_ENV") == "production":
            print("Cannot run init-db in production. Use 'flask db upgrade' instead.")
            return
        with app.app_context():
            db.create_all()
        print("Database initialized successfully.")

    @app.cli.command("drop-db")
    def drop_db():
        if os.getenv("FLASK_ENV") == "production":
            print("Cannot run drop-db in production!")
            return
        confirm = input("Are you sure you want to drop all tables? (y/n): ")
        if confirm.lower() == "y":
            with app.app_context():
                db.drop_all()
            print("All tables dropped.")
        else:
            print("Operation canceled.")

    @app.cli.command("seed-db")
    def seed_db():
        if os.getenv("FLASK_ENV") == "production":
            print("Cannot seed database in production!")
            return
            
        import uuid

        with app.app_context():
            if User.query.first():
                print("Database already seeded.")
                return

            admin = User(
                email="admin@joycesuites.com",
                username=f"admin_{str(uuid.uuid4())[:8]}",
                first_name="Admin",
                last_name="User",
                phone_number="0722870077",
                role="admin",
                national_id=10000000,
                is_active=True
            )
            admin.password = "Admin@123456"
            
            caretaker = User(
                email="caretaker@joycesuites.com",
                username=f"caretaker_{str(uuid.uuid4())[:8]}",
                first_name="Caretaker",
                last_name="User",
                phone_number="0722870078",
                role="caretaker",
                national_id=10000001,
                is_active=True
            )
            caretaker.password = "Caretaker@123456"
            
            tenant = User(
                email="tenant@joycesuites.com",
                username=f"tenant_{str(uuid.uuid4())[:8]}",
                first_name="Sample",
                last_name="Tenant",
                phone_number="0722870079",
                role="tenant",
                national_id=10000002,
                is_active=True
            )
            tenant.password = "Tenant@123456"
            
            db.session.add_all([admin, caretaker, tenant])
            db.session.commit()
            print("Seeded admin, caretaker, and tenant users.")


def configure_logging(app: Flask) -> None:
    """Configure rotating log file output."""
    if not os.path.exists("logs"):
        os.makedirs("logs")

    handler = RotatingFileHandler(
        "logs/joyce_suites.log", maxBytes=10 * 1024 * 1024, backupCount=10
    )
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    handler.setLevel(logging.INFO)

    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info(f"Joyce Suites API started - Env: {os.getenv('FLASK_ENV', 'development')}")


def check_db_connection(app: Flask) -> bool:
    """Check if the database connection is working."""
    try:
        with app.app_context():
            db.session.execute("SELECT 1")
        return True
    except Exception:
        return False


def register_request_logging(app: Flask) -> None:
    """Log all incoming requests."""
    @app.before_request
    def log_request_info():
        if request.method != "OPTIONS":
            app.logger.info(
                f"{request.method} {request.path} | "
                f"IP: {request.remote_addr} | "
                f"User-Agent: {request.headers.get('User-Agent', 'Unknown')[:50]}"
            )


# Expose app globally for Gunicorn / Render
app = create_app()


if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"

    with app.app_context():
        try:
            if check_db_connection(app):
                app.logger.info("Database connection verified")
            else:
                app.logger.error("Database connection failed")
        except Exception as e:
            app.logger.error(f"Database verification failed: {e}")

    print(f"\nJoyce Suites API running on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug, use_reloader=debug)