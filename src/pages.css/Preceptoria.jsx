import React from "react";
import NavBar from "../components.css/NavBar";
import SubBoton from "../components.css/SubBoton";
import "../styles/pages.css";

import { menuConfig } from "../menuConfig";
import fondo from "../assets.css/fondos/Fondo PRECEPTORIA1.jpg";

const preceptoriaMenu = menuConfig.find((item) => item.action === "Preceptoria");
const subBotones = preceptoriaMenu ? preceptoriaMenu.subItems.map((sub) => ({ titulo: sub.name, action: sub.action })) : [];

const Preceptoria = ({ navigate, goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>PRECEPTORIA</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(144, 238, 144, 0.7)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default Preceptoria;
