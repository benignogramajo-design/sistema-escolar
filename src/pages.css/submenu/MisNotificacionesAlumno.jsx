import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/fondo1.jpg";

const MisNotificacionesAlumno = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>MIS NOTIFICACIONES</h2>
      <div className="contenido-submenu">
        <p>Módulo para ver notificaciones del alumno.</p>
      </div>
    </div>
  );
};

export default MisNotificacionesAlumno;