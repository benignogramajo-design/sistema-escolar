import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo GABINETE.jpg";

const GabineteDerivaciones = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>DERIVACIONES</h2>
      <div className="contenido-submenu">
        <p>Módulo de Derivaciones de Gabinete.</p>
      </div>
    </div>
  );
};

export default GabineteDerivaciones;