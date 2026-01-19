"""Add booking inquiry model

Revision ID: 98d84b245f57
Revises: 9891c42ba5a5
Create Date: 2026-01-19 14:03:17.122888

"""
from alembic import op
import sqlalchemy as sa


revision = '98d84b245f57'
down_revision = '9891c42ba5a5'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('booking_inquiries',
    sa.Column('name', sa.String(length=200), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=False),
    sa.Column('house_type', sa.String(length=50), nullable=True),
    sa.Column('occupancy', sa.String(length=50), nullable=True),
    sa.Column('move_in_date', sa.String(length=50), nullable=True),
    sa.Column('message', sa.Text(), nullable=True),
    sa.Column('subject', sa.String(length=200), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('is_paid', sa.Boolean(), nullable=False),
    sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('approved_by', sa.Integer(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('booking_inquiries')
