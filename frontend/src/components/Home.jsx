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
      <h1>Welcome to Our Restaurant</h1>
      <p style={{ maxWidth: '600px', fontSize: '1.2rem', marginBottom: '20px' }}>
        Experience the best dining with us. Whether it's a cozy meal by the window,
        a romantic dinner under the stars on our terrace, or a lively gathering in the basement,
        we ensure your time here is memorable. Click below to choose your perfect spot!
      </p>
      <Link to="/choose-date" style={{ textDecoration: 'none' }}>
        <button style={{
          padding: '10px 20px',
          fontSize: '1.2rem',
          backgroundColor: '#FF6347',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Make a Reservation
        </button>
      </Link>
    </div>
  );
}