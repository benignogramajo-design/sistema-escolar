import React from "react";
import NavBar from "../../components.css/NavBar";
import BotonModulo from "../../components.css/BotonModulo";
import "../../styles/pages.css";
import { menuConfig } from "../../menuConfig";
import fondo from "../../assets/fondos/Fondo PLANILLAS1.jpg";

const Compendios = ({ goBack, goHome, navigate }) => {
  // Compendios es un sub-item dentro de Planillas
  const parentModule = menuConfig
    .find(item => item.title === "ADMINISTRACIÓN")
    ?.subModules.find(item => item.action === "PlanillasEstadisticas");
    
  const moduleConfig = parentModule?.subItems.find(item => item.action === "PlanillasCompendios");

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2 style={{ textTransform: 'uppercase' }}>{moduleConfig?.name}</h2>
      <div className="botones-submenu">
        {moduleConfig?.subItems.map((item) => (
          <BotonModulo
            key={item.action}
            titulo={item.name}
            color={parentModule.color} // Usamos el color del padre
            onClick={() => navigate(item.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default Compendios;