from fastapi import FastAPI, Depends
import cx_Oracle
from contextlib import contextmanager

app = FastAPI()

username = "BD_415123"
password = "ProjektBazy2024AI"
host = "dbmanage.lab.ii.agh.edu.pl"
port = "1521"
dsn = cx_Oracle.makedsn(host, port, sid="DBMANAGE")

@contextmanager
def get_db_connection():
    connection = cx_Oracle.connect(user=username, password=password, dsn=dsn, encoding="UTF-8")
    try:
        yield connection
    finally:
        connection.close()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/test_db")
def test_db():
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 'Success' FROM DUAL")
            result = cursor.fetchone()
    return {"db_test": result}

@app.get("/reservations")
def read_reservations():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT reservation_id, table_id, customer_id, start_date, end_date, no_guests, status, notes 
                    FROM reservations
                """)
                reservations = cursor.fetchall()
                reservations_list = [
                    {
                        "reservation_id": row[0],
                        "table_id": row[1],
                        "customer_id": row[2],
                        "start_date": row[3],
                        "end_date": row[4],
                        "no_guests": row[5],
                        "status": row[6],
                        "notes": row[7]
                    }
                    for row in reservations
                ]
        return {"reservations": reservations_list}
    except HTTPException as e:
        return e.detail


@app.get("/table_types")
def read_reservations():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT type_id, type_name
                    FROM table_types
                """)
                types = cursor.fetchall()
                types_list = [
                    {
                        "type_id": row[0],
                        "type_name": row[1]
                    }
                    for row in types
                ]
        return {"types": types_list}
    except HTTPException as e:
        return e.detail


@app.get("/tables")
def read_reservations():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT table_id, no_seats, table_type_id
                    FROM tables
                """)
                tables = cursor.fetchall()
                tables_list = [
                    {
                        "table_id": row[0],
                        "no_seats": row[1],
                        "table_type_id": row[2]
                    }
                    for row in tables
                ]
        return {"tables": tables_list}
    except HTTPException as e:
        return e.detail

@app.get("/customers")
def read_reservations():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT customer_id, firstname, lastname, phone_number, email
                    FROM customers
                """)
                customers = cursor.fetchall()
                customers_list = [
                    {
                        "customer_id": row[0],
                        "firstname": row[1],
                        "lastname": row[2],
                        "phone_number": row[3],
                        "email": row[4]
                    }
                    for row in customers
                ]
        return {"customers": customers_list}
    except HTTPException as e:
        return e.detail