import os

# Database configuration
dbconfig = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "db_sujhavmitranew")
}

# JWT Secret Key
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this-in-production")

# Flask configuration
DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"
HOST = os.getenv("FLASK_HOST", "127.0.0.1")
PORT = int(os.getenv("FLASK_PORT", 5000))

