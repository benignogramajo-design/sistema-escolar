import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";

const PersonalPorDia = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>PERSONAL POR DIA</h2>
      <div className="contenido-submenu">
        <p style={{ textAlign: "center" }}>Visualización de Personal por día (En construcción)</p>
      </div>
    </div>
  );
};

export default PersonalPorDia;