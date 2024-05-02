import React, { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function Reservations() {
    const [reservations, setReservations] = useState([
        { id: 1, date: '2024-05-01', status: 'confirmed', customer: 'John Doe' },
        { id: 2, date: '2024-05-02', status: 'pending', customer: 'Jane Smith' },
        { id: 3, date: '2024-05-03', status: 'cancelled', customer: 'Alice Johnson' },
    ]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');

    // Function to handle sorting
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        setReservations((prevReservations) => {
            const sortedReservations = [...prevReservations].sort((a, b) => {
                if (a[key] < b[key]) {
                    return direction === 'ascending' ? -1 : 1;
                }
                if (a[key] > b[key]) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
            return sortedReservations;
        });
    };

    // Function to filter reservations based on search term
    const handleSearch = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    // Filter reservations based on search term
    const filteredReservations = reservations.filter(reservation => 
        reservation.date.includes(searchTerm) ||
        reservation.status.toLowerCase().includes(searchTerm) ||
        reservation.customer.toLowerCase().includes(searchTerm)
    );

    return (
        <div>
            <TextField
                label="Search Reservations"
                variant="outlined"
                style={{ margin: '20px 0' }}
                fullWidth
                onChange={handleSearch}
            />
            <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => alert('Implement opening the new reservation form.')}
            >
                New Reservation
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell onClick={() => handleSort('date')}>Date</TableCell>
                            <TableCell onClick={() => handleSort('status')}>Status</TableCell>
                            <TableCell onClick={() => handleSort('customer')}>Customer</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredReservations.map((reservation) => (
                            <TableRow key={reservation.id}>
                                <TableCell>{reservation.date}</TableCell>
                                <TableCell>{reservation.status}</TableCell>
                                <TableCell>{reservation.customer}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default Reservations;
