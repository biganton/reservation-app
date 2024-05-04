from fastapi import FastAPI, Depends, HTTPException, status
import cx_Oracle
from contextlib import contextmanager
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime





app = FastAPI()

username = "BD_415123"
password = "ProjektBazy2024AI"
host = "dbmanage.lab.ii.agh.edu.pl"
port = "1521"
dsn = cx_Oracle.makedsn(host, port, sid="DBMANAGE")


origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

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
def read_all_reservations():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM VW_ALL_RESERVATIONS")
                reservations = cursor.fetchall()
                return [{
                    "reservation_id": row[0],
                    "customer_name": row[1],
                    "table_id": row[2],
                    "start_date": row[3],
                    "end_date": row[4],
                    "no_guests": row[5],
                    "status": row[6],
                    "notes": row[7]
                } for row in reservations]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


    
@app.get("/reservations/{customer_id}")
def read_reservations(customer_id: int):
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                # Use the customer_id in your SQL function call
                cursor.execute(f"""
                    SELECT * FROM TABLE(F_CUSTOMER_RESERVATION_HISTORY(:customer_id))
                """, {'customer_id': customer_id})
                customers = cursor.fetchall()
                if not customers:
                    raise HTTPException(status_code=404, detail="No reservations found for this customer.")

                customers_list = [
                    {
                        "reservation_id": row[0],
                        "table_id": row[1],
                        "table_type": row[2],
                        "start_date": row[3],
                        "end_date": row[4],
                        "no_guests": row[5],
                        "status": row[6],
                        "notes": row[7]

                    } for row in customers
                ]
        return {"customers": customers_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@app.get("/table_types")
def read_table_types():
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
def read_tables():
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
def read_customers():
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


class Customer(BaseModel):
    firstName: str
    lastName: str
    phoneNumber: str
    email: str

@app.post("/add_customer")
def add_customer(customer: Customer):
    sql = """
    BEGIN
        p_add_customer(
            p_firstname => :firstName,
            p_lastname => :lastName,
            p_phone_number => :phoneNumber,
            p_email => :email
        );
    END;
    """
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor()
            cursor.execute(sql, customer.dict())
            connection.commit()
            return {"message": "Customer added successfully"}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    

class Reservation(BaseModel):
    table_id: int
    customer_id: int
    start_date: datetime
    end_date: datetime
    no_guests: int
    notes: str


@app.post("/add_reservation")
def add_reservation(reservation: Reservation):
    sql = """
    BEGIN
        p_add_reservation(
            p_table_id => :table_id,
            p_customer_id => :customer_id,
            p_date_start => :start_date,
            p_date_end => :end_date,
            p_no_guests => :no_guests,
            p_notes => :notes
        );
    END;
    """
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor()
            cursor.execute(sql, {
                "table_id": reservation.table_id,
                "customer_id": reservation.customer_id,
                "start_date": reservation.start_date,
                "end_date": reservation.end_date,
                "no_guests": reservation.no_guests,
                "notes": reservation.notes
            })
            connection.commit()
            return {"message": "Reservation added successfully"}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))



@app.get("/available_tables")
def available_tables(start_date: datetime, end_date: datetime):
    """Endpoint to fetch available tables within a specified time range."""
    sql = """
        SELECT * FROM TABLE(f_tables_availability_hours(:start_date, :end_date))
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, {'start_date': start_date, 'end_date': end_date})
                result = cursor.fetchall()
                tables = [{
                    'table_id': row[0],
                    'no_seats': row[1],
                    'table_type_id': row[2]
                } for row in result]
        return {'available_tables': tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))