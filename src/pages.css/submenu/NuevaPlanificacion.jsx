import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const NuevaPlanificacion = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>NUEVA PLANIFICACIÓN</h2>
      <div className="contenido-submenu">
        <p>Módulo para crear una nueva planificación.</p>
      </div>
    </div>
  );
};

export default NuevaPlanificacion;