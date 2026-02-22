import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const PlanillasLibreta = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>LIBRETA</h2>
      <div className="contenido-submenu">
        <p>Módulo de libreta</p>
      </div>
    </div>
  );
};

export default PlanillasLibreta;
