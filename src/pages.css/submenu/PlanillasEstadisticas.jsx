import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";

import { menuConfig } from "../../menuConfig";
import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";

const adminModule = menuConfig.find((item) => item.action === "Administracion");
const planillasModule = adminModule ? adminModule.subModules.find((sub) => sub.action === "PlanillasEstadisticas") : null;
const subBotones = planillasModule ? planillasModule.subItems.map((sub) => ({ titulo: sub.name, action: sub.action })) : [];

const PlanillasEstadisticas = ({ navigate, goBack, goHome }) => {
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
