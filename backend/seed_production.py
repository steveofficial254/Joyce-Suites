#!/usr/bin/env python3
"""
Seed the production database with initial data
"""
import os
import sys
from dotenv import load_dotenv

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app import create_app, db
from models.property import Property
from models.user import User

def seed_production():
    """Seed the production database"""
    app = create_app()
    
    with app.app_context():
        print("🌍 Seeding PRODUCTION database...")
        
        # Check if properties exist
        property_count = Property.query.count()
        print(f"📊 Current property count: {property_count}")
        
        if property_count == 0:
            print("❌ No properties found. Running seed script...")
            
            # Import and run the seed function
            from seed_rooms import seed_rooms
            seed_rooms()
            
            print("✅ Production database seeded successfully!")
        else:
            print("✅ Properties already exist in production database")
            
            # Show current properties
            properties = Property.query.all()
            print(f"🏠 Found {len(properties)} properties:")
            for prop in properties[:5]:  # Show first 5
                print(f"  • {prop.name} - {prop.status} - KSh {prop.rent_amount}")
            if len(properties) > 5:
                print(f"  ... and {len(properties) - 5} more")

if __name__ == '__main__':
    seed_production()
