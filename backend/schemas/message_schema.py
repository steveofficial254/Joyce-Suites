from marshmallow import Schema, fields, validate

class MessageSchema(Schema):
    id = fields.Int(dump_only=True)
    user_public_id = fields.Str(required=True, load_only=True)
    parent_id = fields.Int(load_only=True)
    content = fields.Str(required=True, validate=validate.Length(min=1, max=5000))
    timestamp = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
