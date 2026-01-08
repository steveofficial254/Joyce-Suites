import os
from app import app, db
from models.payment import Payment

with app.app_context():
    # This will create all missing tables/columns
    db.create_all()
    print("✅ Database schema updated successfully!")