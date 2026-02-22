import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";

import { menuConfig } from "../../menuConfig";
import fondo from "../../assets.css/fondos/Fondo REGISTRO ALUMNOS1.jpg";

const adminModule = menuConfig.find((item) => item.action === "Administracion");
const registroAlumnosModule = adminModule ? adminModule.subModules.find((sub) => sub.action === "RegistroAlumnosConstancias") : null;
const subBotones = registroAlumnosModule ? registroAlumnosModule.subItems.map((sub) => ({ titulo: sub.name, action: sub.action })) : [];

const RegistroAlumnosConstancias = ({ navigate, goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>REGISTRO Y CONSTANCIA DE ALUMNOS</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(250, 120, 120, 0.99)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default RegistroAlumnosConstancias;
