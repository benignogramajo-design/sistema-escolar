import React from "react";
import NavBar from "../components.css/NavBar";
import SubBoton from "../components.css/SubBoton";
import "../styles/pages.css";

import { menuConfig } from "../menuConfig";
import fondo from "../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

// Encuentra la sección 'Docentes' desde la configuración central
const adminModule = menuConfig.find((item) => item.action === "Administracion");
const personalModule = adminModule ? adminModule.subModules.find((sub) => sub.action === "Docentes") : null;
const subBotones = personalModule ? personalModule.subItems.map((sub) => ({ titulo: sub.name, action: sub.action })) : [];

const PersonalInstitucional = ({ navigate, goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>PERSONAL INSTITUCIONAL</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(115, 214, 253, 0.7)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default PersonalInstitucional;