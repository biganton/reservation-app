import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../img/restaurant-background.png'
export default function Home() {
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
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1>REGISTRATION SYSTEM</h1>
     
     
    </div>
  );
}