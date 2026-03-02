import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";

import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const PlanillasCompendios = ({ navigate, goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>COMPENDIOS</h2>
      <div className="subbotones">
        <SubBoton
          titulo="HABILITAR"
          color="rgba(253, 153, 230, 0.7)"
          onClick={() => navigate("CompendiosHabilitar")}
        />
        <SubBoton
          titulo="CARGADOS"
          color="rgba(253, 153, 230, 0.7)"
          onClick={() => navigate("CompendiosCargados")}
        />
      </div>
    </div>
  );
};

export default PlanillasCompendios;