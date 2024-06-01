from fastapi import APIRouter, Depends, HTTPException, status
from db.database import get_db_connection
from models.schemas import Customer
from typing import List

router = APIRouter()

@router.get("/customers")
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add_customer")
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
