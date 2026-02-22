import React from "react";
import NavBar from "../components.css/NavBar";
import SubBoton from "../components.css/SubBoton";
import "../styles/pages.css";
import { menuConfig } from "../menuConfig";
import fondo from "../assets.css/fondos/fondo1.jpg";

const moduleConfig = menuConfig.find((item) => item.action === "NuestraInstitucion");
const subBotones = moduleConfig ? moduleConfig.subItems.map((sub) => ({ titulo: sub.name, action: sub.action })) : [];

const NuestraInstitucion = ({ navigate, goBack, goHome }) => {
  return (
    <div className="pagina-modulo" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>{moduleConfig ? moduleConfig.title : "NUESTRA INSTITUCIÓN"}</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(235, 242, 255, 0.7)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default NuestraInstitucion;