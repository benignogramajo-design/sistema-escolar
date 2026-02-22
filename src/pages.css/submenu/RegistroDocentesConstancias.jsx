import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";

import { menuConfig } from "../../menuConfig";
import fondo from "../../assets.css/fondos/Fondo REGISTRO DOCENTES1.jpg";

const adminModule = menuConfig.find((item) => item.action === "Administracion");
const registroDocentesModule = adminModule ? adminModule.subModules.find((sub) => sub.action === "RegistroDocentesConstancias") : null;
const subBotones = registroDocentesModule ? registroDocentesModule.subItems.map((sub) => ({ titulo: sub.name, action: sub.action })) : [];

const RegistroDocentesConstancias = ({ navigate, goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>REGISTRO Y CONSTANCIAS DE DOCENTES</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(223, 167, 65, 0.75)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default RegistroDocentesConstancias;
