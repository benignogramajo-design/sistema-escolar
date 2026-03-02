import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

const SeguimientoF501 = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>SEGUIMIENTO DE F501</h2>
      <div className="contenido-submenu">
        <p>Módulo para el seguimiento de F501.</p>
      </div>
    </div>
  );
};

export default SeguimientoF501;