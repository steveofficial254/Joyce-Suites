from marshmallow import Schema, fields, validate

class BillSchema(Schema):
    id = fields.Int(dump_only=True)
    lease_id = fields.Int(required=True, load_only=True)
    amount = fields.Float(required=True, validate=validate.Range(min=0))
    due_date = fields.Date(required=True)
    status = fields.Str(validate=validate.OneOf(["unpaid", "paid", "overdue"]))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
