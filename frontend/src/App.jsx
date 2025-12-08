import React, { useEffect, useState } from "react";
import Room from "./components/Room";
import RoundSelector from "./components/RoundSelector";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);

  // admin state
  const [showAdmin, setShowAdmin] = useState(false);      // visar admin-vyn (login eller panel)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    localStorage.getItem("adminPinOK") === "1"
  );

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    fetch("http://10.136.34.229:3000/api/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error("Kunde inte hämta rooms:", err));
  };

  const generatePDF = () => {
    if (!currentRound) return alert("Välj en runda först!");
    window.open(`http://10.136.34.229:3000/api/report/${currentRound}`, "_blank");
  };

  const openAdmin = () => {
    // visa admin-modal (login eller panel beroende på auth)
    setShowAdmin(true);
  };

  const closeAdmin = () => {
    setShowAdmin(false);
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminPinOK");
    setIsAdminAuthenticated(false);
    setShowAdmin(false);
  };

  // If admin is authenticated and showAdmin true => show AdminPanel
  // If admin not authenticated and showAdmin true => show AdminLogin

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Salskollen</h1>

        <div className="flex items-center gap-2">
          {isAdminAuthenticated && (
            <button
              onClick={() => setShowAdmin(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Admin
            </button>
          )}

          {!isAdminAuthenticated && (
            <button
              onClick={openAdmin}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
            >
              Admin
            </button>
          )}

          {isAdminAuthenticated && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              title="Logga ut admin"
            >
              Logga ut
            </button>
          )}
        </div>
      </div>

      {showAdmin ? (
        isAdminAuthenticated ? (
          <AdminPanel onClose={() => { closeAdmin(); fetchRooms(); }} />
        ) : (
          <AdminLogin
            onSuccess={() => {
              handleLoginSuccess();
            }}
            onCancel={() => {
              closeAdmin();
            }}
          />
        )
      ) : (
        <>
          <RoundSelector onRoundSelect={setCurrentRound} />
          <div className="flex justify-center mb-6">
            <button
              onClick={generatePDF}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Generera PDF
            </button>
          </div>

          {rooms.map((room) => (
            <Room key={room.id} room={room} roundId={currentRound} />
          ))}
        </>
      )}
    </div>
  );
}
