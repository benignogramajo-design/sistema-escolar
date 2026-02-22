import React from "react";
import BotonModulo from "../components.css/BotonModulo";
import "../styles/pages.css";
import { menuConfig } from "../menuConfig";
import fondo from "../assets.css/fondos/fondo1.jpg";
import fotoPortada from "../assets.css/fondos/Foto Portada1.png";

// Datos de ejemplo para las noticias. En un futuro, esto vendría de una API.
const newsData = [
  {
    id: 1,
    title: "Inicio del Ciclo Lectivo 2026",
    date: "2026-03-01",
    content: "Se da la bienvenida a todos los alumnos y personal al nuevo ciclo lectivo. Esperamos un año lleno de aprendizaje y crecimiento.",
  },
  {
    id: 2,
    title: "Reunión de Padres - 1er Trimestre",
    date: "2026-04-15",
    content: "Se convoca a la primera reunión de padres del año para la entrega de informes y diálogo con los docentes.",
  },
  {
    id: 3,
    title: "Acto del Día de la Bandera",
    date: "2026-06-20",
    content: "Invitamos a toda la comunidad educativa a participar del acto en conmemoración del Día de la Bandera.",
  },
  {
    id: 4,
    title: "Inscripciones Abiertas para el Taller de Robótica",
    date: "2026-07-01",
    content: "A partir de hoy se abren las inscripciones para el nuevo taller extracurricular de robótica. ¡Cupos limitados!",
  },
];

const Home = ({ navigate }) => {
  return (
    <div
      className="home"
      style={{ backgroundImage: `url(${fondo})` }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "10px", color: "black", textShadow: "2px 2px 4px white" }}>
        Ciclo Lectivo 2026
      </h2>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <img
          src={fotoPortada}
          alt="Foto Portada"
          style={{ maxWidth: "80%", maxHeight: "350px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.5)" }}
        />
      </div>
      <div className="botones-home">
        {menuConfig.map((modulo) => (
          <BotonModulo
            key={modulo.action}
            titulo={modulo.title}
            color={modulo.color}
            icono={modulo.icono}
            onClick={() => navigate(modulo.action)}
          />
        ))}
      </div>

      <div className="news-section">
        <h2>Últimas Noticias</h2>
        <div className="news-scroll-container">
          {/* Usamos slice().reverse() para no mutar el array original */}
          {newsData.slice().reverse().map(news => (
            <div key={news.id} className="news-card">
              <h3>{news.title}</h3>
              <small>{new Date(news.date).toLocaleDateString()}</small>
              <p>{news.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
