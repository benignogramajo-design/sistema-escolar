import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";

import fondo from "../../assets/fondos/Fondo REGISTRO DOCENTES1.jpg";

const RegistroDocentesConstancias = ({ navigate, goBack, goHome }) => {
  const subBotones = [
    { titulo: "REGISTRO DE ACTAS", action: "RegistroDocentesActas" },
    { titulo: "CONSTANCIAS DE SERVICIOS", action: "RegistroDocentesConstanciasServicios" },
    { titulo: "CONSTANCIAS DE AFECTACIONES", action: "RegistroDocentesConstanciasAfectaciones" },
    { titulo: "CONSTANCIAS DE PERMANENCIA", action: "RegistroDocentesConstanciasPermanencia" },
    { titulo: "CONSTANCIA DE TRABAJO", action: "RegistroDocentesConstanciaTrabajo" },
  ];

  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>REGISTRO Y CONSTANCIAS DE DOCENTES</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(223, 167, 65, 0.75)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default RegistroDocentesConstancias;
