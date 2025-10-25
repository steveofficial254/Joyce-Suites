from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    public_id = fields.Str(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    email = fields.Email(required=True)
    national_id = fields.Int(required=True)
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))
    role = fields.Str(validate=validate.OneOf(["tenant", "caretaker", "admin"]))
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    phone_number = fields.Str(validate=validate.Length(min=10, max=20))
    is_active = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
