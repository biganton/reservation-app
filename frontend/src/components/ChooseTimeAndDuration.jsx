import React, { useState } from 'react';
import { TextField, MenuItem, Button } from '@mui/material';
import backgroundImage from '../img/time-background.png'; // Make sure the path is correct
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

function ChooseTimeAndDuration() {
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(1);
  const navigate = useNavigate();

  // Generate time options every 15 minutes
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 13; hour <= 23; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        const formattedMinute = minute < 10 ? `0${minute}` : minute;
        options.push(`${hour}:${formattedMinute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Check if all required fields are filled
  const isFormValid = () => time && duration;

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
          select
          label="Select Time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ marginBottom: '10px', backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '4px' }}
        >
          {timeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Duration (hours)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          helperText="Please select duration"
          fullWidth
          margin="normal"
          sx={{ marginBottom: '20px', backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '4px' }}
        >
          {[1, 2, 3].map((option) => (
            <MenuItem key={option} value={option}>
              {option} hour{option > 1 ? 's' : ''}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" color="secondary" fullWidth onClick={() => navigate('/choose-date')} style={{ marginBottom: '10px' }}>
          Back
        </Button>
        <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/next-path')} disabled={!isFormValid()}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default ChooseTimeAndDuration;