import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo GABINETE.jpg";

const GabineteDocentes = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>DOCENTES</h2>
      <div className="contenido-submenu">
        <p>Módulo de Docentes de Gabinete.</p>
      </div>
    </div>
  );
};

export default GabineteDocentes;