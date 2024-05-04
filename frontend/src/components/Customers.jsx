import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, TextField } from '@mui/material';

function CustomerTable() {
    const [customers, setCustomers] = useState([]);
    const [searchPhone, setSearchPhone] = useState('');
    const [sortAsc, setSortAsc] = useState(true);
    const navigate = useNavigate();

    // Fetch customers from the backend on component mount
    useEffect(() => {
        fetch('http://localhost:8000/customers')
            .then(response => response.json())
            .then(data => setCustomers(data.customers))
            .catch(error => console.error('Error fetching customers:', error));
    }, []);

    // Event handler for phone number search change
    const handleSearchChange = (event) => {
        setSearchPhone(event.target.value);
    };

    const handleSort = () => {
        setSortAsc(!sortAsc);
        setCustomers(customers.slice().sort((a, b) => {
            const lastNameA = a.lastname.toUpperCase(); // Use toUpperCase to make comparison case-insensitive
            const lastNameB = b.lastname.toUpperCase();
            if (lastNameA < lastNameB) return sortAsc ? 1 : -1;
            if (lastNameA > lastNameB) return sortAsc ? -1 : 1;
            return 0;
        }));
    };

    // Navigate to add customer form
    const handleAddCustomer = () => {
        navigate('/add-customer');
    };

    // Navigate to view reservations of a customer
    const handleCustomerClick = (customerId) => {
        navigate(`/reservations/${customerId}`);
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Customers
            </Typography>
            <Button variant="contained" color="primary" onClick={handleAddCustomer} style={{ marginRight: 20, marginBottom: 20 }}>
                Add New Customer
            </Button>
            <Button variant="outlined" onClick={handleSort} style={{ marginBottom: 20 }}>
                Sort {sortAsc ? 'Descending' : 'Ascending'}
            </Button>
            <TextField
                label="Search by Phone Number"
                variant="outlined"
                value={searchPhone}
                onChange={handleSearchChange}
                style={{ marginBottom: 20, marginLeft: 20 }}
            />
            <TableContainer component={Paper}>
                <Table aria-label="customer table">
                    <TableHead>
                        <TableRow>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.filter(customer =>
                            customer.phone_number.includes(searchPhone)
                        ).map((customer) => (
                            <TableRow key={customer.customer_id} hover>
                                <TableCell component="th" scope="row">{customer.firstname}</TableCell>
                                <TableCell>{customer.lastname}</TableCell>
                                <TableCell>{customer.phone_number}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={() => handleCustomerClick(customer.customer_id)}>
                                        View Reservations
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

export default CustomerTable;
