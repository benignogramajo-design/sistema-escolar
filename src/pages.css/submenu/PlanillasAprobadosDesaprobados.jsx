import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const PlanillasAprobadosDesaprobados = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>APROBADOS Y DESAPROBADOS POR CURSO, DIVISIÓN Y MATERIA</h2>
      <div className="contenido-submenu">
        <p>Módulo de aprobados y desaprobados por curso, división y materia</p>
      </div>
    </div>
  );
};

export default PlanillasAprobadosDesaprobados;
