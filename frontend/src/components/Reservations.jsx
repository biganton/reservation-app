import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button } from '@mui/material';

function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [showTodayReservations, setShowTodayReservations] = useState(false);
    const { customerId } = useParams(); // This will be undefined if no ID is in the URL

    useEffect(() => {
        const url = customerId
            ? `http://localhost:8000/reservations/${customerId}`
            : showTodayReservations
                ? `http://localhost:8000/today`
                : 'http://localhost:8000/reservations';
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    // If not OK, throw an error to jump to the catch block
                    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data); // Debugging: log the fetched data
                // Check if data contains the expected array format
                if (data.customers) { // Make sure to access the correct key if the response is wrapped in an object
                    setReservations(data.customers);
                } else if (Array.isArray(data)) {
                    setReservations(data);
                } else {
                    throw new Error('Data is not in expected array format');
                }
            })
            .catch(error => {
                console.error('Error fetching reservations:', error.message);
                setReservations([]); // Set to empty array on error
            });
    }, [customerId, showTodayReservations]);

    const handleShowTodayReservations = () => {
        setShowTodayReservations(prevValue => !prevValue);
        // navigate(`/reservations/today`);
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                {customerId ? `Reservations for Customer ${customerId}` : "All Reservations"}
            </Typography>
            <Button variant="contained" onClick={handleShowTodayReservations}>
                {showTodayReservations ? `All Reservations` : "Show Today's Reservations"}
                
            </Button>
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
                                        onClick={() => handleCustomerClick(customer.customer_id)}>
                                        Confirm
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={() => handleCustomerClick(customer.customer_id)}>
                                        Cancel
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
