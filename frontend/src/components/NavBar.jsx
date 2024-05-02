import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink

function NavBar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          MyRestaurantApp
        </Typography>
        <Button color="inherit" component={RouterLink} to="/reservations">
          Reservations
        </Button>
        <Button color="inherit" component={RouterLink} to="/customers">
          Customers
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
