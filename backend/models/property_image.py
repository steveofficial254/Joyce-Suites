from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

from .base import BaseModel, db


class PropertyImage(BaseModel, SerializerMixin):
    __tablename__ = 'property_images'

    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(200))
    is_primary = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    property = db.relationship('Property', back_populates='images')

    serialize_rules = ("-property.images",)

    @validates('image_url')
    def validate_image_url(self, key, value):
        if not value or not value.strip():
            raise ValueError("Image URL cannot be empty")
        return value.strip()

    def __repr__(self):
        return f"<PropertyImage {self.id} - Property {self.property_id}>"


