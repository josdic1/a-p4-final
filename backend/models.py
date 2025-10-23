from sqlalchemy.ext.associationproxy import association_proxy
from extensions import db, bcrypt

# USER #
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    recipes = db.relationship('Recipe', back_populates='user', lazy=True)
    categories = association_proxy('recipes', 'category')

    def __init__(self, username, password):
        self.username = username
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

# CATEGORY #
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)

    recipes = db.relationship('Recipe', back_populates='category', lazy=True)
    users = association_proxy('recipes', 'user')

    def __init__(self, name):
        self.name = name

# RECIPE (Association Object) #
class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)

    user = db.relationship('User', back_populates='recipes')
    category = db.relationship('Category', back_populates='recipes')

    def __init__(self, name, user_id, category_id):
        self.name = name
        self.user_id = user_id
        self.category_id = category_id