import React, { useState, useEffect } from 'react';

export default function Room({ room, roundId }) {
  const [checks, setChecks] = useState({}); // checkpoint_id -> {status, reason}

  useEffect(() => {
    if (!roundId) {
      setChecks({});
      return;
    }
    fetch(`http://10.136.34.229:3000/api/checks?round_id=${roundId}`)
      .then(res => res.json())
      .then(data => {
        const obj = {};
        data.forEach(c => {
          obj[c.checkpoint_id] = { status: c.status, reason: c.reason || '' };
        });
        setChecks(obj);
      });
  }, [roundId]);

  const updateCheck = (checkpoint_id, status, reason) => {
    setChecks(prev => ({ ...prev, [checkpoint_id]: { status, reason } }));
    if (!roundId) return;
    fetch('http://10.136.34.229:3000/api/checks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkpoint_id, status, reason, round_id: roundId }),
    });
  };

  return (
    <div className="mb-6 p-4 bg-white rounded shadow overflow-x-auto">
      <h2 className="text-xl font-bold mb-2">{room.name}</h2>
      {room.checkpointGroups.map(group => (
        <div key={group.id} className="mb-4">
          <h3 className="font-semibold">{group.name}</h3>
          {group.checkpoints.map(cp => (
            <div key={cp.id} className="flex items-center mb-2">
              <span className="flex-1">{cp.name}</span>
              <button
                className={`px-2 py-1 mr-2 rounded ${checks[cp.id]?.status==='ok'?'bg-green-600':'bg-gray-300'}`}
                onClick={() => updateCheck(cp.id, 'ok', checks[cp.id]?.reason||'')}
              >✔</button>
              <button
                className={`px-2 py-1 rounded ${checks[cp.id]?.status==='fail'?'bg-red-600':'bg-gray-300'}`}
                onClick={() => {
                  const reason = prompt('Ange orsak:') || '';
                  updateCheck(cp.id, 'fail', reason);
                }}
              >✖</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
