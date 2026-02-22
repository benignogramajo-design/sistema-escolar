import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/fondo1.jpg";

const MisHorariosAlumno = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Mis Horarios</h2>
        <p>Visualización de los horarios de clase del alumno...</p>
      </div>
    </div>
  );
};
export default MisHorariosAlumno;