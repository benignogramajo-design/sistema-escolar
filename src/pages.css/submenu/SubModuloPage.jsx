import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";

const SubModuloPage = ({ titulo, fondo, goBack, goHome }) => {
  return (
    <div
      className="pagina-submenu"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>{titulo}</h2>
      <div className="contenido-submenu">
        <p>Contenido de {titulo}</p>
      </div>
    </div>
  );
};

export default SubModuloPage;
