import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";

import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const PlanillasEstadisticas = ({ navigate, goBack, goHome }) => {
  const subBotones = [
    { titulo: "ESTADÍSTICA DE ALUMNOS", action: "PlanillasEstadisticaAlumnos" },
    { titulo: "APROBADOS Y DESAPROBADOS POR CURSO, DIVISIÓN Y MATERIA", action: "PlanillasAprobadosDesaprobados" },
    { titulo: "APROBADOS Y DESAPROBADOS (TOTALES)", action: "PlanillasAprobadosDesaprobadosTotales" },
    { titulo: "RIESGO PEDAGÓGICO", action: "PlanillasRiesgoPedagogico" },
    { titulo: "ESTADÍSTICA GENERAL", action: "PlanillasEstadisticaGeneral" },
    { titulo: "CICLO BÁSICO", action: "PlanillasCicloBasico" },
    { titulo: "BACHILLER EN ECONOMÍA", action: "PlanillasBachillerEconomia" },
    { titulo: "BACHILLER EN INFORMÁTICA", action: "PlanillasBachillerInformatica" },
    { titulo: "LIBRETA", action: "PlanillasLibreta" },
    { titulo: "RAC", action: "PlanillasRAC" },
    { titulo: "ATACALAR", action: "PlanillasATACALAR" },
    { titulo: "MESAS DE EXAMEN", action: "PlanillasMesasExamen" },
    { titulo: "COMPENDIOS", action: "PlanillasCompendios" },
  ];

  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>PLANILLAS Y ESTADÍSTICAS</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(252, 153, 230, 0.7)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanillasEstadisticas;
