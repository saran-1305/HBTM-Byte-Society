import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    # Connect to the default 'postgres' database to create a new database
    conn = psycopg2.connect(
        dbname='postgres',
        user='postgres',
        password='12345678',
        host='localhost',
        port='5432'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    # Check if database exists
    cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'hbtm'")
    exists = cur.fetchone()
    
    if not exists:
        cur.execute("CREATE DATABASE hbtm;")
        print("Database 'hbtm' created successfully.")
    else:
        print("Database 'hbtm' already exists.")
        
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
