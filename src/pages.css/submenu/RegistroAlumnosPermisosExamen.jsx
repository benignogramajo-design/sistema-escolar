import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo REGISTRO ALUMNOS1.jpg";

const RegistroAlumnosPermisosExamen = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>PERMISOS DE EXAMEN</h2>
      <div className="contenido-submenu">
        <p>Módulo de permisos de examen</p>
      </div>
    </div>
  );
};

export default RegistroAlumnosPermisosExamen;
