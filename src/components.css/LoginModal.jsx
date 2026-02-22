import React, { useState } from "react";

const LoginModal = ({ onLogin, onClose, error }) => {
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(apellido, dni);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white", padding: "30px", borderRadius: "10px", width: "350px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)", textAlign: "center"
      }}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Iniciar Sesión</h2>
        
        {error && (
          <div style={{ backgroundColor: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "5px", marginBottom: "15px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="text"
            placeholder="Apellido (Usuario)"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            required
          />
          <input
            type="password"
            placeholder="DNI (Contraseña)"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            required
          />
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "10px" }}>
            <button type="submit" style={{ padding: "10px 20px", backgroundColor: "blue", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Ingresar</button>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", backgroundColor: "gray", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;