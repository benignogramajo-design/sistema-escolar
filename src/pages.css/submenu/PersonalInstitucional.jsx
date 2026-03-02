import React from "react";
import NavBar from "../../components.css/NavBar";
import BotonModulo from "../../components.css/BotonModulo";
import "../../styles/pages.css";
import { menuConfig } from "../../menuConfig";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

const PersonalInstitucional = ({ goBack, goHome, navigate }) => {
  // Buscar la configuración de este módulo específico
  const moduleConfig = menuConfig
    .find(item => item.title === "ADMINISTRACIÓN")
    ?.subModules.find(item => item.action === "Docentes");

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2 style={{ textTransform: 'uppercase' }}>{moduleConfig?.title}</h2>
      <div className="botones-submenu">
        {moduleConfig?.subItems.map((item) => (
          <BotonModulo
            key={item.action}
            titulo={item.name}
            color={moduleConfig.color}
            onClick={() => navigate(item.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default PersonalInstitucional;