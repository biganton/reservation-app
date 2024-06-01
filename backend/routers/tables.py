from fastapi import APIRouter, Depends, HTTPException, status
from db.database import get_db_connection
from models.schemas import TableUtilization
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/tables")
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/table_utilization", response_model=List[TableUtilization])
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

@router.get("/available_tables")
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

@router.get("/table_types")
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

@router.get("/choosen_table_id")
def choosen_table_id(type_name: str, start_date: datetime, end_date: datetime, guests_no: int):
    """Endpoint to fetch available tables within a specified time range for a specific number of guests."""
    sql = """
        SELECT * FROM TABLE(f_get_first_available_table_by_type2(:type_name, :start_date, :end_date, :guests_no))
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, {'type_name': type_name, 'start_date': start_date, 'end_date': end_date, 'guests_no': guests_no})
                result = cursor.fetchall()
                tables = [{'ctable_id': row[0]} for row in result]
        return {'choosen_table_id': tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    

