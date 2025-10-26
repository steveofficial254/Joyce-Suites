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
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

from config import Config
from models.base import db

load_dotenv()
 main

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

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
    db.init_app(app)
    migrate = Migrate(app, db)

    return app

main
