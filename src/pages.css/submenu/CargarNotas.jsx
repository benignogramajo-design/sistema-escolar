import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const CargarNotas = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Cargar Notas</h2>
        <p>Interfaz para la carga de notas de los alumnos...</p>
      </div>
    </div>
  );
};
export default CargarNotas;