import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";

const SimuladorHorarios = ({ goBack, goHome }) => {
  const [estructura, setEstructura] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [filters, setFilters] = useState({
    curso: "",
    division: "",
    turno: "" // Se determina automáticamente al elegir curso/división
  });

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // Horarios fijos para la grilla (filas)
  const horariosManana = [
    "1° 07:30 A 08.10", "2° 08:10 A 08:50", "3° 08:55 A 09:35", "4° 09:35 A 10:15",
    "5° 10:20 A 11:00", "6° 11:00 A 11:40", "7° 11:40 A 12:20", "8° 12:20 A 13:00"
  ];
  const horariosTarde = [
    "1° 13:10 A 13:50", "2° 13:50 A 14:30", "3° 14:35 A 15:15", "4° 15:15 A 15:55",
    "5° 16:00 A 16:40", "6° 16:40 A 17:20", "7° 17:20 A 18:00", "8° 18:00 A 18:40"
  ];

  // Carga de datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Cargar Estructura
        const { data: estData, error: estError } = await supabase
          .from('estructura_horario')
          .select('*');
        
        if (estError) console.error("Error estructura:", estError);

        const parsedData = (estData || []).map(item => {
          const safeParse = (val, fallback) => {
            if (typeof val === 'string') {
              try { return JSON.parse(val); } catch (e) { return fallback; }
            }
            return val || fallback;
          };
          return {
            ...item,
            horarios: safeParse(item.horarios, []),
            docente_titular: safeParse(item.docente_titular, { nombre: "---" }),
            docente_interino: safeParse(item.docente_interino, { nombre: "---" }),
            docentes_suplentes: safeParse(item.docentes_suplentes, [])
          };
        });
        setEstructura(parsedData);

        // 2. Cargar Códigos para los selectores
        const { data: codData } = await supabase.from('codigos').select('*');
        setCodigos(codData || []);

      } catch (error) {
        console.error("Error general:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Actualizar turno automáticamente cuando cambian curso/división
  useEffect(() => {
    if (filters.curso && filters.division) {
      const found = codigos.find(c => c.curso === filters.curso && c.division === filters.division);
      if (found) {
        setFilters(prev => ({ ...prev, turno: found.turno }));
      } else {
        setFilters(prev => ({ ...prev, turno: "" }));
      }
    }
  }, [filters.curso, filters.division, codigos]);

  // Listas únicas para selectores
  const uniqueCursos = [...new Set(codigos.map(c => c.curso))].sort();
  const uniqueDivisiones = [...new Set(codigos.map(c => c.division))].sort();

  // Lógica de renderizado de la grilla
  const renderGrid = () => {
    if (!filters.curso || !filters.division) return <p style={{ textAlign: "center", padding: "20px" }}>Seleccione un Curso y División para ver el simulador.</p>;

    const isTarde = (filters.turno || "").toUpperCase().includes("TARDE");
    const horariosFijos = isTarde ? horariosTarde : horariosManana;
    
    // Matriz: 9 filas (8 horas + EF) x 5 columnas (Días)
    const gridData = Array(9).fill(null).map(() => Array(5).fill(null));

    // Filtrar estructura por curso/división seleccionado
    const cursoData = estructura.filter(item => 
      item.curso === filters.curso && 
      item.division === filters.division &&
      item.cargo === "DOCENTE" // Solo mostramos materias curriculares
    );

    cursoData.forEach(item => {
      // Determinar docente activo (Suplente > Interino > Titular)
      let docenteNombre = "VACANTE";
      if (item.docentes_suplentes && item.docentes_suplentes.length > 0) {
        const activo = item.docentes_suplentes.find(s => s.estado === "ACTIVO");
        docenteNombre = activo ? activo.nombre : item.docentes_suplentes[item.docentes_suplentes.length - 1].nombre;
      } else if (item.docente_interino && item.docente_interino.nombre !== "---") {
        docenteNombre = item.docente_interino.nombre;
      } else if (item.docente_titular && item.docente_titular.nombre !== "---") {
        docenteNombre = item.docente_titular.nombre;
      }

      const cellContent = {
        asignatura: item.asignatura,
        docente: docenteNombre
      };

      if (Array.isArray(item.horarios)) {
        item.horarios.forEach(h => {
          const diaIndex = diasSemana.indexOf(h.dia);
          if (diaIndex === -1) return;

          if (h.horas.includes("EDUCACIÓN FÍSICA")) {
            // Fila 9 (índice 8) para EF
            if (!gridData[8][diaIndex]) gridData[8][diaIndex] = [];
            gridData[8][diaIndex].push(cellContent);
          } else {
            h.horas.forEach(horaDb => {
              const horaNum = parseInt(horaDb.charAt(0)); // "1°..." -> 1
              if (!isNaN(horaNum) && horaNum >= 1 && horaNum <= 8) {
                const rowIndex = horaNum - 1;
                if (!gridData[rowIndex][diaIndex]) gridData[rowIndex][diaIndex] = [];
                gridData[rowIndex][diaIndex].push(cellContent);
              }
            });
          }
        });
      }
    });

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.95)", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd", width: "100px" }}>HORARIO</th>
              {diasSemana.map(d => <th key={d} style={{ padding: "10px", border: "1px solid #ddd" }}>{d.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {horariosFijos.map((hora, rowIndex) => (
              <tr key={rowIndex}>
                <td style={{ padding: "5px", border: "1px solid #ddd", fontWeight: "bold", textAlign: "center", backgroundColor: "#f0f0f0" }}>{hora}</td>
                {gridData[rowIndex].map((cellArray, colIndex) => (
                  <td key={colIndex} style={{ padding: "5px", border: "1px solid #ddd", textAlign: "center", verticalAlign: "middle", height: "50px" }}>
                    {cellArray ? cellArray.map((content, i) => (
                      <div key={i} style={{ marginBottom: "4px", borderBottom: i < cellArray.length -1 ? "1px dashed #ccc" : "none", paddingBottom: "2px" }}>
                        <div style={{ fontWeight: "bold", color: "#0056b3" }}>{content.asignatura}</div>
                        <div style={{ fontSize: "10px", color: content.docente === "VACANTE" ? "red" : "#333" }}>{content.docente}</div>
                      </div>
                    )) : ""}
                  </td>
                ))}
              </tr>
            ))}
            {/* Fila Educación Física */}
            <tr>
              <td style={{ padding: "5px", border: "1px solid #ddd", fontWeight: "bold", textAlign: "center", backgroundColor: "#f0f0f0" }}>EDUCACIÓN FÍSICA</td>
              {gridData[8].map((cellArray, colIndex) => (
                <td key={colIndex} style={{ padding: "5px", border: "1px solid #ddd", textAlign: "center", verticalAlign: "middle" }}>
                  {cellArray ? cellArray.map((content, i) => (
                    <div key={i}>
                      <div style={{ fontWeight: "bold", color: "#0056b3" }}>{content.asignatura}</div>
                      <div style={{ fontSize: "10px", color: content.docente === "VACANTE" ? "red" : "#333" }}>{content.docente}</div>
                    </div>
                  )) : ""}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>SIMULADOR DE HORARIOS</h2>

      {/* Controles */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        <select value={filters.curso} onChange={e => setFilters({...filters, curso: e.target.value})} style={{ padding: '8px', borderRadius: '4px' }}>
          <option value="">Seleccione Curso...</option>
          {uniqueCursos.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.division} onChange={e => setFilters({...filters, division: e.target.value})} style={{ padding: '8px', borderRadius: '4px' }}>
          <option value="">Seleccione División...</option>
          {uniqueDivisiones.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {filters.turno && <span style={{ alignSelf: 'center', fontWeight: 'bold', marginLeft: '10px' }}>Turno: {filters.turno}</span>}
      </div>

      {/* Grilla */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%" }}>
        {loading ? <p style={{ textAlign: "center", backgroundColor: "white", padding: "10px" }}>Cargando datos...</p> : renderGrid()}
      </div>
    </div>
  );
};

export default SimuladorHorarios;