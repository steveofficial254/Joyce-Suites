from marshmallow import Schema, fields, validate

class PropertyImageSchema(Schema):
    id = fields.Int(dump_only=True)
    property_id = fields.Int(required=True, load_only=True)
    image_url = fields.Str(required=True, validate=validate.URL())
    caption = fields.Str(validate=validate.Length(max=200))
    is_primary = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
