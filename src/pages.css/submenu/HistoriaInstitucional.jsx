import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/fondo1.jpg";

const HistoriaInstitucional = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Historia Institucional</h2>
        <p>Contenido de Historia Institucional...</p>
      </div>
    </div>
  );
};
export default HistoriaInstitucional;