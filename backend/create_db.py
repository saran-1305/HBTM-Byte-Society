import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    try:
        # Connect to default 'postgres' database to create the new one
        conn = psycopg2.connect(
            user="postgres",
            password="12345678",
            host="localhost",
            port="5432",
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'HBTM'")
        exists = cursor.fetchone()
        
        if not exists:
            # We must quote HBTM because it is uppercase, otherwise Postgres downcases it
            cursor.execute('CREATE DATABASE "HBTM"')
            print("Database HBTM created successfully.")
        else:
            print("Database HBTM already exists.")
            
    except Exception as e:
        print(f"Error creating database: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    create_database()
