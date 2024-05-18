import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import NavBar from './components/NavBar';
import Reservations from './components/Reservations';
import AddCustomer from './components/AddCustomer';
import Customers from './components/Customers';
import MakeReservation from './components/MakeReservation';
import Raport from './components/Raport';
function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/add-customer" element={<AddCustomer />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/reservations/:customerId" element={<Reservations />} />
        <Route path="/reservations/today" element={<Reservations />} />
        <Route path="/make-reservation" element={<MakeReservation />} />
        <Route path="/raport" element={<Raport />} />




      </Routes>
    </Router>
  );
}

export default App;