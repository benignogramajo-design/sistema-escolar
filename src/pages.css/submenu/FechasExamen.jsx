import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const FechasExamen = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Fechas de Examen</h2>
        <p>Calendario y listado de fechas de examen...</p>
      </div>
    </div>
  );
};
export default FechasExamen;