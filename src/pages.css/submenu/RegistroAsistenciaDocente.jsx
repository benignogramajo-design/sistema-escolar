import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo DOCENTES1.jpg";

const RegistroAsistenciaDocente = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>REGISTRO DE ASISTENCIA DOCENTE</h2>
      <div className="contenido-submenu">
        <p>Módulo para el registro de asistencia docente (En construcción).</p>
      </div>
    </div>
  );
};

export default RegistroAsistenciaDocente;