import React from "react";
import NavBar from "../../components.css/NavBar";
import SubBoton from "../../components.css/SubBoton";
import "../../styles/pages.css";

import fondo from "../../assets/fondos/Fondo REGISTRO ALUMNOS1.jpg";

const RegistroAlumnosConstancias = ({ navigate, goBack, goHome }) => {
  const subBotones = [
    { titulo: "FICHA DEL ALUMNO", action: "RegistroAlumnosFicha" },
    { titulo: "LIBRO MATRIZ", action: "RegistroAlumnosLibroMatriz" },
    { titulo: "BOLETO ESTUDIANTIL", action: "RegistroAlumnosBoletoEstudiantil" },
    { titulo: "CAUSAL DE VACANTE", action: "RegistroAlumnosCausalVacante" },
    { titulo: "ACTA DE EXAMEN", action: "RegistroAlumnosActaExamen" },
    { titulo: "PERMISOS DE EXAMEN", action: "RegistroAlumnosPermisosExamen" },
    { titulo: "CERTIFICADOS", action: "RegistroAlumnosCertificados" },
  ];

  return (
    <div
      className="pagina-modulo"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>REGISTRO Y CONSTANCIA DE ALUMNOS</h2>
      <div className="subbotones">
        {subBotones.map((sub, index) => (
          <SubBoton
            key={index}
            titulo={sub.titulo}
            color="rgba(250, 120, 120, 0.99)"
            onClick={() => navigate(sub.action)}
          />
        ))}
      </div>
    </div>
  );
};

export default RegistroAlumnosConstancias;
