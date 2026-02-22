import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const DocentesNotificaciones = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>NOTIFICACIONES</h2>
      <div className="contenido-submenu">
        <p>Panel de Notificaciones de Docentes.</p>
      </div>
    </div>
  );
};

export default DocentesNotificaciones;