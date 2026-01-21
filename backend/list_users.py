from app import create_app
from models.user import User
import os

app = create_app()
with app.app_context():
    users = User.query.all()
    print(f"Total users: {len(users)}")
    for user in users:
        print(f"ID: {user.id}, Email: {user.email}, Role: {user.role}, Active: {user.is_active}")
