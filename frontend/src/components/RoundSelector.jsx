import React, { useEffect, useState } from 'react';

export default function RoundSelector({ onRoundSelect }) {
  const [rounds, setRounds] = useState([]);
  const [newRoundName, setNewRoundName] = useState('');

  const fetchRounds = () => {
    fetch('http://10.136.34.229:3000/api/rounds')
      .then(res => res.json())
      .then(setRounds);
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  const createRound = () => {
    if (!newRoundName) return alert('Ange namn på runda!');
    fetch('http://10.136.34.229:3000/api/rounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRoundName }),
    })
      .then(res => res.json())
      .then(data => {
        fetchRounds();
        setNewRoundName('');
        onRoundSelect(data.id);
      });
  };

  return (
    <div className="mb-6 flex items-center space-x-2">
      <select onChange={e => onRoundSelect(e.target.value)} className="border px-2 py-1 rounded flex-1">
        <option value="">Välj en tidigare runda eller skapa en ny</option>
        {rounds.map(r => (
          <option key={r.id} value={r.id}>{r.name || r.created_at}</option>
        ))}
      </select>
      <input
        placeholder="Ange rundans namn, tex datum eller salsnamn"
        value={newRoundName}
        onChange={e => setNewRoundName(e.target.value)}
        className="border px-2 py-1 rounded flex-1"
      />
      <button onClick={createRound} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Skapa ny runda</button>
    </div>
  );
}
