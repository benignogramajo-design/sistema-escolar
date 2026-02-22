import React from "react";
import NavBar from "../components.css/NavBar";
import BotonModulo from "../components.css/BotonModulo";
import "../styles/pages.css";

import { menuConfig } from "../menuConfig";
import fondo from "../assets.css/fondos/ADMINISTRACION.jpg";

// Buscamos el módulo de Administración para obtener sus sub-módulos
const adminModule = menuConfig.find((item) => item.action === "Administracion");
const subModulos = adminModule ? adminModule.subModules : [];

const Administracion = ({ navigate, goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>ADMINISTRACIÓN</h2>
      <div className="botones-home">
        {subModulos.map((modulo) => (
          <BotonModulo
            key={modulo.action}
            titulo={modulo.title}
            color={modulo.color}
            icono={modulo.icono}
            onClick={() => navigate(modulo.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default Administracion;