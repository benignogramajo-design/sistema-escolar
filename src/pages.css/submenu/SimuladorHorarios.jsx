import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";

const SimuladorHorarios = ({ goBack, goHome, user }) => {
  // --- Estados de Datos ---
  const [realSchedule, setRealSchedule] = useState([]); // Datos reales de estructura_horario
  const [simulationData, setSimulationData] = useState([]); // Datos en edición
  const [savedSimulations, setSavedSimulations] = useState([]); // Lista de simulaciones guardadas
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de Vista ---
  const [viewMode, setViewMode] = useState("MAIN"); // 'MAIN', 'NEW', 'LIST'
  const [selectedCell, setSelectedCell] = useState(null); // Para intercambio de celdas
  
  // --- Filtros ---
  const [filters, setFilters] = useState({
    turno: "",
    dias: [], // Array para selección múltiple
    curso: "",
    division: "",
    estado: "TODOS", // TODOS, ACTIVOS, NO ACTIVOS
    texto1: "",
    texto2: "",
    texto3: "",
    texto4: "",
    texto5: ""
  });

  // --- Constantes ---
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  
  const horariosManana = [
    "1° 07:30 A 08.10", "2° 08:10 A 08:50", "3° 08:55 A 09:35", "4° 09:35 A 10:15",
    "5° 10:20 A 11:00", "6° 11:00 A 11:40", "7° 11:40 A 12:20", "8° 12:20 A 13:00",
    "EDUCACIÓN FÍSICA"
  ];
  const horariosTarde = [
    "1° 13:10 A 13:50", "2° 13:50 A 14:30", "3° 14:35 A 15:15", "4° 15:15 A 15:55",
    "5° 16:00 A 16:40", "6° 16:40 A 17:20", "7° 17:20 A 18:00", "8° 18:00 A 18:40",
    "EDUCACIÓN FÍSICA"
  ];

  // --- Carga Inicial ---
  useEffect(() => {
    fetchData();
    fetchSimulations();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Cargar códigos primero para usarlos en la actualización dinámica del turno
      const { data: codData, error: codError } = await supabase.from('codigos').select('*');
      if (codError) throw codError;
      setCodigos(codData || []);

      const { data: estData, error: estError } = await supabase.from('estructura_horario').select('*');
      if (estError) throw estError;

      const parsedData = (estData || []).map(item => {
        const safeParse = (val, fallback) => {
            if (typeof val === 'string') {
              try { return JSON.parse(val); } catch (e) { return fallback; }
            }
            return val || fallback;
        };

        // Lógica de actualización dinámica del turno
        let dynamicTurno = item.turno;
        if (item.cargo === 'DOCENTE' && item.curso && item.division) {
            const foundCode = (codData || []).find(c => String(c.curso) === String(item.curso) && String(c.division) === String(item.division));
            if (foundCode) {
                dynamicTurno = foundCode.turno;
            }
        }

        return {
            ...item,
            turno: dynamicTurno, // Sobrescribir con el turno correcto
            horarios: safeParse(item.horarios, []),
            docente_titular: safeParse(item.docente_titular, { nombre: "---" }),
            docente_interino: safeParse(item.docente_interino, { nombre: "---" }),
            docentes_suplentes: safeParse(item.docentes_suplentes, [])
        };
      });
      setRealSchedule(parsedData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimulations = async () => {
    try {
      const { data, error } = await supabase
        .from('simulaciones_horarios')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setSavedSimulations(data || []);
    } catch (e) {
      console.error("Error fetching simulations", e);
    }
  };

  // --- Helpers de Lógica ---

  // Obtener columnas (Divisiones) disponibles para un turno
  const getColumnsForTurn = (turno) => {
    // Filtramos los códigos para obtener las divisiones únicas de ese turno
    // El requerimiento pide 10 columnas para mañana y 13 para tarde.
    // Intentaremos llenar esas columnas con las divisiones existentes.
    const divisiones = [...new Set(codigos
      .filter(c => c.turno && c.turno.toUpperCase().includes(turno.toUpperCase()) && c.curso && c.division)
      .map(c => `${c.curso} ${c.division}`)
    )].sort();

    return divisiones;
  };

  // Obtener contenido de una celda
  const getCellContent = (dataset, turno, dia, horaIdentifier, divisionStr) => {
    const parts = divisionStr.split(" ");
    const curso = parts[0];
    const division = parts[1];
    
    // Buscar en el dataset
    const item = dataset.find(d => 
      String(d.curso) === String(curso) && 
      String(d.division) === String(division) && 
      d.turno && d.turno.toUpperCase().includes(turno.toUpperCase()) &&
      d.cargo === "DOCENTE" // Solo materias curriculares
    );

    if (!item) return null;

    // Verificar si tiene horario en este día y hora
    const horario = item.horarios.find(h => h.dia === dia);
    if (!horario) return null;

    // Verificamos si la hora está en el array de horas
    let hasHour = false;
    if (typeof horaIdentifier === 'number') {
      hasHour = horario.horas.some(h => h.startsWith(`${horaIdentifier}°`));
    } else {
      hasHour = horario.horas.some(h => h.includes(horaIdentifier));
    }
    
    if (!hasHour) return null;

    return item;
  };

  // Formatear texto del docente según estado
  const getDocenteString = (item) => {
    const { estado } = filters;
    let result = [];

    const titular = item.docente_titular;
    const interino = item.docente_interino;
    const suplentes = item.docentes_suplentes || [];

    // Función auxiliar para verificar estado
    const check = (doc) => {
      if (!doc || doc.nombre === "---" || doc.nombre === "VACANTE") return false;
      if (estado === "TODOS") return true;
      if (estado === "ACTIVOS") return doc.estado === "ACTIVO";
      if (estado === "NO ACTIVOS") return doc.estado === "NO ACTIVO";
      return false;
    };

    // Prioridad: Interino > Titular
    if (check(interino)) result.push(interino.nombre);
    else if (check(titular)) result.push(titular.nombre);

    // Suplentes
    suplentes.forEach(sup => {
      if (check(sup)) result.push(sup.nombre);
    });

    if (result.length === 0) return "";
    
    // Separados por guión intermedio
    return result.join(" - ");
  };

  // Determinar color de fondo por texto
  const getBackgroundColor = (text) => {
    if (!text) return "transparent";
    const lowerText = text.toLowerCase();
    
    if (filters.texto1 && lowerText.includes(filters.texto1.toLowerCase())) return "#90EE90"; // Verde claro
    if (filters.texto2 && lowerText.includes(filters.texto2.toLowerCase())) return "#87CEEB"; // Celeste
    if (filters.texto3 && lowerText.includes(filters.texto3.toLowerCase())) return "#FFFFE0"; // Amarillo claro
    if (filters.texto4 && lowerText.includes(filters.texto4.toLowerCase())) return "#FFDAB9"; // Naranja claro (Peach)
    if (filters.texto5 && lowerText.includes(filters.texto5.toLowerCase())) return "#FF00FF"; // Fucsia (Magenta)
    
    return "transparent";
  };

  // --- Manejadores de Eventos ---

  const handleNewSimulation = () => {
    // Copia profunda de los datos reales para empezar a editar
    setSimulationData(JSON.parse(JSON.stringify(realSchedule)));
    setViewMode("NEW");
    setFilters(prev => ({ ...prev, estado: "TODOS", dias: [] })); // Reset filtros relevantes
  };

  const handleSaveSimulation = async () => {
    const nombreSimulacion = prompt("Ingrese un nombre para esta simulación:");
    if (!nombreSimulacion) return;

    const payload = {
      usuario: user ? `${user.apellido}, ${user.nombre}` : "Desconocido",
      nombre: nombreSimulacion,
      data: simulationData,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('simulaciones_horarios').insert([payload]);
    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      alert("Simulación guardada correctamente.");
      fetchSimulations();
      setViewMode("LIST");
    }
  };

  const handleCellClick = (dataset, turno, dia, horaIdentifier, divisionStr) => {
    if (viewMode !== "NEW") return;

    const cellId = { turno, dia, horaIdentifier, divisionStr };

    if (!selectedCell) {
      setSelectedCell(cellId);
    } else {
      // Intercambiar contenidos
      swapCells(selectedCell, cellId);
      setSelectedCell(null);
    }
  };

  const swapCells = (source, target) => {
    const newData = JSON.parse(JSON.stringify(simulationData));

    const getParams = (cell) => {
      const parts = cell.divisionStr.split(" ");
      return { curso: parts[0], division: parts[1], turno: cell.turno, dia: cell.dia, horaId: cell.horaIdentifier };
    };

    const srcP = getParams(source);
    const tgtP = getParams(target);

    // Helper para encontrar índice del item
    const findItemIdx = (params) => newData.findIndex(d => 
      String(d.curso) === String(params.curso) && 
      String(d.division) === String(params.division) &&
      d.turno && d.turno.toUpperCase().includes(params.turno.toUpperCase()) &&
      d.cargo === "DOCENTE"
    );

    const srcIdx = findItemIdx(srcP);
    const tgtIdx = findItemIdx(tgtP);

    // Helper para extraer y remover horario
    const extractHour = (item, params) => {
      if (!item || !item.horarios) return null;
      const hIdx = item.horarios.findIndex(h => h.dia === params.dia);
      if (hIdx === -1) return null;
      
      const hObj = item.horarios[hIdx];
      const val = typeof params.horaId === 'number' 
        ? hObj.horas.find(x => x.startsWith(`${params.horaId}°`)) 
        : hObj.horas.find(x => x.includes(params.horaId));
      
      if (!val) return null;

      // Remover
      hObj.horas = hObj.horas.filter(x => x !== val);
      if (hObj.horas.length === 0) item.horarios.splice(hIdx, 1);
      
      return val;
    };

    // Helper para agregar horario
    const insertHour = (item, params, val) => {
      // Actualizar prefijo de hora si es numérico (ej: mover de 1° a 2°)
      let newVal = val;
      if (typeof params.horaId === 'number') {
        newVal = val.replace(/^\d+°/, `${params.horaId}°`);
      }

      let hObj = item.horarios.find(h => h.dia === params.dia);
      if (!hObj) {
        hObj = { dia: params.dia, horas: [] };
        item.horarios.push(hObj);
      }
      hObj.horas.push(newVal);
    };

    const srcVal = srcIdx !== -1 ? extractHour(newData[srcIdx], srcP) : null;
    const tgtVal = tgtIdx !== -1 ? extractHour(newData[tgtIdx], tgtP) : null;

    if (srcVal) {
      // Mover item fuente a destino (actualiza curso/división del item completo)
      const item = newData[srcIdx];
      item.curso = tgtP.curso;
      item.division = tgtP.division;
      insertHour(item, tgtP, srcVal);
    }
    
    if (tgtVal) {
      // Mover item destino a fuente
      const item = newData[tgtIdx];
      item.curso = srcP.curso;
      item.division = srcP.division;
      insertHour(item, srcP, tgtVal);
    }

    setSimulationData(newData);
  };

  const handleDeleteSimulation = async (id) => {
    if (window.confirm("¿Eliminar esta simulación?")) {
      const { error } = await supabase.from('simulaciones_horarios').delete().eq('id', id);
      if (!error) fetchSimulations();
    }
  };

  const handleEditSimulation = (sim) => {
    setSimulationData(sim.data); // Cargar datos guardados
    setViewMode("NEW");
  };

  // --- Renderizado de Grillas ---

  const renderGrid = (turno, dia, dataset, isInteractive = false) => {
    const columns = getColumnsForTurn(turno);
    // Limitar columnas según requerimiento (10 para mañana, 13 para tarde)
    const maxCols = turno === "MAÑANA" ? 10 : 13;
    const displayColumns = columns.slice(0, maxCols);

    if (displayColumns.length === 0) return <p>No hay datos para mostrar.</p>;

    const timeSlots = turno === "MAÑANA" ? horariosManana : horariosTarde;

    return (
      <div style={{ overflowX: 'auto', marginBottom: '20px', border: '1px solid #ccc' }}>
        <h4 style={{ backgroundColor: '#333', color: 'white', padding: '5px', margin: 0 }}>{dia} - {turno}</h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ width: '120px', border: '1px solid #999' }}>HORARIOS / CURSOS</th>
              {displayColumns.map(col => (
                <th key={col} style={{ border: '1px solid #999', padding: '5px' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slotLabel, index) => {
              const horaIdentifier = index < 8 ? index + 1 : "EDUCACIÓN FÍSICA";
              // Detección de colisiones en la fila
              const rowDocents = [];
              displayColumns.forEach(col => {
                const item = getCellContent(dataset, turno, dia, horaIdentifier, col);
                if (item) {
                  const docStr = getDocenteString(item);
                  if (docStr) rowDocents.push(docStr);
                }
              });

              // Encontrar duplicados
              const duplicates = rowDocents.filter((item, index) => rowDocents.indexOf(item) !== index);

              return (
                <tr key={index}>
                  <td style={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #999', fontSize: '10px' }}>{slotLabel}</td>
                  {displayColumns.map(col => {
                    const item = getCellContent(dataset, turno, dia, horaIdentifier, col);
                    const docStr = item ? getDocenteString(item) : "";
                    const asigStr = item ? item.asignatura : "";
                    
                    // Estilos
                    let bgColor = "transparent";
                    let textColor = "black";
                    let textShadow = "none";

                    // 1. Filtros de Texto
                    const color1 = getBackgroundColor(docStr);
                    const color2 = getBackgroundColor(asigStr);
                    if (color1 !== "transparent") bgColor = color1;
                    else if (color2 !== "transparent") bgColor = color2;

                    // 2. Colisión (Prioridad sobre filtros de texto)
                    if (docStr && duplicates.includes(docStr)) {
                      bgColor = "#FF3333"; // Rojo fluorescente
                      textColor = "black";
                    }

                    // Selección en modo edición
                    if (selectedCell && selectedCell.turno === turno && selectedCell.dia === dia && selectedCell.horaIdentifier === horaIdentifier && selectedCell.divisionStr === col) {
                      bgColor = "yellow";
                      textShadow = "0 0 5px black";
                    }

                    return (
                      <td 
                        key={col} 
                        style={{ 
                          border: '1px solid #999', 
                          padding: '2px', 
                          backgroundColor: bgColor, 
                          color: textColor,
                          textShadow: textShadow,
                          height: '40px',
                          verticalAlign: 'middle',
                          textAlign: 'center',
                          cursor: isInteractive ? 'pointer' : 'default'
                        }}
                        onClick={() => isInteractive && handleCellClick(dataset, turno, dia, horaIdentifier, col)}
                      >
                        {item && (
                          <>
                            <div style={{ fontWeight: 'bold', fontSize: '9px' }}>{asigStr}</div>
                            <div style={{ fontSize: '9px' }}>{docStr}</div>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // --- Renderizado de Vistas ---

  const renderFilters = (showSaveCancel = false) => (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Filtros Básicos */}
        <select value={filters.turno} onChange={e => setFilters({...filters, turno: e.target.value})} style={{ padding: '5px' }}>
          <option value="">TURNO (Todos)</option>
          <option value="MAÑANA">MAÑANA</option>
          <option value="TARDE">TARDE</option>
        </select>

        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100px', overflowY: 'auto', border: '1px solid #ccc', padding: '5px', backgroundColor: 'white' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>DÍAS:</span>
          {diasSemana.map(d => (
            <label key={d} style={{ fontSize: '11px', display: 'block' }}>
              <input 
                type="checkbox" 
                checked={filters.dias.includes(d)}
                onChange={(e) => {
                  if (e.target.checked) setFilters({...filters, dias: [...filters.dias, d]});
                  else setFilters({...filters, dias: filters.dias.filter(x => x !== d)});
                }}
              /> {d}
            </label>
          ))}
        </div>

        <select value={filters.estado} onChange={e => setFilters({...filters, estado: e.target.value})} style={{ padding: '5px' }}>
          <option value="TODOS">ESTADO: TODOS</option>
          <option value="ACTIVOS">ESTADO: ACTIVOS</option>
          <option value="NO ACTIVOS">ESTADO: NO ACTIVOS</option>
        </select>

        {/* Filtros de Texto con Color */}
        <input placeholder="TEXTO 1 (Verde)" value={filters.texto1} onChange={e => setFilters({...filters, texto1: e.target.value})} style={{ padding: '5px', border: '2px solid #90EE90' }} />
        <input placeholder="TEXTO 2 (Celeste)" value={filters.texto2} onChange={e => setFilters({...filters, texto2: e.target.value})} style={{ padding: '5px', border: '2px solid #87CEEB' }} />
        <input placeholder="TEXTO 3 (Amarillo)" value={filters.texto3} onChange={e => setFilters({...filters, texto3: e.target.value})} style={{ padding: '5px', border: '2px solid #FFFFE0' }} />
        <input placeholder="TEXTO 4 (Naranja)" value={filters.texto4} onChange={e => setFilters({...filters, texto4: e.target.value})} style={{ padding: '5px', border: '2px solid #FFDAB9' }} />
        <input placeholder="TEXTO 5 (Fucsia)" value={filters.texto5} onChange={e => setFilters({...filters, texto5: e.target.value})} style={{ padding: '5px', border: '2px solid #FF00FF' }} />

        {/* Botones de Acción */}
        {showSaveCancel ? (
          <>
            <button onClick={handleSaveSimulation} style={{ backgroundColor: 'green', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>GUARDAR</button>
            <button onClick={() => setViewMode("MAIN")} style={{ backgroundColor: 'red', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>CANCELAR</button>
          </>
        ) : (
          <>
            <button onClick={handleNewSimulation} style={{ backgroundColor: 'blue', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>NUEVA SIMULACIÓN</button>
            <button onClick={() => { setViewMode("LIST"); fetchSimulations(); }} style={{ backgroundColor: 'orange', color: 'black', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>VER SIMULACIONES</button>
          </>
        )}
      </div>
    </div>
  );

  const renderTables = (dataset, isInteractive) => {
    const turnosToShow = filters.turno ? [filters.turno] : ["MAÑANA", "TARDE"];
    const diasToShow = filters.dias.length > 0 ? filters.dias : diasSemana;

    return (
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%" }}>
        {turnosToShow.map(turno => (
          <div key={turno}>
            {diasToShow.map(dia => (
              <div key={`${turno}-${dia}`}>
                {renderGrid(turno, dia, dataset, isInteractive)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderSavedList = () => (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '8px', width: '95%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>SIMULACIONES GUARDADAS</h3>
        <button onClick={() => setViewMode("MAIN")} style={{ backgroundColor: 'gray', color: 'white', padding: '5px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>VOLVER</button>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#333', color: 'white' }}>
            <th style={{ padding: '10px' }}>ORDEN</th>
            <th style={{ padding: '10px' }}>NOMBRE</th>
            <th style={{ padding: '10px' }}>USUARIO</th>
            <th style={{ padding: '10px' }}>FECHA</th>
            <th style={{ padding: '10px' }}>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {savedSimulations.map((sim, index) => (
            <tr key={sim.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '10px', textAlign: 'center' }}>{savedSimulations.length - index}</td>
              <td style={{ padding: '10px' }}>{sim.nombre}</td>
              <td style={{ padding: '10px' }}>{sim.usuario}</td>
              <td style={{ padding: '10px' }}>{new Date(sim.created_at).toLocaleString()}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button onClick={() => { setSimulationData(sim.data); setViewMode("NEW"); }} style={{ marginRight: '5px', cursor: 'pointer' }}>VER</button>
                <button onClick={() => handleEditSimulation(sim)} style={{ marginRight: '5px', cursor: 'pointer' }}>EDITAR</button>
                <button onClick={() => handleDeleteSimulation(sim.id)} style={{ marginRight: '5px', cursor: 'pointer', color: 'red' }}>ELIMINAR</button>
                <button onClick={() => {
                   // Imprimir simple: Cargar datos en vista y abrir print
                   setSimulationData(sim.data);
                   setViewMode("NEW");
                   setTimeout(() => window.print(), 500);
                }} style={{ cursor: 'pointer' }}>IMPRIMIR</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2 style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '10px', borderRadius: '5px' }}>
        {viewMode === "MAIN" && "SIMULADOR DE HORARIOS"}
        {viewMode === "NEW" && "NUEVA SIMULACIÓN"}
        {viewMode === "LIST" && "VER SIMULACIONES"}
      </h2>

      {loading ? (
        <p style={{ color: 'white', fontWeight: 'bold' }}>Cargando datos...</p>
      ) : (
        <>
          {viewMode === "MAIN" && (
            <>
              {renderFilters(false)}
              {renderTables(realSchedule, false)}
            </>
          )}

          {viewMode === "NEW" && (
            <>
              {renderFilters(true)}
              <p style={{ color: 'white', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                Haga clic en una celda para seleccionarla y luego en otra para intercambiar contenido.
              </p>
              {renderTables(simulationData, true)}
            </>
          )}

          {viewMode === "LIST" && renderSavedList()}
        </>
      )}
    </div>
  );
};

export default SimuladorHorarios;