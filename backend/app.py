# backend/app.py

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure the backend directory is in the python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load environment variables from .env
load_dotenv()

# Import blueprints
from routes.initialize import initialize_bp
from routes.safe_check import safe_check_bp
from routes.request_resource import request_bp
from routes.ai_routes import ai_bp

def create_app():
    """
    App Factory function to initialize the Flask server, 
    configure CORS, and register all Blueprints.
    """
    app = Flask(__name__)
    
    # Enable Cross-Origin Resource Sharing (CORS) for all routes
    # This allows our React frontend (typically running on port 5173 or 3000)
    # to communicate with the Flask API on port 5000.
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Root route for server verification
    @app.route('/', methods=['GET'])
    def server_status():
        return jsonify({
            "status": "online",
            "message": "AI-Powered Deadlock Detection and Prevention System Backend is running.",
            "api_endpoints": [
                "/initialize",
                "/check-safe",
                "/request-resource",
                "/ai-explain"
            ]
        }), 200

    # Register Blueprints
    app.register_blueprint(initialize_bp)
    app.register_blueprint(safe_check_bp)
    app.register_blueprint(request_bp)
    app.register_blueprint(ai_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    # Get port from env or default to 5000
    port = int(os.getenv("PORT", 5000))
    print(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
