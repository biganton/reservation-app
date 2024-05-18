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

@app.get("/today")
def read_today_reservations():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM VW_TODAY_RESERVATIONS")
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
            # return {"today reservations": reservations_list}
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
            cursor.callproc('DBMS_OUTPUT.ENABLE', (None,))
            cursor.execute(sql, customer.dict())

            messages = []
            status_var = cursor.var(int)
            line_var = cursor.var(str)
            while True:
                cursor.callproc('DBMS_OUTPUT.GET_LINE', (line_var, status_var))
                if status_var.getvalue() != 0:
                    break
                messages.append(line_var.getvalue())

            connection.commit()
            return {"message": messages}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    

class Reservation(BaseModel):
    table_id: int
    customer_id: int
    start_date: datetime
    end_date: datetime
    no_guests: int
    notes: str = None


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
            cursor.callproc('DBMS_OUTPUT.ENABLE', (None,))
            cursor.execute(sql, reservation.dict())

            messages = []
            status_var = cursor.var(int)
            line_var = cursor.var(str)
            while True:
                cursor.callproc('DBMS_OUTPUT.GET_LINE', (line_var, status_var))
                if status_var.getvalue() != 0:
                    break
                messages.append(line_var.getvalue())

            connection.commit()
            return {"message": messages}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/available_tables")
def available_tables(start_date: datetime, end_date: datetime, guests_no: int):
    """Endpoint to fetch available tables within a specified time range for a specific number of guests."""
    sql = """
        SELECT * FROM TABLE(f_tables_availability_hours(:start_date, :end_date, :guests_no))
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, {'start_date': start_date, 'end_date': end_date, 'guests_no': guests_no})
                result = cursor.fetchall()
                tables = [{'table_type_name': row[0]} for row in result]
        return {'available_tables': tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    


class TableType(BaseModel):
    table_type_id: int

@app.get("/available-table-types/", response_model=List[TableType])
def get_available_table_types(start_date: datetime, end_date: datetime, db=Depends(get_db_connection)):
    try:
        with db.cursor() as cursor:
            start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
            end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(f"""
                SELECT * FROM TABLE(f_table_type_availability(
                    TO_TIMESTAMP('{start_date_str}', 'YYYY-MM-DD HH24:MI:SS'), 
                    TO_TIMESTAMP('{end_date_str}', 'YYYY-MM-DD HH24:MI:SS')
                ))
            """)
            result = cursor.fetchall()
            return [TableType(table_type_id=row[0]) for row in result]
    except cx_Oracle.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    

class ReservationStatusUpdate(BaseModel):
    reservation_id: int
    new_status: str

@app.post("/update_reservation_status")
def update_reservation_status(update: ReservationStatusUpdate):
    valid_statuses = {'C', 'N', 'P'}  
    if update.new_status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status provided.")

    sql = """
    BEGIN
        p_modify_reservation_status(
            p_reservation_id => :reservation_id,
            p_new_status => :new_status
        );
    END;
    """
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor()
            cursor.execute(sql, {
                'reservation_id': update.reservation_id,
                'new_status': update.new_status
            })
            connection.commit()
            return {"message": "Reservation status updated successfully"}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    




class TableUtilization(BaseModel):
    table_id: int
    no_seats: int
    type_name: str
    total_minutes_reserved: int
    utilization_percentage: float

@app.get("/table_utilization", response_model=List[TableUtilization])
def get_table_utilization():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT TABLE_ID, NO_SEATS, TYPE_NAME, TOTAL_MINUTES_RESERVED, UTILIZATION_PERCENTAGE FROM VIEW_TABLE_UTILIZATION")
                rows = cursor.fetchall()
                table_utilization_data = [
                    TableUtilization(
                        table_id=row[0],
                        no_seats=row[1],
                        type_name=row[2],
                        total_minutes_reserved=row[3],
                        utilization_percentage=row[4]
                    )
                    for row in rows
                ]
        return table_utilization_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))