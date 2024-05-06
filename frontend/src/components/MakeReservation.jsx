import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

function MakeReservation() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchPhone, setSearchPhone] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
    const [guests, setGuests] = useState(1);
    const [availableTables, setAvailableTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [time, setTime] = useState('16:00'); // Default time set to 16:00


    useEffect(() => {
        fetch('http://localhost:8000/customers')
            .then(response => response.json())
            .then(data => setCustomers(data.customers))
            .catch(error => console.error('Error fetching customers:', error));
    }, []);

    const handleAddCustomer = () => {
        navigate('/add-customer');
    };

    

    const filteredCustomers = customers.filter(customer => customer.phone_number.includes(searchPhone));

    return (
        <Container component={Paper} style={{ padding: 20, marginTop: 20 }}>
            <Typography variant="h4" gutterBottom>Make a Reservation</Typography>
            {step === 1 && (
                <>
                    <TextField
                        label="Search Customer by Phone"
                        variant="outlined"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        style={{ marginBottom: 20 }}
                    />
                    <Button variant="contained" color="primary" onClick={handleAddCustomer} style={{ marginBottom: 20 }}>
                        Add New Customer
                    </Button>
                    <TableContainer component={Paper}>
                        <Table aria-label="customer table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>First Name</TableCell>
                                    <TableCell>Last Name</TableCell>
                                    <TableCell>Phone Number</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Select</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCustomers.map((customer) => (
                                    <TableRow key={customer.customer_id} hover>
                                        <TableCell>{customer.firstname}</TableCell>
                                        <TableCell>{customer.lastname}</TableCell>
                                        <TableCell>{customer.phone_number}</TableCell>
                                        <TableCell>{customer.email}</TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="contained" 
                                                color="primary" 
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setStep(2);
                                                }}>
                                                Select
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
            
            {step === 2 && (
                <>
                    <TextField
                        type="date"
                        label="Reservation Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        style={{ marginBottom: 20 }}
                    />
                    <TextField
                        type="time"
                        label="Reservation Time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                            step: 300, // Sets the step to 300 seconds (5 minutes)
                            min: "16:00", // Minimum time set to 16:00
                            max: "21:00" // Maximum time set to 21:00
                        }}
                        style={{ marginBottom: 20 }}
                    />
                    <Button onClick={() => setStep(3)} style={{ marginTop: 20 }}>Next</Button>
                </>

            )}
            {step === 3 && (
                <FormControl fullWidth style={{ marginTop: 20 }}>
                    <InputLabel>Number of Guests</InputLabel>
                    <Select
                        value={guests}
                        label="Number of Guests"
                        onChange={(e) => setGuests(e.target.value)}
                    >
                        {[1, 2, 3, 4, 5, 6].map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                    <Button onClick={() => setStep(4)} style={{ marginTop: 20 }}>Next</Button>
                </FormControl>
            )}
            {step === 4 && (
                <FormControl fullWidth style={{ marginTop: 20 }}>
                    <InputLabel>Reservation duration</InputLabel>
                    <Select
                        value={guests}
                        label="Reservation duration"
                        onChange={(e) => setGuests(e.target.value)}
                    >
                        {[1, 2, 3].map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                    <Button onClick={() => setStep(5)} style={{ marginTop: 20 }}>Next</Button>
                </FormControl>
            )}
            {step === 5 && (
                <>
                    <FormControl fullWidth style={{ marginTop: 20 }}>
                        <InputLabel>Select Table</InputLabel>
                        <Select
                            value={selectedTable}
                            label="Select Table"
                            onChange={(e) => setSelectedTable(e.target.value)}
                        >
                            {availableTables.map(table => (
                                <MenuItem key={table.table_id} value={table.table_id}>
                                    Table {table.table_id} - Seats {table.no_seats}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button onClick={() => setStep(6)} style={{ marginTop: 20 }}>Next</Button>
                </>
            )}
            {step === 6 && (
                <>
                    <Typography style={{ marginTop: 20 }}>
                        Confirm Reservation:
                        {selectedCustomer.firstname} on {date} {time} for {guests} guests at table {selectedTable}.
                    </Typography>
                    <Button onClick={() => console.log('Reservation Confirmed')} color="primary" variant="contained" style={{ marginTop: 20 }}>
                        Confirm Reservation
                    </Button>
                </>
            )}
            {step > 1 && <Button onClick={() => setStep(step - 1)} style={{ marginTop: 20 }}>Back</Button>}
        </Container>
    );
}

export default MakeReservation;
