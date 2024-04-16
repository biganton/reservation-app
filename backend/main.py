from fastapi import FastAPI, Depends
import cx_Oracle
from contextlib import contextmanager

app = FastAPI()

username = "BD_415123"
password = "dupa123"
host = "dbmanage.lab.ii.agh.edu.pl"
port = "1521"
service_name = "DBMANAGE"
dsn = cx_Oracle.makedsn(host, port, sid="DBMANAGE")

@contextmanager
def get_db_connection():
    connection = cx_Oracle.connect(user=username, password=password, dsn=dsn, encoding="UTF-8")
    try:
        yield connection
    finally:
        connection.close()

@contextmanager
def get_db_cursor(connection):
    cursor = connection.cursor()
    try:
        yield cursor
    finally:
        cursor.close()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/test_db")
def test_db(connection: cx_Oracle.Connection = Depends(get_db_connection)):
    with get_db_cursor(connection) as cursor:
        cursor.execute("SELECT 'Success' FROM DUAL")
        result = cursor.fetchone()
    return {"db_test": result}

@app.get("/reservations")
def read_reservations():
    return {"reservations": ["Reservation 1", "Reservation 2"]}
