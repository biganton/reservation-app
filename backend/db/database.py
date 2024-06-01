import cx_Oracle
from contextlib import contextmanager
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

username = os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
sid = os.getenv("DB_SID")
dsn = cx_Oracle.makedsn(host, port, sid=sid)

@contextmanager
def get_db_connection():
    connection = cx_Oracle.connect(user=username, password=password, dsn=dsn, encoding="UTF-8")
    try:
        yield connection
    finally:
        connection.close()
