import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const SeguimientoPorAlumno = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Seguimiento por Alumno</h2>
        <p>Módulo para el seguimiento individual de alumnos...</p>
      </div>
    </div>
  );
};
export default SeguimientoPorAlumno;