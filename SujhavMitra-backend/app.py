from flask import Flask, jsonify, request
from flask_cors import CORS
from controller.book_recommend_controller import book_bp
from controller.movie_recommend_controller import movie_bp
from controller.user_controller import user_bp
from controller.wishlist_controller import wishlist_bp
from controller.rating_controller import rating_bp

# Flask constructor takes the name of current module (__name__) as argument.app is a instance of the Flask app
app = Flask(__name__)

# Configure CORS with specific settings
CORS(app, 
     resources={
         r"/*": {
             "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
             "allow_headers": ["Content-Type", "Authorization"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"]
         }
     })

# Register blueprints
app.register_blueprint(book_bp)
app.register_blueprint(rating_bp)
app.register_blueprint(movie_bp)
app.register_blueprint(user_bp)
app.register_blueprint(wishlist_bp)


# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# The route() function of the Flask class is a decorator, which tells the application which URL should call the associated function.
@app.route("/")
def home():
    return "Welcome to the SujhavMitra!"


# main driver function
if __name__ == "__main__":
    # run() method of Flask class runs the application on the local development server.
    # Use 0.0.0.0 to make it accessible from other devices on the same network
    app.run(host='0.0.0.0', port=5000, debug=True)
