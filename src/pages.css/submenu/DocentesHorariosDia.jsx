import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets/logos/Logo.png";

const DocentesHorariosDia = ({ goBack, goHome }) => {
  const [estructura, setEstructura] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // --- Filtros (Misma lógica que DocentesEstructura) ---
  const [filters, setFilters] = useState({
    cargo: "",
    curso: "",
    division: "",
    turno: "",
    dia: "",
    asignatura: "",
    docente: "",
    estado: ""
  });

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // --- Carga de Datos ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Cargar Estructura
        const { data: estData, error: estError } = await supabase
          .from('estructura_horario')
          .select('*')
          .order('id', { ascending: false });
        
        if (estError && estError.code !== 'PGRST116') console.error("Error estructura:", estError);

        // Procesar datos JSON
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
            docente_titular: safeParse(item.docente_titular, { nombre: "---", estado: "" }),
            docente_interino: safeParse(item.docente_interino, { nombre: "---", estado: "" }),
            docentes_suplentes: safeParse(item.docentes_suplentes, [])
          };
        });
        setEstructura(parsedData);

        // 2. Cargar Códigos (para filtros)
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

  // --- Filtrado de Datos ---
  const filteredData = estructura.map(item => {
    // Actualizar turno dinámicamente
    let dynamicTurno = item.turno;
    if (item.cargo === "DOCENTE" && item.curso && item.division) {
      const found = codigos.find(c => c.curso === item.curso && c.division === item.division);
      if (found) dynamicTurno = found.turno;
    }
    return { ...item, turno: dynamicTurno };
  }).filter(item => {
    // Normalizar turno
    let normalizedTurno = "";
    const upperTurno = (item.turno || "").toUpperCase();
    if (upperTurno.includes("MAÑANA") && upperTurno.includes("TARDE")) normalizedTurno = "Mañana y Tarde";
    else if (upperTurno.includes("MAÑANA")) normalizedTurno = "Mañana";
    else if (upperTurno.includes("TARDE")) normalizedTurno = "Tarde";

    const searchInDocentes = (docObj, term) => docObj && (docObj.nombre || "").toLowerCase().includes(term);
    const searchInSuplentes = (arr, term) => Array.isArray(arr) && arr.some(s => (s.nombre || "").toLowerCase().includes(term));

    const matchCargo = !filters.cargo || item.cargo === filters.cargo;
    const matchCurso = !filters.curso || item.curso === filters.curso;
    const matchDiv = !filters.division || item.division === filters.division;
    const matchTurno = !filters.turno || normalizedTurno === filters.turno;
    const matchAsig = !filters.asignatura || (item.asignatura || "").toLowerCase().includes(filters.asignatura.toLowerCase());
    const matchDia = !filters.dia || (Array.isArray(item.horarios) && item.horarios.some(h => h.dia === filters.dia));
    
    const termDoc = filters.docente.toLowerCase();
    const matchDocente = !filters.docente || 
      searchInDocentes(item.docente_titular, termDoc) || 
      searchInDocentes(item.docente_interino, termDoc) || 
      searchInSuplentes(item.docentes_suplentes, termDoc);

    const matchEstado = !filters.estado || 
      (item.docente_titular?.estado === filters.estado) ||
      (item.docente_interino?.estado === filters.estado) ||
      (Array.isArray(item.docentes_suplentes) && item.docentes_suplentes.some(s => s.estado === filters.estado));

    return matchCargo && matchCurso && matchDiv && matchTurno && matchAsig && matchDia && matchDocente && matchEstado;
  });

  // Listas únicas para filtros
  const uniqueCursos = [...new Set(codigos.map(c => c.curso))].sort();
  const uniqueDivisiones = [...new Set(codigos.map(c => c.division))].sort();
  const uniqueCargos = [...new Set(codigos.map(c => c.cargo).filter(Boolean))].sort();

  // --- Lógica de Impresión (Grilla) ---
  const renderPrintGrid = () => {
    const turnoSeleccionado = filters.turno || "Mañana"; // Default a Mañana si no se selecciona
    const diaSeleccionado = filters.dia || "Lunes"; // Default a Lunes
    const isManana = turnoSeleccionado === "Mañana";
    const isTarde = turnoSeleccionado === "Tarde";

    // Configuración de Columnas (Cursos)
    const cursosManana = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "5A", "6A"];
    const cursosTarde = ["1C", "1D", "2C", "2D", "3C", "3D", "4B", "4C", "5B", "5C", "6B", "6C"];
    const cursos = isManana ? cursosManana : (isTarde ? cursosTarde : []);

    // Configuración de Filas (Horarios)
    const horariosManana = [
      "1° 07:30 A 08.10", "2° 08:10 A 08:50", "3° 08:55 A 09:35", "4° 09:35 A 10:15",
      "5° 10:20 A 11:00", "6° 11:00 A 11:40", "7° 11:40 A 12:20", "8° 12:20 A 13:00"
    ];
    const horariosTarde = [
      "1° 13:10 A 13:50", "2° 13:50 A 14:30", "3° 14:35 A 15:15", "4° 15:15 A 15:55",
      "5° 16:00 A 16:40", "6° 16:40 A 17:20", "7° 17:20 A 18:00", "8° 18:00 A 18:40"
    ];
    const horariosFijos = isManana ? horariosManana : (isTarde ? horariosTarde : []);
    
    // Mapeo de horas DB a horas Tabla (para coincidencia)
    // DB suele tener "1° de 07:30 a 08:10", la tabla pide "1° 07:30 A 08.10"
    // Usaremos el índice (1° = index 0) para simplificar la coincidencia si el string no es exacto.

    // Construcción de la Matriz de Datos
    // Filas: 8 horarios + 1 Ed. Física = 9 filas
    // Columnas: cursos.length
    const gridData = Array(9).fill(null).map(() => Array(cursos.length).fill(null));

    filteredData.forEach(item => {
      // Verificar si el item corresponde al día y turno
      const itemTurno = (item.turno || "").toUpperCase();
      const targetTurno = turnoSeleccionado.toUpperCase();
      
      // Match Turno (Mañana y Tarde incluye ambos)
      const turnoMatch = itemTurno === targetTurno || itemTurno === "MAÑANA Y TARDE";
      if (!turnoMatch) return;

      // Match Curso/División
      const cursoDiv = `${item.curso}${item.division}`;
      const colIndex = cursos.indexOf(cursoDiv);
      if (colIndex === -1) return;

      // Obtener Docente Activo (prioridad: Suplente > Interino > Titular)
      // Filtrado por estado si está seleccionado
      let docenteNombre = "VACANTE";
      
      // Lógica simple para determinar qué docente mostrar:
      // Si hay filtro de estado, buscamos uno que coincida. Si no, el vigente.
      const getDocente = () => {
        if (item.docentes_suplentes && item.docentes_suplentes.length > 0) {
           // Si hay filtro, ver si alguno coincide
           if (filters.estado) {
             const sup = item.docentes_suplentes.find(s => s.estado === filters.estado);
             if (sup) return sup.nombre;
           } else {
             // Retornar el último suplente (asumiendo es el activo) o lógica de negocio
             return item.docentes_suplentes[item.docentes_suplentes.length - 1].nombre;
           }
        }
        if (item.docente_interino && item.docente_interino.nombre !== "---") {
          if (!filters.estado || item.docente_interino.estado === filters.estado) return item.docente_interino.nombre;
        }
        if (item.docente_titular && item.docente_titular.nombre !== "---") {
          if (!filters.estado || item.docente_titular.estado === filters.estado) return item.docente_titular.nombre;
        }
        return "VACANTE";
      };

      docenteNombre = getDocente();
      if (docenteNombre === "---") docenteNombre = "VACANTE";

      const cellContent = {
        asignatura: item.asignatura,
        docente: docenteNombre
      };

      // Rellenar Grid según Horarios
      if (Array.isArray(item.horarios)) {
        item.horarios.forEach(h => {
          if (h.dia !== diaSeleccionado) return;

          // Verificar Educación Física
          if (h.horas.includes("EDUCACIÓN FÍSICA")) {
            gridData[8][colIndex] = cellContent; // Última fila
          } else {
            // Horas normales
            h.horas.forEach(horaDb => {
              // Extraer el número de hora (1°, 2°, etc) para mapear al índice
              const horaNum = parseInt(horaDb.charAt(0)); // "1°..." -> 1
              if (!isNaN(horaNum) && horaNum >= 1 && horaNum <= 8) {
                gridData[horaNum - 1][colIndex] = cellContent;
              }
            });
          }
        });
      }
    });

    // Estilos
    const headerColor = isManana ? "#ffe0b2" : "#c8e6c9"; // Naranja claro / Verde claro
    const cellStyle = { border: "1px solid black", padding: "2px", textAlign: "center", fontSize: "10px", height: "40px", verticalAlign: "middle" };
    const headerStyle = { ...cellStyle, backgroundColor: headerColor, fontWeight: "bold" };
    const firstColStyle = { ...cellStyle, backgroundColor: headerColor, fontWeight: "bold", width: "120px" };

    return (
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th style={firstColStyle}>{diaSeleccionado.toUpperCase()}</th>
            {cursos.map(c => <th key={c} style={headerStyle}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {horariosFijos.map((hora, rowIndex) => (
            <tr key={rowIndex}>
              <td style={firstColStyle}>{hora}</td>
              {gridData[rowIndex].map((cell, colIndex) => (
                <td key={colIndex} style={{ 
                  ...cellStyle, 
                  backgroundColor: cell ? "white" : "#e0e0e0", // Gris si vacío
                  color: (cell && cell.docente === "VACANTE") ? "red" : "black",
                  fontWeight: (cell && cell.docente === "VACANTE") ? "bold" : "normal"
                }}>
                  {cell ? (
                    <>
                      <div>{cell.asignatura}</div>
                      <div>{cell.docente}</div>
                    </>
                  ) : ""}
                </td>
              ))}
            </tr>
          ))}
          {/* Fila Educación Física */}
          <tr>
            <td style={firstColStyle}>EDUCACIÓN FÍSICA</td>
            {gridData[8].map((cell, colIndex) => (
              <td key={colIndex} style={{ 
                ...cellStyle, 
                backgroundColor: cell ? "white" : "#e0e0e0",
                color: (cell && cell.docente === "VACANTE") ? "red" : "black",
                fontWeight: (cell && cell.docente === "VACANTE") ? "bold" : "normal"
              }}>
                {cell ? (
                  <>
                    <div>{cell.asignatura}</div>
                    <div>{cell.docente}</div>
                  </>
                ) : ""}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  // --- Renderizado Principal ---
  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrintPreview && (
        <>
          <h2>HORARIOS POR DÍA</h2>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
            <select value={filters.cargo} onChange={e => setFilters({...filters, cargo: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Cargo</option>
              {uniqueCargos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.curso} onChange={e => setFilters({...filters, curso: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Curso</option>
              {uniqueCursos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.division} onChange={e => setFilters({...filters, division: e.target.value})} style={{ padding: '5px' }}>
              <option value="">División</option>
              {uniqueDivisiones.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.turno} onChange={e => setFilters({...filters, turno: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Turno</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
            </select>
            <select value={filters.dia} onChange={e => setFilters({...filters, dia: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Día</option>
              {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input placeholder="Asignatura" value={filters.asignatura} onChange={e => setFilters({...filters, asignatura: e.target.value})} style={{ padding: '5px' }} />
            <input placeholder="Docente" value={filters.docente} onChange={e => setFilters({...filters, docente: e.target.value})} style={{ padding: '5px' }} />
            <select value={filters.estado} onChange={e => setFilters({...filters, estado: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Estado</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="NO ACTIVO">NO ACTIVO</option>
            </select>

            <button 
              onClick={() => {
                if (!filters.dia || !filters.turno) {
                  alert("Para imprimir, por favor seleccione un DÍA y un TURNO.");
                  return;
                }
                setShowPrintPreview(true);
              }}
              style={{ backgroundColor: 'yellow', color: 'black', border: 'none', padding: '8px 15px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}
            >
              IMPRIMIR
            </button>
          </div>

          {/* Tabla de Datos (Igual a Estructura) */}
          <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: "#333", color: "white" }}>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Cargo</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Curso/Div</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Turno</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Asignatura</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Días y Horarios</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Titular</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Interino</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Suplentes</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.cargo}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.curso} {item.division}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.turno}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.asignatura}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {Array.isArray(item.horarios) && item.horarios.map((h, i) => {
                         const horas = (h.horas || []).join(", ");
                         return <div key={i}><strong>{h.dia}:</strong> {horas}</div>;
                      })}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.docente_titular?.nombre}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.docente_interino?.nombre}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {Array.isArray(item.docentes_suplentes) && item.docentes_suplentes.map(s => s.nombre).join(", ")}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" style={{ padding: "15px", textAlign: "center" }}>No hay datos registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Vista Previa de Impresión */}
      {showPrintPreview && (
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#555', zIndex: 2000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div className="print-content" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div className="print-page">
              {/* Encabezado */}
              <div style={{ borderBottom: '2px solid black', marginBottom: '10px', paddingBottom: '5px', color: 'black', textAlign: 'center' }}>
                <h1 style={{ fontSize: '18px', margin: 0 }}>Escuela Secundaria Gobernador Garmendia - {filters.turno?.toUpperCase()} - {new Date().toLocaleDateString()}</h1>
              </div>

              {/* Tabla Grilla */}
              {renderPrintGrid()}
            </div>

          </div>
          
          <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#333', padding: '15px', textAlign: 'center', boxShadow: '0 -2px 10px rgba(0,0,0,0.3)' }}>
            <button 
              onClick={() => window.print()} 
              style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              GUARDAR COMO PDF
            </button>
            <button 
              onClick={() => window.print()} 
              style={{ backgroundColor: '#ffc107', color: 'black', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              IMPRIMIR
            </button>
            <button 
              onClick={() => setShowPrintPreview(false)} 
              style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              CANCELAR
            </button>
          </div>
          <style>{`
            .print-page {
              width: 297mm; /* A4 Landscape */
              min-height: 210mm;
              padding: 10mm;
              background-color: white;
              box-sizing: border-box;
            }
            @media print {
              .no-print { display: none !important; }
              body * { visibility: hidden; }
              .print-overlay, .print-overlay * { visibility: visible; }
              .print-overlay { position: absolute; top: 0; left: 0; width: 100%; background: white; }
              .print-page { margin: 0; width: 100%; box-shadow: none; }
              @page { size: landscape; margin: 5mm; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default DocentesHorariosDia;