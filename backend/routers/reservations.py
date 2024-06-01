from fastapi import APIRouter, Depends, HTTPException, status
from db.database import get_db_connection
from models.schemas import Reservation, ReservationStatusUpdate
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/reservations")
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

@router.get("/reservations/{customer_id}")
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


@router.get("/today")
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



@router.post("/add_reservation")
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

@router.post("/update_reservation_status")
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
    

