import React from "react";
import NavBar from "../components.css/NavBar";
import SubBoton from "../components.css/SubBoton";
import "../styles/pages.css";

import { menuConfig } from "../menuConfig";
import fondo from "../assets.css/fondos/Fondo BIBLIOTECA1.jpg";

const bibliotecaMenu = menuConfig.find((item) => item.action === "Biblioteca");
const subBotones = bibliotecaMenu ? bibliotecaMenu.subItems.map((sub) => ({ titulo: sub.name, action: sub.action })) : [];

const Biblioteca = ({ navigate, goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>BIBLIOTECA</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(216, 191, 216, 0.7)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default Biblioteca;
