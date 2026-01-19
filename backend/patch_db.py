import sqlite3
import os

db_path = 'instance/joyce_suites.db'

def patch_db():
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("🔄 Adding reservation columns to properties table...")
        
        try:
            cursor.execute("ALTER TABLE properties ADD COLUMN reserved_until DATETIME")
            print("✅ Added reserved_until")
        except sqlite3.OperationalError:
            print("ℹ️ reserved_until already exists")

        try:
            cursor.execute("ALTER TABLE properties ADD COLUMN reservation_user_id INTEGER REFERENCES users(id)")
            print("✅ Added reservation_user_id")
        except sqlite3.OperationalError:
            print("ℹ️ reservation_user_id already exists")

        conn.commit()
        conn.close()
        print("🎉 Database patched successfully!")

    except Exception as e:
        print(f"❌ Error patching database: {e}")

if __name__ == '__main__':
    patch_db()
