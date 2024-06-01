from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class Customer(BaseModel):
    firstName: str
    lastName: str
    phoneNumber: str
    email: str

class Reservation(BaseModel):
    table_id: int
    customer_id: int
    start_date: datetime
    end_date: datetime
    no_guests: int
    notes: Optional[str] = None

class ReservationStatusUpdate(BaseModel):
    reservation_id: int
    new_status: str

class TableUtilization(BaseModel):
    table_id: int
    no_seats: int
    type_name: str
    total_minutes_reserved: int
    utilization_percentage: float
