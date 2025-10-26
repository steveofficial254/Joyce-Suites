from marshmallow import Schema, fields, validate

class ResetPasswordSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True, load_only=True)
    token = fields.Str(required=True)
    expires_at = fields.DateTime(required=True)
    used = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
