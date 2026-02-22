import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const MisPlanificaciones = ({ navigate, goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>MIS PLANIFICACIONES</h2>
      <div className="subbotones">
        <SubBoton
          titulo="VER PLANIFICACIONES"
          color="rgba(255, 182, 114, 0.7)"
          onClick={() => navigate("VerPlanificaciones")}
        />
        <SubBoton
          titulo="NUEVA PLANIFICACIÓN"
          color="rgba(255, 182, 114, 0.7)"
          onClick={() => navigate("NuevaPlanificacion")}
        />
      </div>
    </div>
  );
};

export default MisPlanificaciones;