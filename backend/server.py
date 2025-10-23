from flask import Flask, request, jsonify, session
from flask_cors import CORS
from extensions import db, bcrypt
from schemas import ma, CategorySchema, RecipeSchema, UserSchema

app = Flask(__name__)
CORS(app, 
     supports_credentials=True, 
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     origins=['http://localhost:5173'])

app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'

db.init_app(app)
bcrypt.init_app(app)
ma.init_app(app)

from models import User, Category, Recipe

### ==================== USERS ==================== ###

# GET USERS #
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_schema = UserSchema(many=True)
    return jsonify(user_schema.dump(users)), 200

# GET USER #
@app.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):  
    user = db.session.get(User, user_id)
    user_schema = UserSchema()
    return jsonify(user_schema.dump(user)), 200

# REGISTER #
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    session['user_id'] = new_user.id

    return jsonify({'message': 'User registered successfully'}), 201

# LOGIN #
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# LOGOUT #
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'}), 200

# CHECK SESSION #
@app.route('/check_session', methods=['GET'])
def check_session():
    if 'user_id' in session:
        user = db.session.get(User, session['user_id'])
        if user:  # Check if user actually exists
            return jsonify({"logged_in": True, "username": user.username}), 200
        else:
            # User doesn't exist anymore, clear the session
            session.pop('user_id', None)
    return jsonify({"logged_in": False}), 200

### ==================== CATEGORIES ==================== ###

# GET CATEGORIES #
@app.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    category_schema = CategorySchema(many=True)
    return jsonify(category_schema.dump(categories)), 200

# GET CATEGORY #
@app.route('/category/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = db.session.get(Category, category_id)
    category_schema = CategorySchema()
    return jsonify(category_schema.dump(category)), 200

# GET MY CATEGORIES #
@app.route('/my_categories', methods=['GET'])
def get_my_categories():    
    if 'user_id' not in session:    
        return jsonify({'message': 'Must be logged in'}), 401

    recipes = Recipe.query.filter_by(user_id=session['user_id']).all()
    category_ids = list(set([recipe.category_id for recipe in recipes]))
    categories = Category.query.filter(Category.id.in_(category_ids)).all()
    
    category_schema = CategorySchema(many=True)
    return jsonify(category_schema.dump(categories)), 200

# NOT MY CATEGORIES #
@app.route('/not_my_categories', methods=['GET'])
def get_not_my_categories():    
    if 'user_id' not in session:    
        return jsonify({'message': 'Must be logged in'}), 401

    recipes = Recipe.query.filter_by(user_id=session['user_id']).all()
    category_ids = list(set([recipe.category_id for recipe in recipes]))
    categories = Category.query.filter(Category.id.notin_(category_ids)).all()
    
    category_schema = CategorySchema(many=True)
    return jsonify(category_schema.dump(categories)), 200

# ADD CATEGORY #
@app.route('/add_category', methods=['POST'])
def add_category():
    data = request.get_json()
    name = data.get('name') 

    new_category = Category(name=name)
    db.session.add(new_category)
    db.session.commit()

    return jsonify({'message': 'Category added successfully', 'id': new_category.id}), 201

### ==================== RECIPES ==================== ###

# GET RECIPES #
@app.route('/recipes', methods=['GET'])
def get_recipes():
    recipes = Recipe.query.all()
    recipe_schema = RecipeSchema(many=True)
    return jsonify(recipe_schema.dump(recipes)), 200

# GET RECIPE #
@app.route('/recipe/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    recipe = db.session.get(Recipe, recipe_id)
    recipe_schema = RecipeSchema()
    return jsonify(recipe_schema.dump(recipe)), 200

# GET MY RECIPES #
@app.route('/my_recipes', methods=['GET'])
def get_my_recipes():
    if 'user_id' not in session:
        return jsonify({'message': 'Must be logged in'}), 401
    
    recipes = Recipe.query.filter_by(user_id=session['user_id']).all()
    recipe_schema = RecipeSchema(many=True)
    return jsonify(recipe_schema.dump(recipes)), 200

# GET NOT MY RECIPES #
@app.route('/not_my_recipes', methods=['GET'])
def get_not_my_recipes():    
    if 'user_id' not in session:    
        return jsonify({'message': 'Must be logged in'}), 401

    recipes = Recipe.query.filter_by(user_id=session['user_id']).all()
    recipe_ids = list(set([recipe.id for recipe in recipes]))
    recipes = Recipe.query.filter(Recipe.id.notin_(recipe_ids)).all()
    
    recipe_schema = RecipeSchema(many=True)
    return jsonify(recipe_schema.dump(recipes)), 200

# ADD RECIPE #
@app.route('/add_recipe', methods=['POST'])
def add_recipe():
    if 'user_id' not in session:
        return jsonify({'message': 'Must be logged in'}), 401
    
    data = request.get_json()
    name = data.get('name')
    category_id = data.get('category_id')
    
    new_recipe = Recipe(name=name, user_id=session['user_id'], category_id=category_id)
    db.session.add(new_recipe)
    db.session.commit()
    
    return jsonify({'message': 'Recipe added successfully'}), 201

# UPDATE RECIPE #
@app.route('/recipe/<int:recipe_id>', methods=['PUT'])
def update_recipe(recipe_id):
    if 'user_id' not in session:    
        return jsonify({'message': 'Must be logged in'}), 401
    
    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:    
        return jsonify({'message': 'Recipe not found'}), 404
    
    if recipe.user_id != session['user_id']:    
        return jsonify({'message': 'You can only update your own recipes'}), 403
    
    data = request.get_json()
    recipe.name = data.get('name')
    recipe.category_id = data.get('category_id')
    db.session.commit()
    
    return jsonify({'message': 'Recipe updated successfully'}), 200

# DELETE RECIPE #
@app.route('/recipe/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    if 'user_id' not in session:
        return jsonify({'message': 'Must be logged in'}), 401
    
    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({'message': 'Recipe not found'}), 404
    
    if recipe.user_id != session['user_id']:
        return jsonify({'message': 'You can only delete your own recipes'}), 403
    
    db.session.delete(recipe)
    db.session.commit()
    return jsonify({'message': 'Recipe deleted successfully'}), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all() 
    app.run(port=5555, debug=True)