import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets/logos/Logo.png";

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
    
    // 1. Filtrar todos los items (materias) para este curso/división y turno
    const itemsForCourse = dataset.filter(d => 
      String(d.curso) === String(curso) && 
      String(d.division) === String(division) && 
      d.turno && d.turno.toUpperCase().includes(turno.toUpperCase()) &&
      d.cargo === "DOCENTE" // Solo materias curriculares
    );

    if (itemsForCourse.length === 0) return null;

    // 2. De esos items, encontrar el que tiene clase en esta celda de tiempo específica
    const itemInSlot = itemsForCourse.find(item => {
      if (!item.horarios || !Array.isArray(item.horarios)) return false;
      
      const horarioDelDia = item.horarios.find(h => h.dia === dia);
      if (!horarioDelDia) return false;

      let hasHour = false;
      if (typeof horaIdentifier === 'number') {
        hasHour = horarioDelDia.horas.some(h => h.startsWith(`${horaIdentifier}°`));
      } else { // "EDUCACIÓN FÍSICA"
        hasHour = horarioDelDia.horas.some(h => h.includes(horaIdentifier));
      }
      return hasHour;
    });

    return itemInSlot || null; // Retorna el item encontrado o null
  };

  // --- Helpers para formateo de texto en impresión ---
  const formatDocente = (nombre) => {
    if (!nombre || nombre === "VACANTE" || nombre === "---") return nombre;
    
    // Manejar múltiples docentes separados por " - "
    return nombre.split(" - ").map(d => {
      const parts = d.split(",");
      if (parts.length > 1) {
          const apellido = parts[0].trim();
          const rest = parts[1].trim();
          // Extraer primer nombre y mantener etiqueta (T)/(I)/(S) si existe
          const restParts = rest.split(" ");
          const primerNombre = restParts[0];
          const etiqueta = restParts.length > 1 ? ` ${restParts.slice(1).join(" ")}` : "";
          return `${apellido}, ${primerNombre}${etiqueta}`;
      }
      return d;
    }).join(" - ");
  };

  const formatAsignatura = (asig) => {
      if (!asig) return "";
      let text = asig;
      const upperAsig = text.toUpperCase().trim();

      const mapping = {
        "ADMINISTRACIÓN Y TEORÍA DE LAS ORGANIZACIONES I": "ADIM. Y TEORÍA DE LAS ORG. I",
        "ADMINISTRACIÓN Y TEORÍA DE LAS ORGANIZACIONES II": "ADIM. Y TEORÍA DE LAS ORG. II",
        "APLICACIONES INFORMÁTICAS": "APLIC. INFORMATICAS",
        "ARTE Y ESTÉTICA CONTEMPORÁNEA": "ARTE Y EST. CONTEMP.",
        "BIOLOGÍA I": "BIOLOGÍA I",
        "BIOLOGÍA II": "BIOLOGÍA II",
        "BIOLOGÍA III": "BIOLOGÍA III",
        "BIOLOGÍA IV": "BIOLOGÍA IV",
        "CONSTRUCCIÓN DE CIUDADANÍA": "CONST. DE LA CIUD.",
        "DERECHO": "DERECHO",
        "ECONOMÍA": "ECONOMÍA",
        "ECONOMÍA SOCIAL": "ECONOMIA SOC.",
        "EDUCACIÓN ARTÍSTICA I: PLÁSTICA": "PLÁSTICA I",
        "EDUCACIÓN ARTÍSTICA II: PLÁSTICA": "PLÁSTICA II",
        "EDUCACIÓN ARTÍSTICA III: PLÁSTICA": "PLÁSTICA III",
        "EDUCACIÓN FÍSICA I": "EDUC. FÍSICA I",
        "EDUCACIÓN FÍSICA II": "EDUC. FÍSICA II",
        "EDUCACIÓN FÍSICA III": "EDUC. FÍSICA III",
        "EDUCACIÓN FÍSICA IV": "EDUC. FÍSICA IV",
        "EDUCACIÓN FÍSICA V": "EDUC. FÍSICA V",
        "EDUCACIÓN FÍSICA VI": "EDUC. FÍSICA VI",
        "EDUCACIÓN TECNOLÓGICA I": "EDUC. TECNOLÓGICA I",
        "EDUCACIÓN TECNOLÓGICA II": "EDUC. TECNOLÓGICA II",
        "FÍSICA I": "FÍSICA I",
        "FÍSICA II": "FÍSICA II",
        "FÍSICA III": "FÍSICA III",
        "FILOSOFÍA": "FILOSOFÍA",
        "FORMACIÓN ÉTICA I / RELIGIOSA": "FORM. ÉTICA I / RELIG.",
        "FORMACIÓN ÉTICA II / RELIGIOSA": "FORM. ÉTICA II / RELIG.",
        "FORMACIÓN ÉTICA III / RELIGIOSA": "FORM. ÉTICA III / RELIG.",
        "GEOGRAFÍA I": "GEOGRAFÍA I",
        "GEOGRAFÍA II": "GEOGRAFÍA II",
        "GEOGRAFÍA III": "GEOGRAFÍA III",
        "GEOGRAFÍA IV": "GEOGRAFÍA IV",
        "GEOGRAFÍA V": "GEOGRAFÍA V",
        "HISTORIA I": "HISTORIA I",
        "HISTORIA II": "HISTORIA II",
        "HISTORIA III": "HISTORIA III",
        "HISTORIA IV": "HISTORIA IV",
        "HISTORIA V": "HISTORIA V",
        "INVESTIGACIÓN Y DESARROLLO TECNOLÓGICO": "INVEST. Y DES. TECNOLÓGICO",
        "LENGUA EXTRANJERA (FRANCÉS) I": "FRANCÉS I",
        "LENGUA EXTRANJERA (FRANCÉS) II": "FRANCÉS II",
        "LENGUA EXTRANJERA (FRANCÉS) III": "FRANCÉS III",
        "LENGUA EXTRANJERA (FRANCÉS) IV": "FRANCÉS IV",
        "LENGUA EXTRANJERA (FRANCÉS) V": "FRANCÉS V",
        "LENGUA EXTRANJERA (FRANCÉS) VI": "FRANCÉS VI",
        "LENGUA EXTRANJERA (INGLÉS) I": "INGLÉS I",
        "LENGUA EXTRANJERA (INGLÉS) II": "INGLÉS II",
        "LENGUA EXTRANJERA (INGLÉS) III": "INGLÉS III",
        "LENGUA EXTRANJERA (INGLÉS) IV": "INGLÉS IV",
        "LENGUA EXTRANJERA (INGLÉS) V": "INGLÉS V",
        "LENGUA EXTRANJERA (INGLÉS) VI": "INGLÉS VI",
        "LENGUA Y LITERATURA I": "LENGUA Y LIT. I",
        "LENGUA Y LITERATURA II": "LENGUA Y LIT. II",
        "LENGUA Y LITERATURA III": "LENGUA Y LIT. III",
        "LENGUA Y LITERATURA IV": "LENGUA Y LIT. IV",
        "LENGUA Y LITERATURA V": "LENGUA Y LIT. V",
        "LENGUA Y LITERATURA VI": "LENGUA Y LIT. VI",
        "MATEMÁTICA I": "MATEMÁTICA I",
        "MATEMÁTICA II": "MATEMÁTICA II",
        "MATEMÁTICA III": "MATEMÁTICA III",
        "MATEMÁTICA IV": "MATEMÁTICA IV",
        "MATEMÁTICA V": "MATEMÁTICA V",
        "MATEMÁTICA VI": "MATEMÁTICA VI",
        "POLÍTICA Y CIUDADANÍA": "POLITICA Y CIUD.",
        "PROYECTO TECNOLÓGICO EN INFORMÁTICA": "PROY. TECNOLÓGICO EN INF.",
        "PROYECTO Y GESTIÓN DE MICROEMPRENDIMIENTO": "PROY. Y GEST. MICROEMP.",
        "QUÍMICA I": "QUÍMICA I",
        "QUÍMICA II": "QUÍMICA II",
        "QUÍMICA III": "QUÍMICA III",
        "SALUD Y ADOLESCENCIA": "SALUD Y ADOLESC.",
        "SEGURIDAD Y LEGISLACIÓN EN INFORMÁTICA": "SEG. Y LEGISLACIÓN EN INF.",
        "SISTEMA DE INFORMACIÓN CONTABLE I": "SIST. DE INF. CONTABLE I",
        "SISTEMA DE INFORMACIÓN CONTABLE II": "SIST. DE INF. CONTABLE II",
        "TECNOLOGÍA DE LA CONECTIVIDAD": "TECN. DE LA CONECT.",
        "TECNOLOGÍA DE LA INFORMACIÓN Y LA COMUNICACIÓN": "T.I.C.",
        "TECNOLOGÍA DE LOS SISTEMAS INFORMÁTICOS": "TECN. DE LOS SIST. INFORMÁTICOS",
        "TECNOLOGÍA MULTIMEDIAL": "TECN. MULTIMEDIAL",
        "TRABAJO Y CIUDADANÍA": "TRABAJO Y CIUD."
      };

      if (mapping[upperAsig]) {
        return mapping[upperAsig];
      }

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

  // Formatear texto del docente según estado
  const getDocenteString = (item) => {
    const { estado } = filters;
    const parts = [];
    const titular = item.docente_titular;
    const interino = item.docente_interino;
    const suplentes = item.docentes_suplentes || [];
    const exists = (d) => d && d.nombre && d.nombre !== "---" && d.nombre !== "VACANTE";

    if (estado === "TODOS") {
        if (exists(titular)) parts.push(`${titular.nombre} (T)`);
        if (exists(interino)) parts.push(`${interino.nombre} (I)`);
        suplentes.forEach(s => { if (exists(s)) parts.push(`${s.nombre} (S)`); });
        if (parts.length === 0) return "VACANTE";
        return parts.join(" - ");
    } else if (estado === "ACTIVOS") {
        if (exists(titular) && titular.estado === "ACTIVO") parts.push(titular.nombre);
        if (exists(interino) && interino.estado === "ACTIVO") parts.push(interino.nombre);
        suplentes.forEach(s => { if (exists(s) && s.estado === "ACTIVO") parts.push(s.nombre); });
        if (parts.length === 0) return "VACANTE";
        return parts.join(" - ");
    } else { // NO ACTIVOS
        if (exists(titular) && titular.estado === "NO ACTIVO") parts.push(titular.nombre);
        if (exists(interino) && interino.estado === "NO ACTIVO") parts.push(interino.nombre);
        suplentes.forEach(s => { if (exists(s) && s.estado === "NO ACTIVO") parts.push(s.nombre); });
        if (parts.length === 0) return "";
        return parts.join(" - ");
    }
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
      return { curso: parts[0], division: parts[1], turno: cell.turno, dia: cell.dia, horaId: cell.horaIdentifier, divisionStr: cell.divisionStr };
    };

    const srcP = getParams(source);
    const tgtP = getParams(target);

    // Find the actual items in the cells using the same logic as renderGrid
    const srcItem = getCellContent(newData, srcP.turno, srcP.dia, srcP.horaId, srcP.divisionStr);
    const tgtItem = getCellContent(newData, tgtP.turno, tgtP.dia, tgtP.horaId, tgtP.divisionStr);

    // If we are swapping two empty cells, do nothing.
    if (!srcItem && !tgtItem) {
      return;
    }

    // Helper to find the full hour string (e.g., "1° 07:30 A 08.10") from an identifier
    const getHourStringFromId = (params) => {
      if (typeof params.horaId !== 'number') return params.horaId; // e.g., "EDUCACIÓN FÍSICA"
      const labels = params.turno.toUpperCase().includes("MAÑANA") ? horariosManana : horariosTarde;
      const index = params.horaId - 1;
      return labels[index] || `${params.horaId}°`; // Fallback
    };

    // 1. Remove old time slots from items
    if (srcItem) {
      const horarioDelDia = srcItem.horarios.find(h => h.dia === srcP.dia);
      if (horarioDelDia) {
        if (typeof srcP.horaId === 'number') {
            horarioDelDia.horas = horarioDelDia.horas.filter(h => !h.startsWith(`${srcP.horaId}°`));
        } else { // It's "EDUCACIÓN FÍSICA"
            horarioDelDia.horas = horarioDelDia.horas.filter(h => !h.includes(srcP.horaId));
        }
        // If the day has no more hours, remove the day object
        if (horarioDelDia.horas.length === 0) {
          srcItem.horarios = srcItem.horarios.filter(h => h.dia !== srcP.dia);
        }
      }
    }
    if (tgtItem) {
      const horarioDelDia = tgtItem.horarios.find(h => h.dia === tgtP.dia);
      if (horarioDelDia) {
        if (typeof tgtP.horaId === 'number') {
            horarioDelDia.horas = horarioDelDia.horas.filter(h => !h.startsWith(`${tgtP.horaId}°`));
        } else { // It's "EDUCACIÓN FÍSICA"
            horarioDelDia.horas = horarioDelDia.horas.filter(h => !h.includes(tgtP.horaId));
        }
        // If the day has no more hours, remove the day object
        if (horarioDelDia.horas.length === 0) {
          tgtItem.horarios = tgtItem.horarios.filter(h => h.dia !== tgtP.dia);
        }
      }
    }

    // 2. Add new time slots to items
    if (srcItem) { // Move source item to target's slot
      let horarioDelDia = srcItem.horarios.find(h => h.dia === tgtP.dia);
      if (!horarioDelDia) {
        horarioDelDia = { dia: tgtP.dia, horas: [] };
        srcItem.horarios.push(horarioDelDia);
      }
      horarioDelDia.horas.push(getHourStringFromId(tgtP));
    }
    if (tgtItem) { // Move target item to source's slot
      let horarioDelDia = tgtItem.horarios.find(h => h.dia === srcP.dia);
      if (!horarioDelDia) {
        horarioDelDia = { dia: srcP.dia, horas: [] };
        tgtItem.horarios.push(horarioDelDia);
      }
      horarioDelDia.horas.push(getHourStringFromId(srcP));
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

  const handlePrintSimulation = (sim) => {
    setSimulationData(sim.data);
    setViewMode("NEW"); // Re-utilizamos la vista de edición para renderizar las tablas a imprimir
    
    // Esperamos un momento para que React actualice el DOM
    setTimeout(() => {
        document.body.classList.add('print-simulation-active');
        window.print();
        document.body.classList.remove('print-simulation-active');
    }, 500);
  };

  // --- Renderizado de Grillas ---

  const renderGrid = (turno, dia, dataset, isInteractive = false) => {
    const columns = getColumnsForTurn(turno);
    // Limitar columnas según requerimiento (10 para mañana, 13 para tarde)
    const maxCols = turno === "MAÑANA" ? 10 : 13;
    const displayColumns = columns.slice(0, maxCols);

    if (displayColumns.length === 0) return <p>No hay datos para mostrar.</p>;

    const timeSlots = turno === "MAÑANA" ? horariosManana : horariosTarde;

    // Estilos de impresión
    const headerHeight = '1.5cm';
    const bodyRowHeight = turno === "MAÑANA" ? '1.6cm' : '1.7cm';
    
    const cellStyle = { 
      border: '1px solid #999', 
      padding: '1px', 
      verticalAlign: 'middle',
      textAlign: 'center',
      overflow: "hidden",
      whiteSpace: "normal",
      wordWrap: "break-word",
      lineHeight: "1.1"
    };

    const firstColStyle = { ...cellStyle, width: '2.5cm', minWidth: '2.5cm', maxWidth: '2.5cm', fontWeight: 'bold', fontSize: '10px' };
    const headerStyle = { ...cellStyle, padding: '5px', fontWeight: 'bold', height: headerHeight };

    return (
      <div style={{ overflowX: 'auto', marginBottom: '20px', border: '1px solid #ccc' }}>
        <h4 style={{ backgroundColor: '#333', color: 'white', padding: '5px', margin: 0 }}>{dia} - {turno}</h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0", height: headerHeight }}>
              <th style={firstColStyle}>HORARIOS / CURSOS</th>
              {displayColumns.map(col => (
                <th key={col} style={headerStyle}>{col}</th>
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
                <tr key={index} style={{ height: bodyRowHeight }}>
                  <td style={firstColStyle}>{slotLabel}</td>
                  {displayColumns.map(col => {
                    const item = getCellContent(dataset, turno, dia, horaIdentifier, col);
                    const docStr = item ? getDocenteString(item) : "";
                    const asigStr = item ? item.asignatura : "";
                    
                    const formattedAsig = formatAsignatura(asigStr);
                    const formattedDoc = formatDocente(docStr);
                    const textLength = formattedAsig.length + formattedDoc.length;
                    let fontSize = "12px";
                    if (textLength > 45) fontSize = "9px";
                    else if (textLength > 30) fontSize = "10px";
                    else if (textLength > 15) fontSize = "11px";
                    
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
                          ...cellStyle,
                          fontSize: fontSize,
                          backgroundColor: bgColor, 
                          color: textColor,
                          textShadow: textShadow,
                          cursor: isInteractive ? 'pointer' : 'default'
                        }}
                        onClick={() => isInteractive && handleCellClick(dataset, turno, dia, horaIdentifier, col)}
                      >
                        {item && (
                          <>
                            <div style={{ fontWeight: 'bold', fontSize: 'inherit' }}>{formattedAsig}</div>
                            <div style={{ fontSize: 'inherit' }}>{formattedDoc}</div>
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
              <div key={`${turno}-${dia}`} className="print-page-container">
                <div className="print-header">
                  <img src={logo} alt="Logo" />
                  <div>
                    <h1>Escuela Secundaria Gobernador Garmendia</h1>
                    <p>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                  </div>
                </div>
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
                   handlePrintSimulation(sim);
                }} style={{ cursor: 'pointer' }}>IMPRIMIR</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Variables para CSS dinámico de impresión
  // Determinar si necesitamos hoja Oficio (Legal) basado en el filtro o el contenido
  const currentData = viewMode === "NEW" ? simulationData : realSchedule;
  const hasTardeContent = currentData.some(d => d.turno && d.turno.toUpperCase().includes("TARDE"));
  
  const isTardePrint = filters.turno === "TARDE" || (!filters.turno && hasTardeContent);
  
  const pageSizeCSS = isTardePrint ? "Legal landscape" : "A4 landscape";
  const pageWidthCSS = isTardePrint ? "330mm" : "270mm";

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
      <style>{`
        .print-header { display: none; }
        @media print {
          body.print-simulation-active { background-color: white !important; }
          body.print-simulation-active .pagina-submenu { background-image: none !important; padding: 0; min-height: 0; overflow: visible; }
          body.print-simulation-active .navbar, 
          body.print-simulation-active h2, 
          body.print-simulation-active div[style*="background-color: rgba(255,255,255,0.9)"],
          body.print-simulation-active p[style*="color: white"] {
            display: none !important;
          }
          body.print-simulation-active .contenido-submenu { width: 100% !important; max-width: 100% !important; margin: 0; padding: 0; background-color: transparent; box-shadow: none; }
          
          .print-page-container { 
            page-break-after: always; 
            padding: 5mm; 
            width: ${pageWidthCSS}; 
            min-height: 190mm; 
            box-sizing: border-box; 
            display: flex; 
            flex-direction: column; 
          }
          .print-header { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .print-header img { width: 60px; margin-right: 20px; }
          .print-header div h1 { font-size: 16px; margin: 0; color: black; }
          .print-header div p { font-size: 12px; margin: 2px 0; color: black !important; }
          
          @page { size: ${pageSizeCSS}; margin: 5mm; }
        }
      `}</style>
    </div>
  );
};

export default SimuladorHorarios;