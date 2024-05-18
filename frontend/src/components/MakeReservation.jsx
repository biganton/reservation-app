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
    const [availableTables, setAvailableTables] = useState([]); // Initialize as empty array
    const [selectedTable, setSelectedTable] = useState(''); // Initialize with empty string
    const [time, setTime] = useState('18:00'); // Default time set to 18:00
    const [notes, setNotes] = useState(''); // Notes for reservation
    const [duration, setDuration] = useState(1); // Duration in hours

    useEffect(() => {
        fetch('http://localhost:8000/customers')
            .then(response => response.json())
            .then(data => setCustomers(data.customers))
            .catch(error => console.error('Error fetching customers:', error));
    }, []);

    useEffect(() => {
        if (step === 5) {
            fetchAvailableTables();
        }
    }, [step]); // Fetch available tables only when step changes to 5

    const fetchAvailableTables = async () => {
        const startDate = new Date(`${date}T${time}:00`);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + duration);

        const startLocalString = startDate.toLocaleString('sv-SE').replace(' ', 'T');
        const endLocalString = endDate.toLocaleString('sv-SE').replace(' ', 'T');

        console.log(`Start Date: ${startDate}, End Date: ${endDate}`);
        console.log(`Start Local String: ${startLocalString}, End Local String: ${endLocalString}`);

        const url = `http://localhost:8000/available_tables?start_date=${encodeURIComponent(startLocalString)}&end_date=${encodeURIComponent(endLocalString)}&guests_no=${guests}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setAvailableTables(data.available_tables || []);
        } catch (error) {
            console.error('Error fetching available tables:', error);
        }
    };

    const handleAddCustomer = () => {
        navigate('/add-customer');
    };

    const handleConfirmReservation = async () => {
        const startDate = new Date(`${date}T${time}:00`);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + duration);

        const reservation = {
            table_id: selectedTable,
            customer_id: selectedCustomer.customer_id,
            start_date: startDate.toLocaleString('sv-SE').replace(' ', 'T'),
            end_date: endDate.toLocaleString('sv-SE').replace(' ', 'T'),
            no_guests: guests,
            notes: notes
        };

        console.log(`Reservation Data:`, reservation);

        try {
            const response = await fetch('http://localhost:8000/add_reservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservation)
            });

            if (response.ok) {
                alert('Reservation added successfully');
                navigate('/');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.detail}`);
            }
        } catch (error) {
            console.error('Error adding reservation:', error);
            alert('Failed to add reservation');
        }
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
                    <InputLabel>Reservation Duration (hours)</InputLabel>
                    <Select
                        value={duration}
                        label="Reservation Duration"
                        onChange={(e) => setDuration(e.target.value)}
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
                                <MenuItem key={table.table_type_name} value={table.table_type_name}>
                                    Table {table.table_type_name}
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
                        {selectedCustomer?.firstname} on {date} {time} for {guests} guests at table {selectedTable} for {duration} hours.
                    </Typography>
                    <TextField
                        label="Notes"
                        variant="outlined"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        multiline
                        rows={4}
                        style={{ marginTop: 20, marginBottom: 20 }}
                    />
                    <Button onClick={handleConfirmReservation} color="primary" variant="contained" style={{ marginTop: 20 }}>
                        Confirm Reservation
                    </Button>
                </>
            )}
            {step > 1 && <Button onClick={() => setStep(step - 1)} style={{ marginTop: 20 }}>Back</Button>}
        </Container>
    );
}

export default MakeReservation;
