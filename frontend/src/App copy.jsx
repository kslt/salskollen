import React, { useEffect, useState } from 'react';
import Room from './components/Room';
import RoundSelector from './components/RoundSelector';

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);

  const fetchRooms = () => {
    fetch('http://10.136.34.229:3000/api/rooms')
      .then(res => res.json())
      .then(data => setRooms(data));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const generatePDF = () => {
    if (!currentRound) return alert('Välj en runda först!');
    window.open(`http://10.136.34.229:3000/api/report/${currentRound}`, '_blank');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Salskollen</h1>

      <RoundSelector onRoundSelect={setCurrentRound} />

      <button
        onClick={generatePDF}
        className="bg-purple-600 text-white px-4 py-2 rounded mb-6 hover:bg-purple-700 transition-colors"
      >
        Generera PDF
      </button>

      {rooms.map(room => (
        <Room key={room.id} room={room} roundId={currentRound} />
      ))}
    </div>
  );
}
