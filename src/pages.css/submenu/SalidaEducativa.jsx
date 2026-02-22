import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo DOCENTES1.jpg";

const SalidaEducativa = ({ navigate, goBack, goHome }) => {
  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>SALIDA EDUCATIVA</h2>
      <div className="subbotones">
        <SubBoton
          titulo="NUEVA SALIDA EDUCATIVA"
          color="rgba(255, 182, 114, 0.7)"
          onClick={() => navigate("NuevaSalidaEducativa")}
        />
        <SubBoton
          titulo="VER MIS SALIDAS EDUCATIVAS"
          color="rgba(255, 182, 114, 0.7)"
          onClick={() => navigate("VerSalidasEducativas")}
        />
      </div>
    </div>
  );
};

export default SalidaEducativa;