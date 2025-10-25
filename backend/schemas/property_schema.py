from marshmallow import Schema, fields, validate

class PropertySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    property_type = fields.Str(required=True, validate=validate.OneOf(["apartment", "studio", "bedsitter"]))
    description = fields.Str()
    rent_amount = fields.Float(required=True, validate=validate.Range(min=0))
    landlord_id = fields.Int(required=True, load_only=True)
    status = fields.Str(validate=validate.OneOf(["vacant", "occupied", "under_maintenance"]))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
