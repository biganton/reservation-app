from fastapi import FastAPI, Depends, HTTPException, status
import cx_Oracle
from contextlib import contextmanager
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware



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
    

# @app.get("/customer_reservations")
# def read_reservations():
#     try:
#         with get_db_connection() as connection:
#             with connection.cursor() as cursor:
#                 cursor.execute("""
#                     select * from table(F_CUSTOMER_RESERVATION_HISTORY(3))
#                 """)
#                 customers = cursor.fetchall()
#                 customers_list = [
#                     {
#                         "reservation_id": row[0],
#                         "table_id": row[1],
#                         "lastname": row[2],
#                         "phone_number": row[3],
#                         "email": row[4]
#                     }
#                     for row in customers
#                 ]
#         return {"customers": customers_list}
#     except HTTPException as e:
#         return e.detail
    
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
    

