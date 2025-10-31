

from flask import Flask, jsonify
=======
Ddevelop
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
# import your blueprints (adjust these imports if needed)
from routes.mpesa_routes import mpesa_bp, payment_bp
from routes.auth_routes import auth_bp
from routes.caretaker_routes import caretaker_bp
from routes.tenant_routes import tenant_bp

=======
from flask import Flask
>>>>>>> main
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from datetime import datetime

# Import blueprints
from routes.auth_routes import auth_bp
from routes.tenant_routes import tenant_bp
from routes.admin_routes import admin_bp
from routes.caretaker_routes import caretaker_bp

# Import configuration and database
from config import Config
from models.base import db


# Load environment variables
load_dotenv()
 main



def create_app(config_name: str = None):
    """
    Application factory function for creating Flask app instances.
    
    Args:
        config_name: Configuration name (development, testing, production)
    
    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")
    
    app.config.from_object(Config)
    
    # Initialize extensions
=======
 Ddevelop
    # Initialize extensions
    db.init_app(app)
    CORS(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(mpesa_bp, url_prefix="/api/mpesa")
    app.register_blueprint(payment_bp, url_prefix="/api/payments")
    app.register_blueprint(caretaker_bp, url_prefix="/api/caretaker")
    app.register_blueprint(tenant_bp, url_prefix="/api/tenant")

    @app.route("/")
    def home():
        return jsonify({"message": "✅ Joyce Suites Backend is running successfully!"}), 200

    # Create database tables automatically (for development)
    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=app.config.get("PORT", 5000),
        debug=(app.config.get("FLASK_ENV") == "development")
    )

=======
>>>>>>> main
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    

    configure_logging(app)
    
    
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register CLI commands
    register_cli_commands(app)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app


def register_blueprints(app: Flask) -> None:
    """
    Register all route blueprints with the Flask application.
    
    Args:
        app: Flask application instance
    """
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(caretaker_bp)
    app.register_blueprint(tenant_bp)
    
    # Register health check and status endpoints
    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Health check endpoint for monitoring."""
        return jsonify({
            "success": True,
            "status": "healthy",
            "service": "Joyce Suites API",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    
    @app.route("/api/status", methods=["GET"])
    def get_status():
        """Get application status and version."""
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
    """
    Register error handlers for common HTTP exceptions.
    
    Args:
        app: Flask application instance
    """
    
    @app.errorhandler(400)
    def bad_request(error):
        """Handle 400 Bad Request errors."""
        return jsonify({
            "success": False,
            "error": "Bad request",
            "message": str(error.description) if hasattr(error, 'description') else "The request could not be understood"
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        """Handle 401 Unauthorized errors."""
        return jsonify({
            "success": False,
            "error": "Unauthorized",
            "message": "Authentication credentials are missing or invalid"
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        """Handle 403 Forbidden errors."""
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You do not have permission to access this resource"
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 Not Found errors."""
        return jsonify({
            "success": False,
            "error": "Not found",
            "message": "The requested resource was not found"
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle 405 Method Not Allowed errors."""
        return jsonify({
            "success": False,
            "error": "Method not allowed",
            "message": "The HTTP method used is not supported for this endpoint"
        }), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 Internal Server errors."""
        app.logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later."
        }), 500
    
    @app.errorhandler(503)
    def service_unavailable(error):
        """Handle 503 Service Unavailable errors."""
        return jsonify({
            "success": False,
            "error": "Service unavailable",
            "message": "The service is temporarily unavailable. Please try again later."
        }), 503


def register_cli_commands(app: Flask) -> None:
    """
    Register custom CLI commands for database and app management.
    
    Args:
        app: Flask application instance
    """
    
    @app.cli.command()
    def init_db():
        """Initialize the database with tables."""
        with app.app_context():
            db.create_all()
        print("✓ Database initialized successfully")
    
    @app.cli.command()
    def drop_db():
        """Drop all database tables (use with caution!)."""
        response = input("Are you sure you want to drop all tables? (y/n): ")
        if response.lower() == "y":
            with app.app_context():
                db.drop_all()
            print("✓ Database tables dropped")
        else:
            print("Aborted")
    
    @app.cli.command()
    def seed_db():
        """Seed database with initial data."""
        with app.app_context():
            from werkzeug.security import generate_password_hash
            
            # Check if data already exists
            from models.base import User
            if User.query.first():
                print("Database already seeded")
                return
            
            # Create admin user
            admin = User(
                email="admin@joycestuites.com",
                password_hash=generate_password_hash("Admin@123456"),
                full_name="Admin User",
                phone="+254712000000",
                role="admin",
                is_active=True
            )
            db.session.add(admin)
            
            # Create caretaker user
            caretaker = User(
                email="caretaker@joycestuites.com",
                password_hash=generate_password_hash("Caretaker@123456"),
                full_name="Caretaker User",
                phone="+254712000001",
                role="caretaker",
                is_active=True
            )
            db.session.add(caretaker)
            
            # Create sample tenant user
            tenant = User(
                email="tenant@joycestuites.com",
                password_hash=generate_password_hash("Tenant@123456"),
                full_name="Sample Tenant",
                phone="+254712000002",
                role="tenant",
                is_active=True
            )
            db.session.add(tenant)
            
            db.session.commit()
            print("✓ Database seeded with initial users")
            print("  - Admin: admin@joycestuites.com / Admin@123456")
            print("  - Caretaker: caretaker@joycestuites.com / Caretaker@123456")
            print("  - Tenant: tenant@joycestuites.com / Tenant@123456")


def configure_logging(app: Flask) -> None:
    """
    Configure application logging.
    
    Args:
        app: Flask application instance
    """
    # Create logs directory if it doesn't exist
    if not os.path.exists("logs"):
        os.makedirs("logs")
    
    # Configure file handler
    from logging.handlers import RotatingFileHandler
    
    file_handler = RotatingFileHandler(
        "logs/joyce_suites.log",
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    
    # Set log format
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)
    
    # Add handler to app logger
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    
    app.logger.info(f"Joyce Suites API started - Environment: {os.getenv('FLASK_ENV', 'development')}")


def check_db_connection(app: Flask) -> bool:
    """
    Check if database connection is active.
    
    Args:
        app: Flask application instance
    
    Returns:
        True if connected, False otherwise
    """
    try:
        with app.app_context():
            db.session.execute("SELECT 1")
        return True
    except Exception:
        return False


if __name__ == "__main__":
    app = create_app()
    
    # Get configuration from environment
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    
    # Run the application
    app.run(
        host=host,
        port=port,
        debug=debug_mode,
        use_reloader=debug_mode
    )
=======
main
>>>>>>> main
