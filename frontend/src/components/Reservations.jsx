import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [showTodayReservations, setShowTodayReservations] = useState(false);
    const { customerId } = useParams();

    useEffect(() => {
        const url = customerId
            ? `http://localhost:8000/reservations/${customerId}`
            : showTodayReservations
                ? `http://localhost:8000/today`
                : 'http://localhost:8000/reservations';
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data);
                if (data.customers) {
                    setReservations(data.customers);
                } else if (Array.isArray(data)) {
                    setReservations(data);
                } else {
                    throw new Error('Data is not in expected array format');
                }
            })
            .catch(error => {
                console.error('Error fetching reservations:', error.message);
                setReservations([]);
            });
    }, [customerId, showTodayReservations]);

    const updateReservationStatus = (reservationId, newStatus) => {
        fetch(`http://localhost:8000/update_reservation_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reservation_id: reservationId, new_status: newStatus })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Update response:', data);
            const updatedReservations = reservations.map(reservation => {
                if (reservation.reservation_id === reservationId) {
                    return { ...reservation, status: newStatus };
                }
                return reservation;
            });
            setReservations(updatedReservations);
        })
        .catch(error => {
            console.error('Error updating reservation status:', error);
        });
    };

    const handleShowTodayReservations = () => {
        setShowTodayReservations(prevValue => !prevValue);
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                {customerId ? `Reservations for Customer ${customerId}` : "All Reservations"}
            </Typography>
            <Button variant="contained" onClick={handleShowTodayReservations}>
                {showTodayReservations ? `All Reservations` : "Show Today's Reservations"}
            </Button >
            <Button variant="contained" component={RouterLink} to="/make-reservation"> Make New Reservation </Button>
            <TableContainer component={Paper}>
                <Table aria-label="reservations table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Reservation ID</TableCell>
                            <TableCell>Customer Name</TableCell>
                            <TableCell>Table ID</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Number of Guests</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Notes</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reservations.map((reservation) => (
                            <TableRow key={reservation.reservation_id}>
                                <TableCell>{reservation.reservation_id}</TableCell>
                                <TableCell>{reservation.customer_name}</TableCell>
                                <TableCell>{reservation.table_id}</TableCell>
                                <TableCell>{reservation.start_date}</TableCell>
                                <TableCell>{reservation.end_date}</TableCell>
                                <TableCell>{reservation.no_guests}</TableCell>
                                <TableCell>{reservation.status}</TableCell>
                                <TableCell>{reservation.notes}</TableCell>
                                <TableCell>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={() => updateReservationStatus(reservation.reservation_id, 'P')}>
                                        Confirm
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button 
                                        variant="contained" 
                                        color="secondary" 
                                        onClick={() => updateReservationStatus(reservation.reservation_id, 'C')}>
                                        Cancel
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={() => updateReservationStatus(reservation.reservation_id, 'N')}>
                                        Set as New
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default Reservations;
