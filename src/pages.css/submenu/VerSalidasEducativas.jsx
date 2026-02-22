import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const VerSalidasEducativas = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>VER MIS SALIDAS EDUCATIVAS</h2>
      <div className="contenido-submenu">
        <p>Módulo para ver las salidas educativas.</p>
      </div>
    </div>
  );
};

export default VerSalidasEducativas;