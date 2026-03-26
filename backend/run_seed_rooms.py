#!/usr/bin/env python3
"""
Run Actual Seed Rooms Script on Deployed Server
"""

import os
import sys
from flask import Flask, request, jsonify
from functools import wraps

def create_app():
    app = Flask(__name__)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Configure app
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'temp-secret-key'
    
    # Initialize database
    from models.base import db
    db.init_app(app)
    
    # Import models
    from models.user import User
    from models.property import Property
    
    # Simple auth decorator
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token or not token.startswith('Bearer '):
                return jsonify({'success': False, 'error': 'Token required'}), 401
            
            # Simple token validation (in production, use proper JWT)
            token = token.split(' ')[1]
            # For now, just check if token exists
            return f(*args, **kwargs)
        return decorated
    
    @app.route('/run-seed-rooms', methods=['POST'])
    @token_required
    def run_seed_rooms():
        """Run the actual seed_rooms.py script"""
        try:
            with app.app_context():
                # Import and run the actual seed_rooms function
                from seed_rooms import seed_rooms
                seed_rooms()
                
                # Verify results
                user_count = User.query.count()
                property_count = Property.query.count()
                
                return jsonify({
                    'success': True,
                    'message': 'Seed rooms script executed successfully!',
                    'data': {
                        'users_created': user_count,
                        'properties_created': property_count
                    }
                }), 200
                
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Failed to run seed_rooms: {str(e)}'
            }), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001)
