import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const PlanillasEstadisticaAlumnos = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>ESTADÍSTICA DE ALUMNOS</h2>
      <div className="contenido-submenu">
        <p>Módulo de estadística de alumnos</p>
      </div>
    </div>
  );
};

export default PlanillasEstadisticaAlumnos;
