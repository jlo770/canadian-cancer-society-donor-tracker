import os
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from dotenv import load_dotenv

# Initialize extensions outside of create_app to make them importable
db = SQLAlchemy()
jwt = JWTManager()
login_manager = LoginManager()

def create_app(test_config=None, testing=False):
    # Load environment variables
    load_dotenv()
    
    # Initialize Flask app
    app = Flask(__name__)
    CORS(app)
    
    if test_config is None:
        # Configure database for production
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///donor_tracker.db')
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-secret-key')
        app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default-jwt-secret')
    else:
        # Override config for testing
        app.config.update(test_config)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate = Migrate(app, db)
    jwt.init_app(app)
    login_manager.init_app(app)
    
    # Import models and routes after initializing db
    with app.app_context():
        # Import specific models instead of using wildcard import
        from models import Donor, Donation, Campaign, User
        from routes import register_routes
        
        # Set up user loader for Flask-Login
        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))
        
        # Register routes
        register_routes(app)
        
        # Add health check route
        @app.route('/health', methods=['GET'])
        def health_check():
            return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})
    return app

# Create the application instance
app = create_app()

# Main health check route
@app.route('/api/health')
def api_health_check():
    return jsonify({'status': 'ok', "message": "Canadian Cancer Society Donor Tracker API is running"})

if __name__ == '__main__':
    app.run(debug=True)
