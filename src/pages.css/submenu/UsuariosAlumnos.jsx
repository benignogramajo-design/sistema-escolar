import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

const UsuariosAlumnos = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>USUARIOS DE ALUMNOS</h2>
      <div className="contenido-submenu">
        <p style={{ textAlign: "center" }}>Gestión de usuarios de alumnos (En construcción)</p>
      </div>
    </div>
  );
};

export default UsuariosAlumnos;