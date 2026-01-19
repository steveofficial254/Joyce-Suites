"""Update property and inquiry models for reservations

Revision ID: 7e62710ca6a8
Revises: 98d84b245f57
Create Date: 2026-01-19 14:08:05.404450

"""
from alembic import op
import sqlalchemy as sa


revision = '7e62710ca6a8'
down_revision = '98d84b245f57'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('booking_inquiries', schema=None) as batch_op:
        batch_op.add_column(sa.Column('room_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_booking_inquiries_room_id', 'properties', ['room_id'], ['id'])



def downgrade():
    with op.batch_alter_table('booking_inquiries', schema=None) as batch_op:
        batch_op.drop_constraint('fk_booking_inquiries_room_id', type_='foreignkey')
        batch_op.drop_column('room_id')

