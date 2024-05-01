import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import ChooseDateAndGuests from './components/ChooseDateAndGuests';
import ChooseTimeAndDuration from './components/ChooseTimeAndDuration';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/choose-date" element={<ChooseDateAndGuests />} />
        <Route path="/choose-time" element={<ChooseTimeAndDuration />} />

      </Routes>
    </Router>
  );
}

export default App;