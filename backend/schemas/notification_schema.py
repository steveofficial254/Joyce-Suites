from marshmallow import Schema, fields, validate

class NotificationSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True, load_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=3, max=200))
    message = fields.Str(required=True)
    notification_type = fields.Str(validate=validate.OneOf(["general", "urgent", "maintenance", "payment", "lease", "system"]))
    is_read = fields.Bool(dump_only=True)
    read_at = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
