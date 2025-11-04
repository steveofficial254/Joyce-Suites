from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
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

# Load environment variables
load_dotenv()


def create_app():
    """Application factory for Joyce Suites backend."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    Migrate(app, db)
    CORS(app, resources={
        r"/api/*": {
            "origins": os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    configure_logging(app)
    register_blueprints(app)
    register_error_handlers(app)
    register_cli_commands(app)

    # Automatically create database tables (for development only)
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("✅ Database tables created successfully.")
        except Exception as e:
            app.logger.error(f"❌ Error creating database tables: {e}")

    return app


def register_blueprints(app: Flask) -> None:
    """Register all blueprints with the app."""
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(caretaker_bp, url_prefix="/api/caretaker")
    app.register_blueprint(tenant_bp, url_prefix="/api/tenant")
    app.register_blueprint(mpesa_bp, url_prefix="/api/mpesa")
    app.register_blueprint(payment_bp, url_prefix="/api/payments")

    # Health endpoints
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


def register_error_handlers(app: Flask) -> None:
    """Register common HTTP error handlers."""
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": str(error)
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            "success": False,
            "error": "Unauthorized",
            "message": "Missing or invalid credentials"
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You do not have permission to access this resource"
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "The requested resource was not found"
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "success": False,
            "error": "Method Not Allowed",
            "message": "Unsupported HTTP method"
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            "success": False,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred"
        }), 500


def register_cli_commands(app: Flask) -> None:
    """Register CLI commands for DB management."""
    @app.cli.command("init-db")
    def init_db():
        """Initialize database tables."""
        with app.app_context():
            db.create_all()
        print("✅ Database initialized successfully.")

    @app.cli.command("drop-db")
    def drop_db():
        """Drop all tables (use with caution)."""
        confirm = input("Are you sure you want to drop all tables? (y/n): ")
        if confirm.lower() == "y":
            with app.app_context():
                db.drop_all()
            print("✅ All tables dropped.")
        else:
            print("❌ Operation canceled.")

    @app.cli.command("seed-db")
    def seed_db():
        """Seed initial data."""
        from werkzeug.security import generate_password_hash
        from models.base import User

        with app.app_context():
            if User.query.first():
                print("Database already seeded.")
                return

            users = [
                User(
                    email="admin@joycesuites.com",
                    password_hash=generate_password_hash("Admin@123456"),
                    full_name="Admin User",
                    phone="+254712000000",
                    role="admin",
                    is_active=True
                ),
                User(
                    email="caretaker@joycesuites.com",
                    password_hash=generate_password_hash("Caretaker@123456"),
                    full_name="Caretaker User",
                    phone="+254712000001",
                    role="caretaker",
                    is_active=True
                ),
                User(
                    email="tenant@joycesuites.com",
                    password_hash=generate_password_hash("Tenant@123456"),
                    full_name="Sample Tenant",
                    phone="+254712000002",
                    role="tenant",
                    is_active=True
                )
            ]
            db.session.add_all(users)
            db.session.commit()
            print("✅ Seeded admin, caretaker, and tenant users.")


def configure_logging(app: Flask) -> None:
    """Configure rotating log file output."""
    if not os.path.exists("logs"):
        os.makedirs("logs")

    handler = RotatingFileHandler(
        "logs/joyce_suites.log", maxBytes=10 * 1024 * 1024, backupCount=10
    )
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
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


# ✅ Expose app globally for Gunicorn / Render
app = create_app()


if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "False").lower() == "true"

    app.run(host=host, port=port, debug=debug, use_reloader=debug)
