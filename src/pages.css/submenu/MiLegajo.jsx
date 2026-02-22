import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/fondo1.jpg";

const MiLegajo = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Mi Legajo</h2>
        <p>Información del legajo del alumno...</p>
      </div>
    </div>
  );
};
export default MiLegajo;