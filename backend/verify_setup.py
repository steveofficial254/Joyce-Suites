import sqlite3
import sys

print("=" * 60)
print("FINAL VERIFICATION SCRIPT")
print("=" * 60)

# Check 1: Database file
print("\n1. DATABASE FILE:")
conn = sqlite3.connect('instance/app.db')
cursor = conn.cursor()

# Check tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [row[0] for row in cursor.fetchall()]
print(f"   Tables found: {len(tables)}")
print(f"   Table list: {', '.join(tables)}")

# Check 2: Alembic version
print("\n2. ALEBIC MIGRATION VERSION:")
try:
    cursor.execute("SELECT version_num FROM alembic_version")
    version = cursor.fetchone()
    if version:
        print(f"   ✅ Current version: {version[0]}")
    else:
        print("   ⚠️  No alembic version found")
except:
    print("   ⚠️  Could not read alembic version")

# Check 3: Lease table details
print("\n3. LEASE TABLE VERIFICATION:")
cursor.execute("SELECT COUNT(*) FROM leases")
lease_count = cursor.fetchone()[0]
print(f"   Total leases: {lease_count}")

# Check a sample lease
cursor.execute("SELECT id, tenant_id, status, signed_by_tenant FROM leases LIMIT 3")
leases = cursor.fetchall()
if leases:
    print(f"   Sample leases (first {len(leases)}):")
    for lease in leases:
        print(f"     - ID: {lease[0]}, Tenant: {lease[1]}, Status: {lease[2]}, Signed: {lease[3]}")
else:
    print("   ℹ️  No leases in database (this is ok)")

# Check 4: New columns specifically
print("\n4. NEW COLUMNS STATUS:")
new_columns = ['signed_by_tenant', 'signed_at', 'terms_accepted', 'signature_path', 'signature_filename']
all_found = True
for col in new_columns:
    cursor.execute(f"SELECT COUNT(*) FROM pragma_table_info('leases') WHERE name='{col}'")
    exists = cursor.fetchone()[0]
    status = "✅" if exists else "❌"
    print(f"   {status} {col}")
    if not exists:
        all_found = False

conn.close()

print("\n" + "=" * 60)
if all_found:
    print("✅ SUCCESS: All new columns are present!")
    print("   The 'invalid keyword argument' error should be resolved.")
else:
    print("❌ ISSUE: Some columns are missing")
    
print("=" * 60)
