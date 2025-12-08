import React, { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newCheckpointName, setNewCheckpointName] = useState({}); // roomId -> namn

  const fetchRooms = () => {
    fetch('http://10.136.34.229:3000/api/admin/rooms')
      .then(res => res.json())
      .then(setRooms);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ===== Rum =====
  const addRoom = async () => {
    if (!newRoomName) return alert('Ange ett namn för rummet!');
    await fetch('http://10.136.34.229:3000/api/admin/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRoomName })
    });
    setNewRoomName('');
    fetchRooms();
  };

  const updateRoom = async (id, name) => {
    await fetch(`http://10.136.34.229:3000/api/admin/room/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    fetchRooms();
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('Ta bort rummet?')) return;
    await fetch(`http://10.136.34.229:3000/api/admin/room/${id}`, { method: 'DELETE' });
    fetchRooms();
  };

  // ===== Checkpoints =====
  const addCheckpoint = async (roomId) => {
    const name = newCheckpointName[roomId];
    if (!name) return alert('Ange namn för checkpoint!');
    await fetch('http://10.136.34.229:3000/api/admin/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, name })
    });
    setNewCheckpointName({ ...newCheckpointName, [roomId]: '' });
    fetchRooms();
  };

  const updateCheckpoint = async (id, name) => {
    await fetch(`http://10.136.34.229:3000/api/admin/checkpoint/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    fetchRooms();
  };

  const deleteCheckpoint = async (id) => {
    if (!window.confirm('Ta bort checkpoint?')) return;
    await fetch(`http://10.136.34.229:3000/api/admin/checkpoint/${id}`, { method: 'DELETE' });
    fetchRooms();
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* Lägg till nytt rum */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <input
          placeholder="Nytt rum"
          value={newRoomName}
          onChange={e => setNewRoomName(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-auto flex-1"
        />
        <button
          onClick={addRoom}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Lägg till rum
        </button>
      </div>

      {/* Lista rum och checkpoints */}
      {rooms.map(room => (
        <div key={room.id} className="mb-6 p-4 sm:p-6 bg-white rounded shadow overflow-x-auto">
          {/* Rum */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
            <input
              value={room.name}
              onChange={e => updateRoom(room.id, e.target.value)}
              className="border px-2 py-1 rounded flex-1 w-full"
            />
            <button
              onClick={() => deleteRoom(room.id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Ta bort rum
            </button>
          </div>

          {/* Checkpoints */}
          <ul className="mb-2 w-full overflow-x-auto">
            {room.checkpoints.map(cp => (
              <li key={cp.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-1">
                <input
                  value={cp.name}
                  onChange={e => updateCheckpoint(cp.id, e.target.value)}
                  className="border px-2 py-1 rounded flex-1 w-full"
                />
                <button
                  onClick={() => deleteCheckpoint(cp.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>

          {/* Lägg till ny checkpoint */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              placeholder="Ny checkpoint"
              value={newCheckpointName[room.id] || ''}
              onChange={e => setNewCheckpointName({ ...newCheckpointName, [room.id]: e.target.value })}
              className="border px-2 py-1 rounded flex-1 w-full"
            />
            <button
              onClick={() => addCheckpoint(room.id)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Lägg till checkpoint
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
