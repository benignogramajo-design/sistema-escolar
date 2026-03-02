import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const PlanillasYEstadisticas = ({ goBack, goHome, navigate }) => {
  const botones = [
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
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2 style={{ textTransform: 'uppercase' }}>PLANILLAS Y ESTADÍSTICAS</h2>
      <div className="subbotones">
        {botones.map((item) => (
          <SubBoton
            key={item.titulo}
            titulo={item.titulo}
            color="rgba(252, 153, 230, 0.7)"
            onClick={() => navigate(item.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanillasYEstadisticas;