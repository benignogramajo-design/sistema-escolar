import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const NuevaSalidaEducativa = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>NUEVA SALIDA EDUCATIVA</h2>
      <div className="contenido-submenu">
        <p>Módulo para crear una nueva salida educativa.</p>
      </div>
    </div>
  );
};

export default NuevaSalidaEducativa;