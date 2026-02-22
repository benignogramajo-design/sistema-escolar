import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo GABINETE.jpg";

const GabineteNotificacionesDerivaciones = ({ navigate, goBack, goHome }) => {
  return (
    <div className="pagina-modulo" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>NOTIFICACIONES / DERIVACIONES</h2>
      <div className="subbotones">
        <SubBoton
          titulo="NOTIFICACIONES"
          color="rgba(255, 0, 255, 0.5)"
          onClick={() => navigate("GabineteNotificaciones")}
        />
        <SubBoton
          titulo="DERIVACIONES"
          color="rgba(255, 0, 255, 0.5)"
          onClick={() => navigate("GabineteDerivaciones")}
        />
        <SubBoton
          titulo="RECIBIDOS / ENVIADOS"
          color="rgba(255, 0, 255, 0.5)"
          onClick={() => navigate("GabineteRecibidosEnviados")}
        />
      </div>
    </div>
  );
};

export default GabineteNotificacionesDerivaciones;