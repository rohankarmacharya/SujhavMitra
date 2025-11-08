import mysql.connector
import os
import sys

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from configs.config import dbconfig

def run_migration():
    try:
        # Connect to the database
        conn = mysql.connector.connect(
            host=dbconfig["host"],
            port=dbconfig["port"],
            user=dbconfig["user"],
            password=dbconfig["password"],
            database=dbconfig["database"]
        )
        
        cursor = conn.cursor()
        
        # Add the data column if it doesn't exist
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'sm_wishlist'
            AND COLUMN_NAME = 'data';
        """)
        
        if cursor.fetchone()[0] == 0:
            # Add the data column as JSON type
            cursor.execute("""
                ALTER TABLE sm_wishlist
                ADD COLUMN data JSON DEFAULT NULL
                AFTER title;
            """)
            print("Successfully added 'data' column to sm_wishlist table")
        else:
            print("'data' column already exists in sm_wishlist table")
        
        conn.commit()
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error running migration: {e}")
        raise

if __name__ == "__main__":
    run_migration()
