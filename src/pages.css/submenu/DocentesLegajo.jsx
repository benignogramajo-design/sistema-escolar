import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets.css/logos/Logo.png";

const DocentesLegajo = ({ goBack, goHome }) => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    docente: "",
    cargo: "",
    curso: "",
    division: "",
    asignatura: "",
    plaza: "",
    turno: "",
    dia: "",
    estado: ""
  });

  // Estado para Modal y Vista Previa
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Constantes de Horarios para el mapeo
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const horariosMananaLabels = [
    "1° de 07:30 a 08:10", "2° de 08:10 a 08:50", "3° de 08:55 a 09:35", "4° de 09:35 a 10:15",
    "5° de 10:20 a 11:00", "6° de 11:00 a 11:40", "7° de 11:40 a 12:20", "8° de 12:20 a 13:00"
  ];
  const horariosTardeLabels = [
    "1° de 13:10 a 13:50", "2° de 13:50 a 14:30", "3° de 14:35 a 15:15", "4° de 15:15 a 15:55",
    "5° de 16:00 a 16:40", "6° de 16:40 a 17:20", "7° de 17:20 a 18:00", "8° de 18:00 a 18:40"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Obtener Docentes
      const { data: docData, error: docError } = await supabase
        .from('datos_de_legajo_docentes')
        .select('*')
        .order('apellido');
      
      if (docError) throw docError;

      // 2. Obtener Estructura de Horario
      const { data: estData, error: estError } = await supabase
        .from('estructura_horario')
        .select('*');

      if (estError && estError.code !== 'PGRST116') throw estError;

      // 3. Procesar y combinar datos
      const processedData = (docData || []).map(doc => {
        const nombreCompleto = `${doc.apellido}, ${doc.nombre}`;
        
        // Buscar asignaciones en estructura_horario donde aparezca este docente
        const assignments = (estData || []).filter(item => {
          const isTitular = item.docente_titular?.nombre === nombreCompleto;
          const isInterino = item.docente_interino?.nombre === nombreCompleto;
          const isSuplente = Array.isArray(item.docentes_suplentes) && item.docentes_suplentes.some(s => s.nombre === nombreCompleto);
          return isTitular || isInterino || isSuplente;
        });

        // Agregar información para la tabla principal
        const cargos = [...new Set(assignments.map(a => a.cargo).filter(Boolean))].join(", ");
        const cursos = [...new Set(assignments.map(a => a.curso).filter(Boolean))].join(", ");
        const divisiones = [...new Set(assignments.map(a => a.division).filter(Boolean))].join(", ");
        const turnos = [...new Set(assignments.map(a => a.turno).filter(Boolean))].join(", ");
        
        // Asignatura - Plazas
        const asigPlazaList = assignments.map(a => {
          // Extraer plazas de los horarios
          const plazasSet = new Set();
          if (Array.isArray(a.horarios)) {
            a.horarios.forEach(h => {
              if (h.plazas) Object.values(h.plazas).forEach(p => { if(p) plazasSet.add(p); });
              if (h.plaza) plazasSet.add(h.plaza);
            });
          }
          const plazasStr = [...plazasSet].join("/");
          return `${a.asignatura || 'S/D'} - ${plazasStr || '---'}`;
        });
        const asigPlaza = [...new Set(asigPlazaList)].join("; ");

        // Días y Horarios
        const diasHorariosList = {};
        assignments.forEach(a => {
            if (Array.isArray(a.horarios)) {
                a.horarios.forEach(h => {
                    if (!diasHorariosList[h.dia]) diasHorariosList[h.dia] = new Set();
                    
                    if (a.cargo !== 'DOCENTE' && h.horario_texto) {
                        diasHorariosList[h.dia].add(h.horario_texto);
                    } else if (Array.isArray(h.horas)) {
                        h.horas.forEach(hora => diasHorariosList[h.dia].add(hora.split(' ')[0]));
                    }
                });
            }
        });
        const diasHorarios = Object.entries(diasHorariosList)
            .map(([dia, horasSet]) => `${dia} (${[...horasSet].join(', ')})`).join('; ');

        // Estado (buscar el estado específico del docente en esas asignaciones)
        const estados = [...new Set(assignments.map(a => {
          if (a.docente_titular?.nombre === nombreCompleto) return a.docente_titular.estado;
          if (a.docente_interino?.nombre === nombreCompleto) return a.docente_interino.estado;
          if (Array.isArray(a.docentes_suplentes)) {
            const sup = a.docentes_suplentes.find(s => s.nombre === nombreCompleto);
            if (sup) return sup.estado;
          }
          return null;
        }).filter(Boolean))].join(", ");

        // Calcular Edad
        let edad = "";
        if (doc.fecha_nacimiento) {
          const hoy = new Date();
          const nac = new Date(doc.fecha_nacimiento);
          let e = hoy.getFullYear() - nac.getFullYear();
          const m = hoy.getMonth() - nac.getMonth();
          if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
            e--;
          }
          edad = e;
        }

        return {
          ...doc,
          nombreCompleto,
          edad,
          assignments, // Guardamos las asignaciones crudas para el modal
          display: { cargos, cursos, divisiones, turnos, asigPlaza, diasHorarios, estados }
        };
      });

      setDocentes(processedData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtros ---
  const filteredDocentes = docentes.filter(d => {
    const f = filters;
    const matchDocente = !f.docente || d.nombreCompleto.toLowerCase().includes(f.docente.toLowerCase());
    const matchCargo = !f.cargo || (d.display.cargos && d.display.cargos.toLowerCase().includes(f.cargo.toLowerCase()));
    const matchCurso = !f.curso || d.display.cursos.includes(f.curso);
    const matchDivision = !f.division || d.display.divisiones.includes(f.division);
    const matchAsignatura = !f.asignatura || d.display.asigPlaza.toLowerCase().includes(f.asignatura.toLowerCase());
    const matchPlaza = !f.plaza || d.display.asigPlaza.includes(f.plaza);
    const matchTurno = !f.turno || d.display.turnos.includes(f.turno);
    const matchDia = !f.dia || d.display.diasHorarios.includes(f.dia);
    const matchEstado = !f.estado || d.display.estados.includes(f.estado);

    return matchDocente && matchCargo && matchCurso && matchDivision && matchAsignatura && matchPlaza && matchTurno && matchDia && matchEstado;
  });

  // --- Lógica de Grillas de Horarios ---
  const buildScheduleGrid = (allAssignments, turnoLabels, turno) => {
    // Filter assignments for the specific turn
    const assignments = allAssignments.filter(a => a.turno?.includes(turno));

    // Inicializar grilla vacía: filas = horas, columnas = días
    const grid = turnoLabels.map(label => {
      const row = { hora: label };
      diasSemana.forEach(dia => row[dia] = "---");
      return row;
    });

    // Helper para parsear "HH:MM" a minutos y extraer rango de "HH:MM a HH:MM"
    const getRange = text => {
      if (!text) return null;
      const parseTime = timeStr => {
        if (!timeStr) return NaN;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + (minutes || 0);
      };
      // Regex to match HH:MM a HH:MM or HH:MM - HH:MM
      const match = text.match(/(\d{1,2}:\d{2})\s*(?:a|-)\s*(\d{1,2}:\d{2})/);
      if (match && match[1] && match[2]) {
        return { start: parseTime(match[1]), end: parseTime(match[2]) };
      }
      return null;
    };

    // Rellenar grilla
    assignments.forEach(asig => {
      if (Array.isArray(asig.horarios)) {
        asig.horarios.forEach(h => {
          const diaIndex = diasSemana.indexOf(h.dia);
          if (diaIndex === -1) return; // Si el día no es válido, saltar

          // Lógica para cargos DOCENTE con horas específicas
          if (asig.cargo === 'DOCENTE' && Array.isArray(h.horas)) {
            h.horas.forEach(horaStr => {
              const rowIndex = turnoLabels.findIndex(l => l === horaStr);
              if (rowIndex === -1) return;

              const plaza = (h.plazas && h.plazas[horaStr]) ? h.plazas[horaStr] : '';
              // Formato: CURSODIV - ASIGNATURA - PLAZA
              let content = `${asig.curso || ''}${asig.division || ''} - ${asig.asignatura}`;
              if (plaza) {
                content += ` - ${plaza}`;
              }
              
              if (grid[rowIndex][h.dia] !== "---") grid[rowIndex][h.dia] += " / " + content;
              else grid[rowIndex][h.dia] = content;
            });
          } 
          // Lógica para cargos NO DOCENTE con rangos de texto (horario_texto)
          else if (asig.cargo !== 'DOCENTE' && h.horario_texto) {
            const nonDocenteRange = getRange(h.horario_texto);
            if (!nonDocenteRange) return; // No se pudo parsear el rango

            turnoLabels.forEach((label, rowIndex) => {
              const labelRange = getRange(label);
              if (!labelRange) return;

              // Comprobar si los rangos se superponen
              if (Math.max(labelRange.start, nonDocenteRange.start) < Math.min(labelRange.end, nonDocenteRange.end)) {
                const plaza = h.plaza || '';
                // Formato: CARGO - PLAZA
                let content = `${asig.cargo}`;
                if (plaza) content += ` - ${plaza}`;

                if (grid[rowIndex][h.dia] !== "---") grid[rowIndex][h.dia] += " / " + content;
                else grid[rowIndex][h.dia] = content;
              }
            });
          }
        });
      }
    });
    return grid;
  };

  const getEducacionFisicaInfo = (assignments) => {
    const ef = assignments.filter(a => (a.asignatura || "").toUpperCase().includes("EDUCACIÓN FÍSICA"));
    if (ef.length === 0) return null;
    
    return ef.map(a => {
      const horariosTexto = Array.isArray(a.horarios) ? a.horarios.map(h => {
        if (h.horas.includes("EDUCACIÓN FÍSICA")) {
          return `${h.dia}: ${h.ef_horario || 'Horario no definido'}`;
        }
        return null;
      }).filter(Boolean).join(" | ") : "";
      return `${a.asignatura} (${a.curso} ${a.division}): ${horariosTexto}`;
    }).join("\n");
  };

  // --- Renderizado del Contenido del Docente (Modal / Impresión) ---
  const renderDocenteContent = (docente, isPreview = false) => {
    if (!docente) return null;

    const gridManana = buildScheduleGrid(docente.assignments, horariosMananaLabels, "Mañana");
    const gridTarde = buildScheduleGrid(docente.assignments, horariosTardeLabels, "Tarde");
    const infoEF = getEducacionFisicaInfo(docente.assignments);

    const Header = () => (
      <div className="print-header" style={{ borderBottom: '2px solid black', marginBottom: '20px', paddingBottom: '10px', color: 'black' }}>
         <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
            <div>
              <h1 style={{ fontSize: '18px', margin: 0 }}>Escuela Secundaria Gobernador Garmendia</h1>
              <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
              <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>LEGAJO DEL PERSONAL</p>
            </div>
         </div>
      </div>
    );

    const DatosPersonales = () => (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: 0 }}>DATOS PERSONALES</h4>
            <p><strong>Apellido y Nombre:</strong> {docente.nombreCompleto}</p>
            <p><strong>DNI:</strong> {docente.dni}</p>
            <p><strong>Legajo:</strong> {docente.legajo || '---'}</p>
            <p><strong>Fecha Nac.:</strong> {docente.fecha_nacimiento || '---'} <strong>Edad:</strong> {docente.edad}</p>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: 0 }}>CONTACTO Y DOMICILIO</h4>
            <p><strong>Localidad:</strong> {docente.localidad || '---'}</p>
            <p><strong>Domicilio:</strong> {docente.domicilio || '---'}</p>
            <p><strong>Celular:</strong> {docente.celular || '---'}</p>
            <p><strong>Email:</strong> {docente.email || '---'}</p>
          </div>
        </div>

        <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
          <p><strong>TÍTULOS:</strong> {docente.titulos || '---'}</p>
          <p><strong>CARGOS:</strong> {docente.cargos || '---'}</p>
          <p><strong>ESTADO:</strong> {docente.display.estados || '---'}</p>
        </div>
      </>
    );

    const TablaManana = () => (
      <>
        <h4 style={{ textAlign: 'center', backgroundColor: '#eee', padding: '5px' }}>HORARIOS - TURNO MAÑANA</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #999', padding: '4px' }}>HORARIO</th>
              {diasSemana.map(d => <th key={d} style={{ border: '1px solid #999', padding: '4px' }}>{d.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {gridManana.map((row, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #999', padding: '4px', fontWeight: 'bold' }}>{row.hora}</td>
                {diasSemana.map(d => <td key={d} style={{ border: '1px solid #999', padding: '4px', textAlign: 'center' }}>{row[d]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );

    const TablaTarde = () => (
      <>
        <h4 style={{ textAlign: 'center', backgroundColor: '#eee', padding: '5px' }}>HORARIOS - TURNO TARDE</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #999', padding: '4px' }}>HORARIO</th>
              {diasSemana.map(d => <th key={d} style={{ border: '1px solid #999', padding: '4px' }}>{d.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {gridTarde.map((row, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #999', padding: '4px', fontWeight: 'bold' }}>{row.hora}</td>
                {diasSemana.map(d => <td key={d} style={{ border: '1px solid #999', padding: '4px', textAlign: 'center' }}>{row[d]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );

    const InfoEF = () => infoEF ? (
      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f4f8', border: '1px solid #bce0fd', borderRadius: '5px' }}>
        <strong>EDUCACIÓN FÍSICA:</strong>
        <pre style={{ fontFamily: 'inherit', margin: '5px 0' }}>{infoEF}</pre>
      </div>
    ) : null;

    if (isPreview) {
      return (
        <div>
          <div className="print-page">
            <Header />
            <DatosPersonales />
            <TablaManana />
            <InfoEF />
          </div>
          <div className="print-page">
            <Header />
            <TablaTarde />
          </div>
        </div>
      );
    }

    return (
      <div className="docente-detail">
        <DatosPersonales />
        <TablaManana />
        <TablaTarde />
        <InfoEF />
      </div>
    );
  };

  const handleOpenModal = (docente) => {
    setSelectedDocente(docente);
    setShowModal(true);
    setShowPrintPreview(false);
  };

  const handleOpenPrint = (docente) => {
    setSelectedDocente(docente);
    setShowPrintPreview(true);
  };

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrintPreview && (
        <>
          <h2>LEGAJO PERSONAL</h2>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
            <input placeholder="Docente" value={filters.docente} onChange={e => setFilters({...filters, docente: e.target.value})} style={{ padding: '5px' }} />
            <input placeholder="Cargo" value={filters.cargo} onChange={e => setFilters({...filters, cargo: e.target.value})} style={{ padding: '5px' }} />
            <input placeholder="Curso" value={filters.curso} onChange={e => setFilters({...filters, curso: e.target.value})} style={{ padding: '5px', width: '60px' }} />
            <input placeholder="Div" value={filters.division} onChange={e => setFilters({...filters, division: e.target.value})} style={{ padding: '5px', width: '60px' }} />
            <input placeholder="Asignatura" value={filters.asignatura} onChange={e => setFilters({...filters, asignatura: e.target.value})} style={{ padding: '5px' }} />
            <input placeholder="Plaza" value={filters.plaza} onChange={e => setFilters({...filters, plaza: e.target.value})} style={{ padding: '5px', width: '80px' }} />
            <select value={filters.turno} onChange={e => setFilters({...filters, turno: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Turno</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
            </select>
            <select value={filters.dia} onChange={e => setFilters({...filters, dia: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Día</option>
              {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.estado} onChange={e => setFilters({...filters, estado: e.target.value})} style={{ padding: '5px' }}>
              <option value="">Estado</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="NO ACTIVO">NO ACTIVO</option>
            </select>
          </div>

          {/* Tabla Principal */}
          <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: "#333", color: "white" }}>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>APELLIDO Y NOMBRE</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CARGO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CURSO/DIV</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>ASIGNATURA - PLAZA</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>TURNO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>DÍA / HORARIO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>ESTADO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
                ) : filteredDocentes.length > 0 ? (
                  filteredDocentes.map((doc, i) => (
                    <tr key={i}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.nombreCompleto}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.display.cargos}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.display.cursos} {doc.display.divisiones}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.display.asigPlaza}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.display.turnos}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.display.diasHorarios}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{doc.display.estados}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>
                        <button 
                          onClick={() => handleOpenModal(doc)}
                          style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', marginRight: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          VER
                        </button>
                        <button 
                          onClick={() => handleOpenPrint(doc)}
                          style={{ backgroundColor: 'blue', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          IMPRIMIR
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron registros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Flotante "VER" */}
      {showModal && selectedDocente && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)} 
              style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              X
            </button>
            <h3 style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>INFORMACIÓN DEL PERSONAL</h3>
            {renderDocenteContent(selectedDocente)}
            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '10px 30px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista Previa de Impresión */}
      {showPrintPreview && selectedDocente && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#555', zIndex: 2000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {renderDocenteContent(selectedDocente, true)}
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
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              margin-bottom: 20px;
              background-color: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
              box-sizing: border-box;
            }
            @media print {
              .no-print { display: none !important; }
              body { margin: 0; padding: 0; }
              .print-page { box-shadow: none; margin: 0; width: 100%; height: 100%; page-break-after: always; }
              .print-page:last-child { page-break-after: auto; }
              @page { size: A4; margin: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default DocentesLegajo;
