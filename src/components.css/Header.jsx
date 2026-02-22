// src/components/Header.jsx
import React, { useState, useRef } from "react";
import MenuDrawer from "./MenuDrawer";
import "../styles/header.css";
import logo from "../assets.css/logos/Logo.png";
import iconLogout from "../assets.css/iconos/logout.png";

const Header = ({ user, navigate, onLoginClick, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 300); // 300ms de retraso para permitir bajar al menú
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" className="header-logo" />
        <div className="header-text">
          <h1>Escula Secundaria Gobernador Garmendia</h1>
          <p>CUE: 9001717/00 - Av. de la Soja S/N° - Gobernador Garmendia - Burruyacu</p>
          <p> escuelasecgarmendia@gmail.com</p>
        </div>
      </div>

      <div className="header-right">
        {user ? (
          <>
            <div className="user-info">
              <span>{user.apellido} {user.nombre}</span>
              <small>{user.roles && user.roles[0]}</small>
            </div>
            <button className="btn-logout" onClick={onLogout} title="Cerrar Sesión">
              <img src={iconLogout} alt="Cerrar sesión" />
            </button>
          </>
        ) : (
          <button className="btn-logout" onClick={onLoginClick} style={{ width: 'auto', padding: '0 15px', fontSize: '14px' }}>
            INICIAR SESIÓN
          </button>
        )}

        <div
          className="menu-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ position: "relative", display: "inline-block" }}
        >
          <button className="btn-menu">☰</button>
          {menuOpen && <MenuDrawer user={user || { apellido: "Invitado", nombre: "", rol: "" }} navigate={navigate} onClose={handleMenuClose} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
