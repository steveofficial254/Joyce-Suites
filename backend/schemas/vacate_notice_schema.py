from marshmallow import Schema, fields, validate

class VacateNoticeSchema(Schema):
    id = fields.Int(dump_only=True)
    lease_id = fields.Int(required=True, load_only=True)
    vacate_date = fields.Date(required=True)
    reason = fields.Str()
    status = fields.Str(validate=validate.OneOf(["pending", "approved", "rejected", "completed"]))
    admin_notes = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
