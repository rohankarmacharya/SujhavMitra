from flask import Flask
from flask_cors import CORS
from controller.book_recommend_controller import book_bp
from controller.movie_recommend_controller import movie_bp
from controller.user_controller import user_bp

# Flask constructor takes the name of  current module (__name__) as argument.app is a instance of the Flask app
app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(book_bp)
app.register_blueprint(movie_bp)
app.register_blueprint(user_bp)


# The route() function of the Flask class is a decorator, which tells the application which URL should call the associated function.
@app.route("/")
def home():
    return "Welcome to the SujhavMitra!"


# main driver function
if __name__ == "__main__":
    # run() method of Flask class runs the application on the local development server.
    app.run(debug=True)
