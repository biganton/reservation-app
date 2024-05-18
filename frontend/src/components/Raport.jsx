import React, { useEffect, useState } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress } from '@mui/material';

function Raport() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/table_utilization')
            .then(response => response.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching table utilization data:', error);
                setLoading(false);
            });
    }, []);

    return (
        <Container component={Paper} style={{ padding: 20, marginTop: 20 }}>
            <Typography variant="h4" gutterBottom>Table Utilization Report</Typography>
            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table aria-label="table utilization report">
                        <TableHead>
                            <TableRow>
                                <TableCell>Table ID</TableCell>
                                <TableCell>No. of Seats</TableCell>
                                <TableCell>Type Name</TableCell>
                                <TableCell>Total Minutes Reserved</TableCell>
                                <TableCell>Utilization Percentage</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.table_id}>
                                    <TableCell>{row.table_id}</TableCell>
                                    <TableCell>{row.no_seats}</TableCell>
                                    <TableCell>{row.type_name}</TableCell>
                                    <TableCell>{row.total_minutes_reserved}</TableCell>
                                    <TableCell>{row.utilization_percentage}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}

export default Raport;
