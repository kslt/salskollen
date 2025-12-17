import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function AdminPanel({ onClose }) {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newGroupName, setNewGroupName] = useState({});
  const [newCheckpointName, setNewCheckpointName] = useState({});
  const [rounds, setRounds] = useState([]);
  const [activeView, setActiveView] = useState('structure');

  const fetchRounds = async () => {
    const res = await fetch('http://10.136.34.229:3000/api/admin/rounds');
    const data = await res.json();
    setRounds(data);
  };

  const fetchRooms = () => {
    fetch('http://10.136.34.229:3000/api/admin/rooms')
      .then(res => res.json())
      .then(setRooms);
  };

  useEffect(() => {
    fetchRooms();
    fetchRounds();
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

  // ===== Grupper =====
  const addGroup = async (roomId) => {
    const name = newGroupName[roomId];
    if (!name) return alert('Ange namn för gruppen!');
    await fetch('http://10.136.34.229:3000/api/admin/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, name })
    });
    setNewGroupName({ ...newGroupName, [roomId]: '' });
    fetchRooms();
  };

  const updateGroup = async (id, name) => {
    await fetch(`http://10.136.34.229:3000/api/admin/group/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    fetchRooms();
  };

  const deleteGroup = async (id) => {
    if (!window.confirm('Ta bort gruppen?')) return;
    await fetch(`http://10.136.34.229:3000/api/admin/group/${id}`, { method: 'DELETE' });
    fetchRooms();
  };

  // ===== Checkpoints =====
  const addCheckpoint = async (groupId) => {
    const name = newCheckpointName[groupId];
    if (!name) return alert('Ange namn för checkpoint!');
    await fetch('http://10.136.34.229:3000/api/admin/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: groupId, name })
    });
    setNewCheckpointName({ ...newCheckpointName, [groupId]: '' });
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

  // ===== Drag & Drop =====
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const cpId = parseInt(draggableId);

    const sourceGroupId = parseInt(source.droppableId.split('-')[1]);
    const destGroupId = parseInt(destination.droppableId.split('-')[1]);

    await fetch(`http://10.136.34.229:3000/api/admin/checkpoint/${cpId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: destGroupId, position: destination.index })
    });

    fetchRooms();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('structure')}
            className={`px-4 py-2 rounded ${
              activeView === 'structure'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            Salar och kontrollpunkter
          </button>

          <button
            onClick={() => setActiveView('rounds')}
            className={`px-4 py-2 rounded ${
              activeView === 'rounds'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            Ta bort genomförda rundor
          </button>
        </div>
        <button
          onClick={onClose}
          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          Stäng
        </button>
      </div>
      {activeView === 'structure' && (
        <>
          {/* Lägg till rum */}
            <div className="flex gap-2 mb-6">
              <input
                placeholder="Nytt rum"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                className="border px-3 py-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button onClick={addRoom} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                Lägg till rum
              </button>
            </div>

            {rooms.map(room => (
              <div key={room.id} className="mb-8 bg-white rounded-lg shadow p-4">
                <div className="flex items-center mb-4 gap-2">
                  <input
                    value={room.name}
                    onChange={e => updateRoom(room.id, e.target.value)}
                    className="border px-3 py-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button onClick={() => deleteRoom(room.id)} className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700">Ta bort rum</button>
                </div>

                {/* Lägg till grupp */}
                <div className="flex gap-2 mb-4">
                  <input
                    placeholder="Ny grupp"
                    value={newGroupName[room.id] || ''}
                    onChange={e => setNewGroupName({ ...newGroupName, [room.id]: e.target.value })}
                    className="border px-3 py-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button onClick={() => addGroup(room.id)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Lägg till grupp</button>
                </div>

                {/* Drag & Drop för checkpoints */}
                <DragDropContext onDragEnd={onDragEnd}>
                  {room.checkpointGroups?.map(group => (
                    <Droppable key={group.id} droppableId={`group-${group.id}`}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-center mb-2 justify-between">
                            <input
                              value={group.name}
                              onChange={e => updateGroup(group.id, e.target.value)}
                              className="border px-3 py-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400 mr-2"
                            />
                            <button onClick={() => deleteGroup(group.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Ta bort</button>
                          </div>

                          <ul>
                            {group.checkpoints?.map((cp, index) => (
                              <Draggable key={cp.id} draggableId={`${cp.id}`} index={index}>
                                {(provided, snapshot) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`flex items-center mb-1 p-2 rounded ${snapshot.isDragging ? 'bg-blue-100' : 'bg-white'} border border-gray-200`}
                                  >
                                    <input
                                      value={cp.name}
                                      onChange={e => updateCheckpoint(cp.id, e.target.value)}
                                      className="border px-2 py-1 rounded flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <button onClick={() => deleteCheckpoint(cp.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Ta bort</button>
                                  </li>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>

                          {/* Lägg till checkpoint */}
                          <div className="flex gap-2 mt-2">
                            <input
                              placeholder="Ny checkpoint"
                              value={newCheckpointName[group.id] || ''}
                              onChange={e => setNewCheckpointName({ ...newCheckpointName, [group.id]: e.target.value })}
                              className="border px-3 py-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <button onClick={() => addCheckpoint(group.id)} className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700">Lägg till checkpoint</button>
                          </div>
                        </div>
                      )}
                    </Droppable>
                  ))}
                </DragDropContext>
              </div>
            ))}
        </>
      )}
      {activeView === 'rounds' && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-2xl font-bold mb-4">Tidigare rundor</h2>

          {rounds.length === 0 && (
            <p className="text-gray-500">Inga rundor finns ännu.</p>
          )}

          <ul className="divide-y">
            {rounds.map(round => (
              <li key={round.id} className="flex justify-between items-center py-2">
                <div>
                  <div className="font-semibold">
                    {round.name || 'Namnlös runda'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(round.created_at).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!window.confirm('Ta bort denna runda?')) return;
                    await fetch(`http://10.136.34.229:3000/api/admin/round/${round.id}`, {
                      method: 'DELETE'
                    });
                    fetchRounds();
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
