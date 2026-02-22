import React from "react";
import NavBar from "../components.css/NavBar";
import SubBoton from "../components.css/SubBoton";
import "../styles/pages.css";
import { menuConfig } from "../menuConfig";
import fondo from "../assets.css/fondos/Fondo DOCENTES1.jpg";

const moduleConfig = menuConfig.find((item) => item.action === "DocentesPortal");
const subBotones = moduleConfig ? moduleConfig.subItems.map((sub) => ({ titulo: sub.name, action: sub.action })) : [];

const DocentesPortal = ({ navigate, goBack, goHome }) => {
  return (
    <div className="pagina-modulo" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>{moduleConfig ? moduleConfig.title : "DOCENTES"}</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(255, 182, 114, 0.7)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default DocentesPortal;