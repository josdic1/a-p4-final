from flask_marshmallow import Marshmallow
from marshmallow import fields

ma = Marshmallow()

class UserSchema(ma.Schema):
    id = fields.Int()
    username = fields.Str()
    recipes = fields.Nested('RecipeSchema', many=True, exclude=('user',))

class CategorySchema(ma.Schema):
    id = fields.Int()
    name = fields.Str()
    recipes = fields.Nested('RecipeSchema', many=True, exclude=('category',))

class RecipeSchema(ma.Schema):
    id = fields.Int()
    name = fields.Str()
    user_id = fields.Int()
    category_id = fields.Int()
    user = fields.Nested(UserSchema, exclude=('recipes',))
    category = fields.Nested(CategorySchema, exclude=('recipes',))