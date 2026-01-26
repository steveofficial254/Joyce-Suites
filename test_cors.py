#!/usr/bin/env python3
"""
Test CORS configuration
"""

import requests
import json

def test_cors():
    """Test CORS endpoints"""
    base_url = "https://joyce-suites-xdkp.onrender.com"
    
    # Test preflight request
    print("🧪 Testing CORS preflight request...")
    headers = {
        'Origin': 'https://joyce-suites.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
    
    try:
        response = requests.options(f"{base_url}/api/auth/login", headers=headers)
        print(f"✅ Preflight Status: {response.status_code}")
        print(f"✅ CORS Headers: {dict(response.headers)}")
        
        # Check for required CORS headers
        required_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers'
        ]
        
        for header in required_headers:
            if header in response.headers:
                print(f"✅ {header}: {response.headers[header]}")
            else:
                print(f"❌ Missing header: {header}")
                
    except Exception as e:
        print(f"❌ Preflight request failed: {e}")
    
    # Test actual request
    print("\n🧪 Testing actual request...")
    headers = {
        'Origin': 'https://joyce-suites.vercel.app',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/login", 
            headers=headers,
            json={'email': 'test@example.com', 'password': 'test'},
            timeout=10
        )
        print(f"✅ Request Status: {response.status_code}")
        print(f"✅ CORS Headers: {dict(response.headers)}")
        
        if 'Access-Control-Allow-Origin' in response.headers:
            print(f"✅ CORS Origin: {response.headers['Access-Control-Allow-Origin']}")
        else:
            print("❌ Missing Access-Control-Allow-Origin header")
            
    except Exception as e:
        print(f"❌ Actual request failed: {e}")

if __name__ == "__main__":
    test_cors()
