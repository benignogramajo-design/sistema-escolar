import React from "react";
import "../styles/navbar.css";

const NavBar = ({ goBack, goHome }) => {
  return (
    <div className="navbar">
      <button className="nav-btn back-btn" onClick={goBack} title="Volver atrás">
        ← Anterior
      </button>
      <button className="nav-btn home-btn" onClick={goHome} title="Ir a página principal">
        🏠 Inicio
      </button>
    </div>
  );
};

export default NavBar;
