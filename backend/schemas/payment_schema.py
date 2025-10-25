from marshmallow import Schema, fields, validate

class PaymentSchema(Schema):
    id = fields.Int(dump_only=True)
    lease_id = fields.Int(required=True, load_only=True)
    amount = fields.Float(required=True, validate=validate.Range(min=0))
    provider_id = fields.Str()
    status = fields.Str(validate=validate.OneOf(["pending", "successful", "failed", "refunded"]))
    transaction_id = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
