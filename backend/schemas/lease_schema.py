from marshmallow import Schema, fields, validate

class LeaseSchema(Schema):
    id = fields.Int(dump_only=True)
    tenant_id = fields.Int(required=True, load_only=True)
    property_id = fields.Int(required=True, load_only=True)
    start_date = fields.Date(required=True)
    end_date = fields.Date(required=True)
    rent_amount = fields.Float(required=True, validate=validate.Range(min=0))
    status = fields.Str(validate=validate.OneOf(["active", "terminated", "expired"]))
    deposit_amount = fields.Float(validate=validate.Range(min=0))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
