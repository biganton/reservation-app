import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import ChooseDateAndGuests from './components/ChooseDateAndGuests';
import ChooseTimeAndDuration from './components/ChooseTimeAndDuration';
import NavBar from './components/NavBar';
import Reservations from './components/Reservations';
function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/choose-date" element={<ChooseDateAndGuests />} />
        <Route path="/choose-time" element={<ChooseTimeAndDuration />} />
        <Route path="/reservations" element={<Reservations />} />

      </Routes>
    </Router>
  );
}

export default App;