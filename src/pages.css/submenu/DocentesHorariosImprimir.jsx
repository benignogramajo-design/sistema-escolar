import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets/logos/Logo.png";

const DocentesHorariosImprimir = ({ goBack, goHome }) => {
  const [estructura, setEstructura] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);

  // --- Filtros ---
  const [filters, setFilters] = useState({
    cargo: "",
    curso: "",
    division: "",
    turno: "",
    dia: [],
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
    const matchDia = filters.dia.length === 0 || (Array.isArray(item.horarios) && item.horarios.some(h => filters.dia.includes(h.dia)));
    
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

  const toggleDay = (day) => {
    setFilters(prev => {
      const newDays = prev.dia.includes(day) 
        ? prev.dia.filter(d => d !== day)
        : [...prev.dia, day];
      return { ...prev, dia: newDays };
    });
  };

  // --- Helpers para formateo de texto en impresión ---
  const formatDocente = (nombre) => {
    if (!nombre || nombre === "VACANTE" || nombre === "---") return nombre;
    const parts = nombre.split(",");
    if (parts.length > 1) {
        const apellido = parts[0].trim();
        const nombres = parts[1].trim().split(" ");
        // "Apellido, PrimerNombre"
        return `${apellido}, ${nombres[0]}`;
    }
    return nombre;
  };

  const formatAsignatura = (asig) => {
      if (!asig) return "";
      let text = asig;
      // Abreviaturas comunes para ahorrar espacio
      text = text.replace(/EDUCACIÓN/gi, "ED.");
      text = text.replace(/FÍSICA/gi, "FÍS.");
      text = text.replace(/TECNOLÓGICA/gi, "TEC.");
      text = text.replace(/FORMACIÓN/gi, "FORM.");
      text = text.replace(/CIUDADANA/gi, "CIUD.");
      text = text.replace(/CONSTRUCCIÓN/gi, "CONST.");
      if (text.length > 25) return text.substring(0, 23) + "..";
      return text;
  };

  // --- Lógica de Impresión (Grilla Semanal por Curso) ---
  const renderPrintGrid = (curso, division, turno) => {
    const isManana = turno === "Mañana";
    // Si el turno es "Mañana y Tarde" o indefinido, usamos Mañana por defecto para colores, o lógica mixta.
    // Asumiremos el color basado en si contiene "Mañana" o "Tarde".
    const headerColor = isManana ? "#ffe0b2" : "#c8e6c9"; // Naranja claro / Verde claro

    const horariosManana = [
      "1° 07:30 A 08.10", "2° 08:10 A 08:50", "3° 08:55 A 09:35", "4° 09:35 A 10:15",
      "5° 10:20 A 11:00", "6° 11:00 A 11:40", "7° 11:40 A 12:20", "8° 12:20 A 13:00"
    ];
    const horariosTarde = [
      "1° 13:10 A 13:50", "2° 13:50 A 14:30", "3° 14:35 A 15:15", "4° 15:15 A 15:55",
      "5° 16:00 A 16:40", "6° 16:40 A 17:20", "7° 17:20 A 18:00", "8° 18:00 A 18:40"
    ];
    const horariosFijos = isManana ? horariosManana : horariosTarde;

    // Matriz: 9 filas (8 horas + 1 EF) x 5 columnas (Días)
    const gridData = Array(9).fill(null).map(() => Array(5).fill(null));

    // Filtrar datos solo para este curso/división
    const courseData = filteredData.filter(item => item.curso === curso && item.division === division);

    courseData.forEach(item => {
      // Obtener Docente Activo
      let docenteNombre = "VACANTE";
      const getDocente = () => {
        if (item.docentes_suplentes && item.docentes_suplentes.length > 0) {
           if (filters.estado) {
             const sup = item.docentes_suplentes.find(s => s.estado === filters.estado);
             if (sup) return sup.nombre;
           } else {
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

      if (Array.isArray(item.horarios)) {
        item.horarios.forEach(h => {
          const dayIndex = diasSemana.indexOf(h.dia);
          if (dayIndex === -1) return;

          if (h.horas.includes("EDUCACIÓN FÍSICA")) {
            gridData[8][dayIndex] = cellContent;
          } else {
            h.horas.forEach(horaDb => {
              const horaNum = parseInt(horaDb.charAt(0));
              if (!isNaN(horaNum) && horaNum >= 1 && horaNum <= 8) {
                gridData[horaNum - 1][dayIndex] = cellContent;
              }
            });
          }
        });
      }
    });

    // Estilos
    const headerHeight = '1.5cm';
    const rowHeight = '1.7cm'; // Ajuste para A4 Landscape

    const cellStyle = { 
      border: "1px solid black", 
      padding: "1px", 
      textAlign: "center", 
      fontSize: "9px", 
      verticalAlign: "middle",
      overflow: "hidden",
      whiteSpace: "normal",
      wordWrap: "break-word",
      lineHeight: "1.1"
    };
    const headerStyle = { ...cellStyle, backgroundColor: headerColor, fontWeight: "bold", fontSize: "14px", height: headerHeight };
    const firstColStyle = { ...cellStyle, backgroundColor: headerColor, fontWeight: "bold", width: "2.5cm", minWidth: "2.5cm", maxWidth: "2.5cm", fontSize: "10px" };

    return (
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr style={{ height: headerHeight }}>
            <th style={firstColStyle}>{curso}° {division}</th>
            {diasSemana.map(d => <th key={d} style={headerStyle}>{d.toUpperCase()}</th>)}
          </tr>
        </thead>
        <tbody>
          {horariosFijos.map((hora, rowIndex) => (
            <tr key={rowIndex} style={{ height: rowHeight }}>
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
                      <div style={{marginBottom: '2px'}}>{formatAsignatura(cell.asignatura)}</div>
                      <div style={{fontWeight: cell.docente === "VACANTE" ? "bold" : "normal"}}>{formatDocente(cell.docente)}</div>
                    </>
                  ) : ""}
                </td>
              ))}
            </tr>
          ))}
          {/* Fila Educación Física */}
          <tr style={{ height: rowHeight }}>
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
                    <div style={{marginBottom: '2px'}}>{formatAsignatura(cell.asignatura)}</div>
                    <div style={{fontWeight: cell.docente === "VACANTE" ? "bold" : "normal"}}>{formatDocente(cell.docente)}</div>
                  </>
                ) : ""}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  // Obtener lista de Cursos/Divisiones únicos para iterar en la impresión
  const uniqueCursoDivs = [...new Set(filteredData.map(item => JSON.stringify({ curso: item.curso, division: item.division, turno: item.turno })))].map(s => JSON.parse(s));
  // Ordenar
  uniqueCursoDivs.sort((a, b) => {
    const cA = a.curso || "";
    const cB = b.curso || "";
    const compC = cA.localeCompare(cB, undefined, { numeric: true });
    if (compC !== 0) return compC;
    return (a.division || "").localeCompare(b.division || "");
  });

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrintPreview && (
        <>
          <h2>HORARIOS PARA IMPRIMIR</h2>

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
            
            {/* Filtro de Día Multi-select */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
                style={{ padding: '6px', minWidth: '100px', textAlign: 'left', cursor: 'pointer', backgroundColor: 'white', border: '1px solid #767676', borderRadius: '2px', fontSize: '13.33px' }}
              >
                {filters.dia.length === 0 ? "Día" : filters.dia.join(", ")}
              </button>
              {isDayDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: 'white', border: '1px solid #ccc', zIndex: 10, padding: '10px', borderRadius: '4px', width: '150px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                  {diasSemana.map(d => (
                    <div key={d} style={{ marginBottom: '5px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={filters.dia.includes(d)} onChange={() => toggleDay(d)} style={{ marginRight: '8px' }} />
                        {d}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input placeholder="Asignatura" value={filters.asignatura} onChange={e => setFilters({...filters, asignatura: e.target.value})} style={{ padding: '5px' }} />
            <input placeholder="Docente" value={filters.docente} onChange={e => setFilters({...filters, docente: e.target.value})} style={{ padding: '5px' }} />
            <select value={filters.estado} onChange={e => setFilters({...filters, estado: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Estado</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="NO ACTIVO">NO ACTIVO</option>
            </select>

            <button 
              onClick={() => setShowPrintPreview(true)}
              style={{ backgroundColor: 'yellow', color: 'black', border: 'none', padding: '8px 15px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}
            >
              IMPRIMIR
            </button>
          </div>

          {/* Tabla de Datos (Lista) */}
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
              {uniqueCursoDivs.length > 0 ? uniqueCursoDivs.map((cd, index) => (
                <div key={`${cd.curso}-${cd.division}`} style={{ pageBreakAfter: index < uniqueCursoDivs.length - 1 ? 'always' : 'auto', marginBottom: '30px' }}>
                  {/* Encabezado */}
                  <div style={{ borderBottom: '2px solid black', marginBottom: '10px', paddingBottom: '5px', color: 'black', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '18px', margin: 0, color: 'black' }}>
                      Escuela Secundaria Gobernador Garmendia - {filters.turno || "General"} - {new Date().toLocaleDateString()}
                    </h1>
                  </div>
                  {/* Tabla Grilla */}
                  {renderPrintGrid(cd.curso, cd.division, cd.turno)}
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'black' }}>No hay datos para mostrar con los filtros seleccionados.</div>
              )}
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
              html, body {
                height: auto !important;
                overflow: visible !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .no-print { display: none !important; }
              body * { visibility: hidden; }
              .print-overlay, .print-overlay * { visibility: visible; }
              .print-overlay {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: auto !important;
                background-color: white !important;
                overflow: visible !important;
                display: block !important;
                z-index: 9999 !important;
              }
              .print-content { display: block !important; padding: 0 !important; }
              .print-page { margin: 0 !important; width: 100% !important; box-shadow: none !important; page-break-after: always; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .print-page:last-child { page-break-after: auto; }
              @page { size: A4 landscape; margin: 5mm; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default DocentesHorariosImprimir;
