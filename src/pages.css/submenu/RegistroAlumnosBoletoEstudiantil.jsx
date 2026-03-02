import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO ALUMNOS1.jpg";

const RegistroAlumnosBoletoEstudiantil = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>BOLETO ESTUDIANTIL</h2>
      <div className="contenido-submenu">
        <p>Módulo de boleto estudiantil</p>
      </div>
    </div>
  );
};

export default RegistroAlumnosBoletoEstudiantil;
