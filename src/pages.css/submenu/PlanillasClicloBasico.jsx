import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const PlanillasClicloBasico = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>CICLO BÁSICO</h2>
      <div className="contenido-submenu">
        <p>Módulo de ciclo básico</p>
      </div>
    </div>
  );
};

export default PlanillasClicloBasico;
