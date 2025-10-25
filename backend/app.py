from flask import Flask
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

from config import Config
from models.base import db

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate = Migrate(app, db)

    return app

