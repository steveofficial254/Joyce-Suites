#!/usr/bin/env python3
"""
Add simple room creation endpoint to caretaker routes
"""

from flask import request, jsonify

def add_simple_room_creation(app):
    """Add a simple endpoint to create rooms"""
    
    @app.route('/api/create-rooms-now', methods=['POST'])
    def create_rooms_now():
        """Create rooms with correct pricing - no auth required for setup"""
        try:
            from models.base import db
            from models.user import User
            from models.property import Property
            
            # Get existing users
            joyce = User.query.filter_by(email='joyce@joycesuites.com').first()
            lawrence = User.query.filter_by(email='lawrence@joycesuites.com').first()
            
            if not joyce or not lawrence:
                return jsonify({
                    'success': False,
                    'error': 'Landlord users not found'
                }), 400
            
            # Clear existing properties
            Property.query.delete()
            db.session.commit()
            
            # Create rooms with correct data
            rooms_data = [
                # Joyce Muthoni's rooms (paybill 222111)
                {'room': 1, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 2, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 3, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 4, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 5, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 6, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 7, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 8, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 9, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                {'room': 10, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
                
                # Lawrence Mathea's rooms (paybill 222222)
                {'room': 11, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 12, 'type': 'bedsitter', 'rent': 5500, 'deposit': 5900, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 13, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 14, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 15, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 16, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 17, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 18, 'type': 'one_bedroom', 'rent': 7000, 'deposit': 7400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 19, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 20, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 21, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 22, 'type': 'bedsitter', 'rent': 5500, 'deposit': 5900, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 23, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 24, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 25, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
                {'room': 26, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222222', 'account': '54544'},
            ]
            
            created_count = 0
            for room_data in rooms_data:
                # Make rooms 25 and 26 occupied
                status = 'occupied' if room_data['room'] in [25, 26] else 'vacant'
                
                new_room = Property(
                    name=f"Room {room_data['room']}",
                    property_type=room_data['type'],
                    rent_amount=room_data['rent'],
                    deposit_amount=room_data['deposit'],
                    description=f"{room_data['type'].replace('_', ' ').title()} - KSh {room_data['rent']}/month (Deposit: KSh {room_data['deposit']})",
                    landlord_id=room_data['landlord'].id,
                    status=status,
                    paybill_number=room_data['paybill'],
                    account_number=room_data['account']
                )
                db.session.add(new_room)
                created_count += 1
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': f'Created {created_count} rooms with correct pricing!',
                'data': {
                    'total_rooms': created_count,
                    'bedsitters': 'KSh 5,000-5,500',
                    'one_bedrooms': 'KSh 7,000-7,500',
                    'joyce_rooms': 10,
                    'lawrence_rooms': 16,
                    'occupied_rooms': 2,
                    'vacant_rooms': created_count - 2
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

if __name__ == "__main__":
    print("This is a helper module. Import and use add_simple_room_creation(app) in your app.")
