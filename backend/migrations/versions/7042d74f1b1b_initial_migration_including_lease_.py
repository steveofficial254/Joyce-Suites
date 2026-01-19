"""Initial migration including lease signing fields

Revision ID: 7042d74f1b1b
Revises: 
Create Date: 2025-12-29 13:49:52.656259

"""
from alembic import op
import sqlalchemy as sa


revision = '7042d74f1b1b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('users',
    sa.Column('public_id', sa.String(length=50), nullable=False),
    sa.Column('username', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('national_id', sa.Integer(), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('role', sa.Enum('tenant', 'caretaker', 'admin', 'landlord', name='user_role_enum'), nullable=False),
    sa.Column('first_name', sa.String(length=50), nullable=False),
    sa.Column('last_name', sa.String(length=50), nullable=False),
    sa.Column('phone_number', sa.String(length=20), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('photo_path', sa.String(length=255), nullable=True),
    sa.Column('id_document_path', sa.String(length=255), nullable=True),
    sa.Column('room_number', sa.String(length=20), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('national_id'),
    sa.UniqueConstraint('public_id'),
    sa.UniqueConstraint('username')
    )
    op.create_table('messages',
    sa.Column('user_public_id', sa.String(length=50), nullable=False),
    sa.Column('parent_id', sa.Integer(), nullable=True),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['parent_id'], ['messages.id'], ),
    sa.ForeignKeyConstraint(['user_public_id'], ['users.public_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('notifications',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('notification_type', sa.String(length=50), nullable=False),
    sa.Column('is_read', sa.Boolean(), nullable=False),
    sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('properties',
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('property_type', sa.Enum('bedsitter', 'one_bedroom', name='property_type_enum'), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('rent_amount', sa.Float(), nullable=False),
    sa.Column('deposit_amount', sa.Float(), nullable=False),
    sa.Column('landlord_id', sa.Integer(), nullable=False),
    sa.Column('status', sa.Enum('vacant', 'occupied', 'under_maintenance', name='property_status_enum'), nullable=False),
    sa.Column('paybill_number', sa.String(length=20), nullable=True),
    sa.Column('account_number', sa.String(length=50), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['landlord_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('reset_passwords',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('token', sa.String(length=100), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('used', sa.Boolean(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('token')
    )
    op.create_table('leases',
    sa.Column('tenant_id', sa.Integer(), nullable=False),
    sa.Column('property_id', sa.Integer(), nullable=False),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('end_date', sa.Date(), nullable=False),
    sa.Column('rent_amount', sa.Float(), nullable=False),
    sa.Column('status', sa.Enum('active', 'terminated', 'expired', name='lease_status_enum'), nullable=False),
    sa.Column('deposit_amount', sa.Float(), nullable=True),
    sa.Column('signed_by_tenant', sa.Boolean(), nullable=True),
    sa.Column('signed_at', sa.DateTime(), nullable=True),
    sa.Column('terms_accepted', sa.Boolean(), nullable=True),
    sa.Column('signature_path', sa.String(length=255), nullable=True),
    sa.Column('signature_filename', sa.String(length=255), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ),
    sa.ForeignKeyConstraint(['tenant_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('maintenance_requests',
    sa.Column('title', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('status', sa.Enum('pending', 'in_progress', 'completed', 'cancelled', name='maintenance_status_enum'), nullable=False),
    sa.Column('priority', sa.String(length=20), nullable=False),
    sa.Column('property_id', sa.Integer(), nullable=False),
    sa.Column('reported_by_id', sa.Integer(), nullable=False),
    sa.Column('assigned_to_id', sa.Integer(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['assigned_to_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ),
    sa.ForeignKeyConstraint(['reported_by_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('property_images',
    sa.Column('property_id', sa.Integer(), nullable=False),
    sa.Column('image_url', sa.String(length=500), nullable=False),
    sa.Column('caption', sa.String(length=200), nullable=True),
    sa.Column('is_primary', sa.Boolean(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('bills',
    sa.Column('lease_id', sa.Integer(), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.Column('due_date', sa.Date(), nullable=False),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['lease_id'], ['leases.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('payments',
    sa.Column('lease_id', sa.Integer(), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.Column('provider_id', sa.String(length=120), nullable=True),
    sa.Column('status', sa.Enum('pending', 'successful', 'failed', 'refunded', name='payment_status_enum'), nullable=False),
    sa.Column('transaction_id', sa.String(length=100), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['lease_id'], ['leases.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('transaction_id')
    )
    op.create_table('vacate_notices',
    sa.Column('lease_id', sa.Integer(), nullable=False),
    sa.Column('vacate_date', sa.Date(), nullable=False),
    sa.Column('reason', sa.Text(), nullable=True),
    sa.Column('status', sa.Enum('pending', 'approved', 'rejected', 'completed', name='vacate_status_enum'), nullable=False),
    sa.Column('admin_notes', sa.Text(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['lease_id'], ['leases.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('vacate_notices')
    op.drop_table('payments')
    op.drop_table('bills')
    op.drop_table('property_images')
    op.drop_table('maintenance_requests')
    op.drop_table('leases')
    op.drop_table('reset_passwords')
    op.drop_table('properties')
    op.drop_table('notifications')
    op.drop_table('messages')
    op.drop_table('users')
