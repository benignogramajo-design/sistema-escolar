import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO DOCENTES1.jpg";

const RegistroYConstanciasDeDocentes = ({ goBack, goHome, navigate }) => {
  const subBotones = [
    { titulo: "REGISTRO DE ACTAS", action: "RegistroDocentesActas" },
    { titulo: "REGISTRO DE LICENCIAS", action: "RegistroDocentesLicencias" },
    { titulo: "RÉGIMEN DE LICENCIAS", action: "RegistroDocentesRegimenLicencias" },
    { titulo: "CONSTANCIAS DE SERVICIOS", action: "RegistroDocentesConstanciasServicios" },
    { titulo: "CONSTANCIAS DE AFECTACIONES", action: "RegistroDocentesConstanciasAfectaciones" },
    { titulo: "CONSTANCIAS DE PERMANENCIA", action: "RegistroDocentesConstanciasPermanencia" },
    { titulo: "CONSTANCIA DE TRABAJO", action: "RegistroDocentesConstanciaTrabajo" },
  ];

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2 style={{ textTransform: 'uppercase' }}>REGISTRO Y CONSTANCIAS DE DOCENTES</h2>
      <div className="subbotones">
        {subBotones.map((item) => (
          <SubBoton
            key={item.titulo}
            titulo={item.titulo}
            color="rgba(223, 167, 65, 0.75)"
            onClick={() => navigate(item.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default RegistroYConstanciasDeDocentes;