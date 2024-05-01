import React, { useState } from 'react';
import { TextField, MenuItem, Button } from '@mui/material';
import backgroundImage from '../img/dining-background.png'; 
import { useNavigate } from 'react-router-dom'; 

function ChooseDateAndGuests() {
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(1);
  const navigate = useNavigate(); 

  const isFormValid = () => selectedDate && guests;

  return (
    <div style={{
      height: '100vh',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: '10px',
        padding: '20px',
        width: '90%',
        maxWidth: '500px'
      }}>
        <TextField
          type="date"
          label="Select date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          margin="normal"
        />
        <TextField
          select
          label="Number of guests"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          helperText="Please select number of guests"
          fullWidth
          margin="normal"
        >
          {[...Array(6).keys()].map((option) => (
            <MenuItem key={option + 1} value={option + 1}>
              {option + 1}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" color="secondary" fullWidth onClick={() => navigate('/')} style={{ marginBottom: '10px' }}>
          Back
        </Button>
        <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/choose-time')} disabled={!isFormValid()}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default ChooseDateAndGuests;