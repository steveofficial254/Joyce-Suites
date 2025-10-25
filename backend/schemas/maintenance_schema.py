from marshmallow import Schema, fields, validate

class MaintenanceRequestSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    description = fields.Str(required=True)
    status = fields.Str(validate=validate.OneOf(["pending", "in_progress", "completed", "cancelled"]))
    priority = fields.Str(validate=validate.OneOf(["low", "normal", "high", "urgent"]))
    property_id = fields.Int(required=True, load_only=True)
    reported_by_id = fields.Int(required=True, load_only=True)
    assigned_to_id = fields.Int(load_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
