import './style.css';
import React, { useState } from "react";

export default function AdminLogin({ onSuccess, onCancel }) {
  const [pin, setPin] = useState("");

  const CORRECT_PIN = "1926";

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
    <div className="admin-container">
      <h2 className="admin-title">Admin Inloggning</h2>

      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Ange PIN-kod"
        className="admin-input"
        onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
      />

      <div className="flex gap-2">
        <button
          onClick={handleLogin}
          className="admin-button btn-login"
        >
          Logga in
        </button>
        <button
          onClick={onCancel}
          className="admin-button btn-cancel"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
