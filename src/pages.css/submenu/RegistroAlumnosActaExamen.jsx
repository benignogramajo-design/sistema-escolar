import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO ALUMNOS1.jpg";

const RegistroAlumnosActaExamen = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>ACTA DE EXAMEN</h2>
      <div className="contenido-submenu">
        <p>Módulo de acta de examen</p>
      </div>
    </div>
  );
};

export default RegistroAlumnosActaExamen;
