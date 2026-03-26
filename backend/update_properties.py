#!/usr/bin/env python3
"""
Quick script to update existing properties with correct pricing
"""

import requests
import json

# Admin token
ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGpveWNlc3VpdGVzLmNvbSIsImZ1bGxfbmFtZSI6IlN5c3RlbSBBZG1pbmlzdHJhdG9yIiwicm9vbV9udW1iZXIiOm51bGwsInBob3RvX3BhdGgiOm51bGwsImlzX2FjdGl2ZSI6dHJ1ZSwiaWF0IjoxNzc0NTMzNzI2LCJleHAiOjE3NzQ2MjAxMjZ9.FS3huchfY0WTh94jqfLc8ElOcIXc6cam2kMMM88BxzI"

BASE_URL = "https://joyce-suites-xdkp.onrender.com"

def update_properties():
    """Update existing properties with correct pricing"""
    
    # Correct room data from seed_rooms.py
    correct_rooms = [
        {"name": "Room 1", "type": "bedsitter", "rent": 5000, "deposit": 5400, "description": "Bedsitter - KSh 5000/month (Deposit: KSh 5400)"},
        {"name": "Room 2", "type": "bedsitter", "rent": 5000, "deposit": 5400, "description": "Bedsitter - KSh 5000/month (Deposit: KSh 5400)"},
        {"name": "Room 3", "type": "bedsitter", "rent": 5000, "deposit": 5400, "description": "Bedsitter - KSh 5000/month (Deposit: KSh 5400)"},
        {"name": "Room 4", "type": "bedsitter", "rent": 5000, "deposit": 5400, "description": "Bedsitter - KSh 5000/month (Deposit: KSh 5400)"},
        {"name": "Room 5", "type": "bedsitter", "rent": 5000, "deposit": 5400, "description": "Bedsitter - KSh 5000/month (Deposit: KSh 5400)"},
        {"name": "Room 6", "type": "bedsitter", "rent": 5000, "deposit": 5400, "description": "Bedsitter - KSh 5000/month (Deposit: KSh 5400)"},
        {"name": "Room 7", "type": "one_bedroom", "rent": 7500, "deposit": 7900, "description": "One bedroom - KSh 7500/month (Deposit: KSh 7900)"},
        {"name": "Room 8", "type": "one_bedroom", "rent": 7500, "deposit": 7900, "description": "One bedroom - KSh 7500/month (Deposit: KSh 7900)"},
        {"name": "Room 9", "type": "one_bedroom", "rent": 7500, "deposit": 7900, "description": "One bedroom - KSh 7500/month (Deposit: KSh 7900)"},
        {"name": "Room 10", "type": "one_bedroom", "rent": 7500, "deposit": 7900, "description": "One bedroom - KSh 7500/month (Deposit: KSh 7900)"},
    ]
    
    headers = {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }
    
    print("Updating properties with correct pricing...")
    
    # Update first 3 properties with correct data
    for i, room_data in enumerate(correct_rooms[:3]):
        property_id = i + 1
        
        update_data = {
            "name": room_data["name"],
            "property_type": room_data["type"],
            "rent_amount": room_data["rent"],
            "deposit_amount": room_data["deposit"],
            "description": room_data["description"]
        }
        
        # Try to update the property (this might not work if no update endpoint exists)
        try:
            response = requests.put(f"{BASE_URL}/api/admin/properties/{property_id}", 
                                  headers=headers, json=update_data, timeout=10)
            print(f"Property {property_id} update response: {response.status_code}")
        except Exception as e:
            print(f"Error updating property {property_id}: {e}")
    
    print("Update attempt completed. Check the available rooms to see if prices changed.")

if __name__ == "__main__":
    update_properties()
