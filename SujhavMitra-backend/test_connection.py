#!/usr/bin/env python3
"""
Database Connection Test Script
Run this to verify your MySQL connection is working properly
"""

import mysql.connector
from mysql.connector import Error
import sys

# Configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,  # Your MAMP port
    "user": "root",
    "password": "",
    "database": "db_sujhavmitranew"
}

def test_basic_connection():
    """Test basic database connection"""
    print("=" * 50)
    print("TEST 1: Basic Connection")
    print("=" * 50)
    
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            db_info = connection.get_server_info()
            print(f"✅ Successfully connected to MySQL Server version {db_info}")
            
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            record = cursor.fetchone()
            print(f"✅ Connected to database: {record[0]}")
            
            cursor.close()
            connection.close()
            print("✅ Connection closed successfully")
            return True
    except Error as e:
        print(f"❌ Error connecting to MySQL: {e}")
        return False

def test_max_connections():
    """Check MySQL max_connections setting"""
    print("\n" + "=" * 50)
    print("TEST 2: Max Connections Setting")
    print("=" * 50)
    
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        cursor.execute("SHOW VARIABLES LIKE 'max_connections';")
        result = cursor.fetchone()
        max_conn = int(result[1])
        
        print(f"Max connections: {max_conn}")
        if max_conn < 100:
            print(f"⚠️  WARNING: max_connections is low ({max_conn}). Recommended: 200+")
        else:
            print(f"✅ Max connections is adequate: {max_conn}")
        
        cursor.execute("SHOW STATUS WHERE `variable_name` = 'Threads_connected';")
        result = cursor.fetchone()
        current_conn = int(result[1])
        print(f"Current connections: {current_conn}")
        
        cursor.close()
        connection.close()
        return True
    except Error as e:
        print(f"❌ Error checking max connections: {e}")
        return False

def test_required_tables():
    """Check if required tables exist"""
    print("\n" + "=" * 50)
    print("TEST 3: Required Tables")
    print("=" * 50)
    
    required_tables = [
        'sm_users',
        'sm_roles',
        'sm_endpoints',
        'sm_accessibility',
        'sm_user_ratings',
        'sm_user_activity'
    ]
    
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        cursor.execute("SHOW TABLES;")
        existing_tables = [table[0] for table in cursor.fetchall()]
        
        all_exist = True
        for table in required_tables:
            if table in existing_tables:
                print(f"✅ Table '{table}' exists")
            else:
                print(f"❌ Table '{table}' MISSING")
                all_exist = False
        
        cursor.close()
        connection.close()
        return all_exist
    except Error as e:
        print(f"❌ Error checking tables: {e}")
        return False

def test_rating_endpoints():
    """Check if rating endpoints are in database"""
    print("\n" + "=" * 50)
    print("TEST 4: Rating Endpoints")
    print("=" * 50)
    
    required_endpoints = [
        '/rating/add',
        '/rating/my-ratings',
        '/rating/update/<int:rating_id>',
        '/rating/delete/<int:rating_id>',
        '/recommend/my-recommendations'
    ]
    
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT endpoint FROM sm_endpoints WHERE endpoint LIKE '/rating%' OR endpoint LIKE '/recommend/my%';")
        existing_endpoints = [row['endpoint'] for row in cursor.fetchall()]
        
        all_exist = True
        for endpoint in required_endpoints:
            if endpoint in existing_endpoints:
                print(f"✅ Endpoint '{endpoint}' registered")
            else:
                print(f"❌ Endpoint '{endpoint}' MISSING")
                all_exist = False
        
        if not all_exist:
            print("\n⚠️  Run the SQL migration script to add missing endpoints!")
        
        cursor.close()
        connection.close()
        return all_exist
    except Error as e:
        print(f"❌ Error checking endpoints: {e}")
        return False

def test_multiple_connections():
    """Test creating multiple connections simultaneously"""
    print("\n" + "=" * 50)
    print("TEST 5: Multiple Simultaneous Connections")
    print("=" * 50)
    
    connections = []
    try:
        # Try to create 10 connections
        for i in range(10):
            conn = mysql.connector.connect(**DB_CONFIG)
            connections.append(conn)
            print(f"✅ Connection {i+1} created")
        
        print(f"✅ Successfully created {len(connections)} simultaneous connections")
        
        # Close all connections
        for conn in connections:
            conn.close()
        print("✅ All connections closed successfully")
        
        return True
    except Error as e:
        print(f"❌ Error creating multiple connections: {e}")
        # Close any open connections
        for conn in connections:
            if conn.is_connected():
                conn.close()
        return False

def test_pickle_files():
    """Check if ML model pickle files exist"""
    print("\n" + "=" * 50)
    print("TEST 6: ML Model Files")
    print("=" * 50)
    
    import os
    
    required_files = [
        'models/books.pkl',
        'models/similarity_scores.pkl',
        'models/book_user_matrix.pkl'
    ]
    
    all_exist = True
    for file_path in required_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✅ File '{file_path}' exists ({size:,} bytes)")
        else:
            print(f"❌ File '{file_path}' MISSING")
            all_exist = False
    
    return all_exist

def main():
    print("\n" + "=" * 50)
    print("🔍 DATABASE CONNECTION TEST SUITE")
    print("=" * 50)
    
    results = {
        "Basic Connection": test_basic_connection(),
        "Max Connections": test_max_connections(),
        "Required Tables": test_required_tables(),
        "Rating Endpoints": test_rating_endpoints(),
        "Multiple Connections": test_multiple_connections(),
        "ML Model Files": test_pickle_files()
    }
    
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "=" * 50)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 50)
    
    if passed == total:
        print("\n🎉 All tests passed! Your setup is ready.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

