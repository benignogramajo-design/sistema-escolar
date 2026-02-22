import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo REGISTRO DOCENTES1.jpg";

const RegistroDocentesRegimenLicencias = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>RÉGIMEN DE LICENCIAS</h2>
      <div className="contenido-submenu">
        <p>Módulo de régimen de licencias</p>
      </div>
    </div>
  );
};

export default RegistroDocentesRegimenLicencias;
