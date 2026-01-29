
from app import create_app, db
from models.property import Property
from models.user import User

def seed_rooms():
    """Add all rooms to the database with correct pricing and payment details"""
    app = create_app()
    
    with app.app_context():
        print("Starting to seed rooms...")
        
        print("\n�️ Deleting all existing properties...")
        Property.query.delete()
        db.session.commit()
        print("✅ All existing properties deleted")
        
        print("\n� Creating/checking users...")
        
        admin = User.query.filter_by(email='admin@joycesuites.com').first()
        if not admin:
            print("Creating admin user...")
            admin = User(
                email='admin@joycesuites.com',
                username='admin',
                first_name='System',
                last_name='Administrator',
                phone_number='+254700000001',
                role='admin',
                national_id=99999999,
                is_active=True
            )
            admin.password = 'Admin@123456'  # Use the password setter
            db.session.add(admin)
            print("✅ Admin user created: admin@joycesuites.com / Admin@123456")
        else:
            print("⚠️ Admin user already exists")
        
        joyce = User.query.filter_by(email='joyce@joycesuites.com').first()
        if not joyce:
            print("Creating Joyce Muthoni user...")
            joyce = User(
                email='joyce@joycesuites.com',
                username='joyce_muthoni',
                first_name='Joyce',
                last_name='Muthoni',
                phone_number='0729175330',
                role='landlord',
                national_id=66183870,
                is_active=True
            )
            joyce.password = 'Password@123'
            db.session.add(joyce)
            print("✅ Joyce Muthoni created")
        
        lawrence = User.query.filter_by(email='lawrence@joycesuites.com').first()
        if not lawrence:
            print("Creating Lawrence Mathea user...")
            lawrence = User(
                email='lawrence@joycesuites.com',
                username='lawrence_mathea',
                first_name='Lawrence',
                last_name='Mathea',
                phone_number='+254722870077',
                role='landlord',
                national_id=10000011,
                is_active=True
            )
            lawrence.password = 'Password@123'
            db.session.add(lawrence)
            print("✅ Lawrence Mathea created")
        
        # Create caretaker user
        caretaker = User.query.filter_by(email='caretaker@joycesuites.com').first()
        if not caretaker:
            print("Creating caretaker user...")
            caretaker = User(
                email='caretaker@joycesuites.com',
                username='caretaker',
                first_name='Caretaker',
                last_name='User',
                phone_number='+254700000002',
                role='caretaker',
                national_id=88888888,
                is_active=True
            )
            caretaker.password = 'Caretaker123!'
            db.session.add(caretaker)
            print("✅ Caretaker user created: caretaker@joycesuites.com / Caretaker123!")
        else:
            print("⚠️ Caretaker user already exists")
        
        db.session.commit()
        
        print("\n🏠 Creating rooms...")
        
        rooms_data = [
            # Joyce Muthoni's rooms (paybill 222111)
            {'room': 1, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
            {'room': 2, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
            {'room': 3, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
            {'room': 4, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
            {'room': 5, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
            {'room': 6, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
            {'room': 8, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
            {'room': 9, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
            {'room': 10, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': joyce, 'paybill': '222111', 'account': '2536316'},
            
            # Lawrence Mathea's rooms (paybill 222111)
            {'room': 11, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 12, 'type': 'bedsitter', 'rent': 5500, 'deposit': 5900, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},  # Bigger bedsitter
            {'room': 13, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 14, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 15, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 17, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 18, 'type': 'one_bedroom', 'rent': 7000, 'deposit': 7400, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},  # Special pricing
            {'room': 19, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 20, 'type': 'one_bedroom', 'rent': 7500, 'deposit': 7900, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 21, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 22, 'type': 'bedsitter', 'rent': 5500, 'deposit': 5900, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},  # Bigger bedsitter
            {'room': 23, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 24, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 25, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
            {'room': 26, 'type': 'bedsitter', 'rent': 5000, 'deposit': 5400, 'landlord': lawrence, 'paybill': '222111', 'account': '54544'},
        ]
        
        created_count = 0
        for room_data in rooms_data:
            new_room = Property(
                name=f"Room {room_data['room']}",
                property_type=room_data['type'],
                rent_amount=room_data['rent'],
                deposit_amount=room_data['deposit'],
                description=f"{room_data['type'].replace('_', ' ').title()} - KSh {room_data['rent']}/month (Deposit: KSh {room_data['deposit']})",
                landlord_id=room_data['landlord'].id,
                status='vacant',
                paybill_number=room_data['paybill'],
                account_number=room_data['account']
            )
            db.session.add(new_room)
            created_count += 1
            room_type_display = 'Bedsitter' if room_data['type'] == 'bedsitter' else '1-Bedroom'
            landlord_name = 'Joyce Muthoni' if room_data['landlord'] == joyce else 'Lawrence Mathea'
            print(f"  Added Room {room_data['room']:2d}: {room_type_display:12s} KSh {room_data['rent']:4d} | Deposit: KSh {room_data['deposit']:4d} | {landlord_name}")
        
        db.session.commit()
        print(f"\n✅ Successfully created {created_count} rooms!")
        
        print("\n📊 ========== DATABASE SUMMARY ==========")
        
        users = User.query.all()
        print(f"\n👤 USERS ({len(users)} total):")
        for user in users:
            print(f"  • {user.email:30} | {user.role:10} | {user.first_name} {user.last_name}")
        
        total = Property.query.count()
        vacant = Property.query.filter_by(status='vacant').count()
        occupied = Property.query.filter_by(status='occupied').count()
        
        print(f"\n🏠 ROOMS ({total} total):")
        print(f"  • Vacant: {vacant}")
        print(f"  • Occupied: {occupied}")
        
        print(f"\n💰 PAYMENT INFORMATION:")
        print(f"  • Joyce Muthoni:   Paybill 222111 (Account: 2536316)")
        print(f"  • Lawrence Mathea: Paybill 222111 (Account: 54544)")
        print(f"  • All rooms use paybill number: 222111")
        
        print("\n🔑 DEFAULT CREDENTIALS:")
        print(f"  • Admin:     admin@joycesuites.com / Admin@123456")
        print(f"  • Caretaker: caretaker@joycesuites.com / Caretaker123!")
        print(f"  • Landlord1: joyce@joycesuites.com / Password@123")
        print(f"  • Landlord2: lawrence@joycesuites.com / Password@123")
        
        print("\n🎉 Seeding complete!")

if __name__ == '__main__':
    seed_rooms()