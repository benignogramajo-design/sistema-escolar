import React from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/fondo1.jpg";

const FechasImportantes = ({ goBack, goHome }) => {
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <div className="contenido-submenu">
        <h2>Fechas Importantes</h2>
        <p>Calendario académico con fechas importantes...</p>
      </div>
    </div>
  );
};
export default FechasImportantes;