import React, { useState } from "react";

export default function AdminLogin({ onSuccess, onCancel }) {
  const [pin, setPin] = useState("");

  const CORRECT_PIN = "1926"; // BYT till din PIN

  const handleLogin = () => {
    if (pin === CORRECT_PIN) {
      localStorage.setItem("adminPinOK", "1");
      onSuccess();
    } else {
      alert("Fel PIN-kod!");
      setPin("");
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto mt-10 bg-white rounded shadow text-center">
      <h2 className="text-xl font-bold mb-4">Admin Inloggning</h2>

      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Ange PIN-kod"
        className="border p-2 w-full mb-4 rounded"
        onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
      />

      <div className="flex gap-2">
        <button
          onClick={handleLogin}
          className="bg-purple-600 text-white px-4 py-2 w-full rounded hover:bg-purple-700"
        >
          Logga in
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-200 px-4 py-2 w-full rounded hover:bg-gray-300"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
