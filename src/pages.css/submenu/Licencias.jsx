import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

const Licencias = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>LICENCIAS</h2>
      <div className="contenido-submenu">
        <p>Módulo para la gestión de licencias.</p>
      </div>
    </div>
  );
};

export default Licencias;