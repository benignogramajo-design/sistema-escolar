import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const PlanillasATACAAR = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>ATACALAR</h2>
      <div className="contenido-submenu">
        <p>Módulo de ATACALAR</p>
      </div>
    </div>
  );
};

export default PlanillasATACAAR;
