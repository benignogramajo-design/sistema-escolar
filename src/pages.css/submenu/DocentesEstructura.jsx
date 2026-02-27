import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets.css/logos/Logo.png";

const DocentesEstructura = ({ goBack, goHome }) => {
  const [estructura, setEstructura] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [docentesList, setDocentesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("view"); // 'view', 'create', 'edit'
  const [selectedId, setSelectedId] = useState(null);

  // --- Estados para Listas Desplegables Filtradas ---
  const [availableDivisiones, setAvailableDivisiones] = useState([]);
  const [availableAsignaturas, setAvailableAsignaturas] = useState([]);
  const [availablePlazas, setAvailablePlazas] = useState([]);
  const [plazasEducacionFisica, setPlazasEducacionFisica] = useState([]);
  const [availableTurnos, setAvailableTurnos] = useState([]);

  // --- Estado del Formulario ---
  const initialFormState = {
    cargo: "",
    curso: "",
    division: "",
    turno: "",
    asignatura: "",
    horarios: [], // Array de objetos { dia, horas: [], ef_horario: '', plazas: { [hora]: plaza } }
    docente_titular: { nombre: "---", estado: "" },
    docente_interino: { nombre: "---", estado: "" },
    docentes_suplentes: [] // Array de objetos { nombre: '---', estado: '' }
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Filtros ---
  const [filters, setFilters] = useState({
    curso: "",
    division: "",
    turno: "",
    dia: "",
    asignatura: "",
    docente: "",
    estado: ""
  });

  // --- Constantes de Horarios ---
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const horariosManana = [
    "1° de 07:30 a 08:10", "2° de 08:10 a 08:50", "3° de 08:55 a 09:35", "4° de 09:35 a 10:15",
    "5° de 10:20 a 11:00", "6° de 11:00 a 11:40", "7° de 11:40 a 12:20", "8° de 12:20 a 13:00"
  ];
  const horariosTarde = [
    "1° de 13:10 a 13:50", "2° de 13:50 a 14:30", "3° de 14:35 a 15:15", "4° de 15:15 a 15:55",
    "5° de 16:00 a 16:40", "6° de 16:40 a 17:20", "7° de 17:20 a 18:00", "8° de 18:00 a 18:40"
  ];

  // --- Carga de Datos ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Cargar Estructura guardada
        const { data: estData, error: estError } = await supabase
          .from('estructura_horario')
          .select('*')
          .order('id', { ascending: false });
        
        if (estError && estError.code !== 'PGRST116') console.error("Error estructura:", estError); // Ignorar si tabla no existe aun
        setEstructura(estData || []);

        // 2. Cargar Códigos (para Cursos, Div, Turno, Asignatura)
        const { data: codData } = await supabase.from('codigos').select('*');
        setCodigos(codData || []);

        // 3. Cargar Docentes (para listas desplegables)
        const { data: docData } = await supabase
          .from('datos_de_legajo_docentes')
          .select('apellido, nombre')
          .order('apellido');
        
        const formattedDocentes = (docData || []).map(d => `${d.apellido}, ${d.nombre}`);
        setDocentesList(formattedDocentes);

      } catch (error) {
        console.error("Error general:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Lógica del Formulario: Dependencias Curso/División/Turno ---
  useEffect(() => {
    if (formData.curso) {
      // Filtrar divisiones basadas en el curso seleccionado
      const divs = [...new Set(codigos.filter(c => c.curso === formData.curso).map(c => c.division))].sort();
      setAvailableDivisiones(divs);
    } else {
      setAvailableDivisiones([]);
    }
  }, [formData.curso, codigos]);

  useEffect(() => {
    if (formData.cargo === "DOCENTE" && formData.curso && formData.division) {
      // 1. Determinar Turno
      const found = codigos.find(c => c.curso === formData.curso && c.division === formData.division);
      if (found) {
        setFormData(prev => ({ ...prev, turno: found.turno }));
      }

      // 2. Filtrar Asignaturas
      const asigs = [...new Set(codigos
        .filter(c => c.curso === formData.curso && c.division === formData.division)
        .map(c => c.asignatura)
      )].sort();
      setAvailableAsignaturas(asigs);
    } else if (formData.cargo === "DOCENTE") {
      setAvailableAsignaturas([]);
    }
  }, [formData.cargo, formData.curso, formData.division, codigos]);

  // --- Lógica para Turnos (No Docente) ---
  useEffect(() => {
    if (formData.cargo && formData.cargo !== "DOCENTE") {
      const turnos = [...new Set(codigos
        .filter(c => c.cargo === formData.cargo)
        .map(c => c.turno)
        .filter(Boolean)
      )].sort();
      setAvailableTurnos(turnos);
    } else {
      setAvailableTurnos([]);
    }
  }, [formData.cargo, codigos]);

  // --- Lógica para Plazas ---
  useEffect(() => {
    let found = null;
    if (formData.cargo === "DOCENTE" && formData.curso && formData.division && formData.asignatura) {
      found = codigos.find(c => 
        c.curso === formData.curso && 
        c.division === formData.division && 
        c.asignatura === formData.asignatura
      );
    } else if (formData.cargo !== "DOCENTE" && formData.cargo && formData.turno) {
      found = codigos.find(c => c.cargo === formData.cargo && c.turno === formData.turno);
    }

    if (found) {
      
      if (found.plazas) {
        let p = found.plazas;
        if (typeof p === 'string') {
          try { p = JSON.parse(p); } catch (e) { p = [p]; }
        }
        setAvailablePlazas(Array.isArray(p) ? p : []);
      } else {
        setAvailablePlazas([]);
      }
    } else {
      setAvailablePlazas([]);
    }
  }, [formData.cargo, formData.curso, formData.division, formData.asignatura, formData.turno, codigos]);

  // --- Lógica para Plazas de Educación Física ---
  useEffect(() => {
    if (formData.cargo === "DOCENTE" && formData.curso && formData.division) {
      const efCodigo = codigos.find(c =>
        c.curso === formData.curso &&
        c.division === formData.division &&
        (c.asignatura || '').toUpperCase().includes('EDUCACIÓN FÍSICA')
      );
      if (efCodigo && efCodigo.plazas) {
        let p = efCodigo.plazas;
        if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e) { p = [p]; } }
        setPlazasEducacionFisica(Array.isArray(p) ? p : []);
      } else {
        setPlazasEducacionFisica([]);
      }
    } else {
      setPlazasEducacionFisica([]);
    }
  }, [formData.cargo, formData.curso, formData.division, codigos]);

  // --- Manejadores del Formulario ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "cargo") {
      // Resetear campos dependientes al cambiar cargo
      setFormData(prev => ({
        ...prev,
        cargo: value,
        curso: "", division: "", turno: "", asignatura: "",
        horarios: [], // Opcional: limpiar horarios si cambia la estructura
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manejo de Horarios (Días y Horas)
  const addDiaHorario = () => {
    setFormData(prev => ({
      ...prev,
      horarios: [...prev.horarios, { dia: "", horas: [], ef_horario: "", plazas: {} }]
    }));
  };

  const removeDiaHorario = (index) => {
    const newHorarios = [...formData.horarios];
    newHorarios.splice(index, 1);
    setFormData(prev => ({ ...prev, horarios: newHorarios }));
  };

  const updateDiaHorario = (index, field, value) => {
    const newHorarios = [...formData.horarios];
    newHorarios[index][field] = value;
    setFormData(prev => ({ ...prev, horarios: newHorarios }));
  };

  const toggleHora = (index, hora) => {
    const newHorarios = [...formData.horarios];
    let currentHoras = [...newHorarios[index].horas];
    let currentPlazas = {...newHorarios[index].plazas};

    const isChecking = !currentHoras.includes(hora);

    if (isChecking) {
      if (hora === "EDUCACIÓN FÍSICA") {
        // Clear all regular hours and their plazas
        Object.keys(currentPlazas).forEach(key => delete currentPlazas[key]);
        currentHoras = [hora]; // Set EF as the only hour
        currentPlazas[hora] = plazasEducacionFisica.join(" - ");
      } else { // Checking a regular hour
        // If EF is present, we are switching, so clear EF
        if (currentHoras.includes("EDUCACIÓN FÍSICA")) {
          delete currentPlazas["EDUCACIÓN FÍSICA"];
          currentHoras = []; // Start fresh
        }
        // Add the new regular hour
        currentHoras.push(hora);
        currentPlazas[hora] = "";
      }
    } else { // Unchecking
      currentHoras = currentHoras.filter(h => h !== hora);
      delete currentPlazas[hora];
    }

    newHorarios[index].horas = currentHoras;
    newHorarios[index].plazas = currentPlazas;
    setFormData(prev => ({ ...prev, horarios: newHorarios }));
  };

  const updateHoraPlaza = (index, hora, plaza) => {
    const newHorarios = [...formData.horarios];
    newHorarios[index].plazas[hora] = plaza;
    setFormData(prev => ({ ...prev, horarios: newHorarios }));
  };

  // Manejo de Docentes (Titular, Interino, Suplentes)
  const updateDocenteField = (type, field, value, index = null) => {
    setFormData(prev => {
      if (type === 'suplente' && index !== null) {
        const newSuplentes = [...prev.docentes_suplentes];
        newSuplentes[index][field] = value;
        return { ...prev, docentes_suplentes: newSuplentes };
      } else {
        return {
          ...prev,
          [type]: { ...prev[type], [field]: value }
        };
      }
    });
  };

  const addSuplente = () => {
    setFormData(prev => ({
      ...prev,
      docentes_suplentes: [...prev.docentes_suplentes, { nombre: "---", estado: "" }]
    }));
  };

  const removeSuplente = (index) => {
    const newSuplentes = [...formData.docentes_suplentes];
    newSuplentes.splice(index, 1);
    setFormData(prev => ({ ...prev, docentes_suplentes: newSuplentes }));
  };

  // --- Guardar / Eliminar ---
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Preparar datos para guardar (JSON stringify si es necesario, Supabase maneja JSONB auto)
      const payload = {
        ...formData
      };

      if (mode === "create") {
        const { error } = await supabase.from('estructura_horario').insert([payload]);
        if (error) throw error;
      } else if (mode === "edit" && selectedId) {
        const { error } = await supabase.from('estructura_horario').update(payload).eq('id', selectedId);
        if (error) throw error;
      }

      alert("Datos guardados correctamente.");
      setMode("view");
      setFormData(initialFormState);
      setSelectedId(null);
      // Recargar datos
      const { data } = await supabase.from('estructura_horario').select('*').order('id', { ascending: false });
      setEstructura(data || []);
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      try {
        const { error } = await supabase.from('estructura_horario').delete().eq('id', selectedId);
        if (error) throw error;
        
        const { data } = await supabase.from('estructura_horario').select('*').order('id', { ascending: false });
        setEstructura(data || []);
        setMode("view");
        setSelectedId(null);
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  const handleRowClick = (item) => {
    if (mode === "edit" || mode === "delete") {
      setSelectedId(item.id);
      if (mode === "edit") {
        // Asegurar que los campos JSON se carguen correctamente
        setFormData({
          cargo: item.cargo || "",
          curso: item.curso,
          division: item.division,
          turno: item.turno,
          asignatura: item.asignatura,
          horarios: (Array.isArray(item.horarios) ? item.horarios : []).map(h => ({
            ...h,
            plazas: h.plazas || {} // Asegurar que el objeto plazas exista
          })),
          docente_titular: item.docente_titular || { nombre: "---", estado: "" },
          docente_interino: item.docente_interino || { nombre: "---", estado: "" },
          docentes_suplentes: Array.isArray(item.docentes_suplentes) ? item.docentes_suplentes : []
        });
      }
    }
  };

  // --- Helpers ---
  const getOptionsForPlaza = (currentValue) => {
    const counts = {};
    availablePlazas.forEach(p => counts[p] = (counts[p] || 0) + 1);
    
    const used = {};
    formData.horarios.forEach(h => {
      Object.entries(h.plazas).forEach(([hr, p]) => {
        if (hr !== "EDUCACIÓN FÍSICA" && p) {
          used[p] = (used[p] || 0) + 1;
        }
      });
    });

    const uniqueAvailable = [...new Set(availablePlazas)];
    return uniqueAvailable.filter(p => {
      const total = counts[p] || 0;
      const u = used[p] || 0;
      const adjustment = (p === currentValue) ? 1 : 0;
      return (total - u + adjustment) > 0;
    });
  };

  // --- Renderizado de Componentes Auxiliares ---
  const renderDocenteInput = (label, type, data, index = null) => (
    <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '10px', backgroundColor: '#f9f9f9' }}>
      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{label}:</label>
      <select 
        value={data.nombre} 
        onChange={(e) => updateDocenteField(type, 'nombre', e.target.value, index)}
        style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
      >
        <option value="---">---</option>
        <option value="VACANTE">VACANTE</option>
        {docentesList.map((doc, i) => <option key={i} value={doc}>{doc}</option>)}
      </select>
      
      {data.nombre !== "VACANTE" && data.nombre !== "---" && (
        <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
          <label style={{ cursor: 'pointer' }}>
            <input 
              type="radio" 
              name={`estado_${type}_${index !== null ? index : ''}`}
              checked={data.estado === "ACTIVO"}
              onChange={() => updateDocenteField(type, 'estado', "ACTIVO", index)}
            /> ACTIVO
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input 
              type="radio" 
              name={`estado_${type}_${index !== null ? index : ''}`}
              checked={data.estado === "NO ACTIVO"}
              onChange={() => updateDocenteField(type, 'estado', "NO ACTIVO", index)}
            /> NO ACTIVO
          </label>
        </div>
      )}
      {type === 'suplente' && (
        <button type="button" onClick={() => removeSuplente(index)} style={{ marginTop: '5px', backgroundColor: 'red', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>Quitar Suplente</button>
      )}
    </div>
  );

  // --- Filtrado de Datos ---
  const filteredData = estructura.filter(item => {
    // Helper para buscar texto en objetos JSON
    const searchInDocentes = (docObj, term) => {
      if (!docObj) return false;
      return (docObj.nombre || "").toLowerCase().includes(term);
    };
    const searchInSuplentes = (arr, term) => {
      if (!Array.isArray(arr)) return false;
      return arr.some(s => (s.nombre || "").toLowerCase().includes(term));
    };

    const matchCurso = !filters.curso || item.curso === filters.curso;
    const matchDiv = !filters.division || item.division === filters.division;
    const matchTurno = !filters.turno || item.turno === filters.turno;
    const matchAsig = !filters.asignatura || (item.asignatura || "").toLowerCase().includes(filters.asignatura.toLowerCase());
    
    const matchDia = !filters.dia || (Array.isArray(item.horarios) && item.horarios.some(h => h.dia === filters.dia));
    
    const termDoc = filters.docente.toLowerCase();
    const matchDocente = !filters.docente || 
      searchInDocentes(item.docente_titular, termDoc) || 
      searchInDocentes(item.docente_interino, termDoc) || 
      searchInSuplentes(item.docentes_suplentes, termDoc);

    // Filtro estado (busca si ALGUN docente tiene ese estado)
    const matchEstado = !filters.estado || 
      (item.docente_titular?.estado === filters.estado) ||
      (item.docente_interino?.estado === filters.estado) ||
      (Array.isArray(item.docentes_suplentes) && item.docentes_suplentes.some(s => s.estado === filters.estado));

    return matchCurso && matchDiv && matchTurno && matchAsig && matchDia && matchDocente && matchEstado;
  }).sort((a, b) => {
    // 1. Ordenar por cargo
    const cargoA = a.cargo || "";
    const cargoB = b.cargo || "";
    const compareCargo = cargoA.localeCompare(cargoB);
    if (compareCargo !== 0) return compareCargo;

    // 2. Ordenar por curso (numéricamente)
    const cursoA = a.curso || "";
    const cursoB = b.curso || "";
    const compareCurso = cursoA.localeCompare(cursoB, undefined, { numeric: true });
    if (compareCurso !== 0) return compareCurso;

    // 3. Ordenar por división
    const divA = a.division || "";
    const divB = b.division || "";
    const compareDiv = divA.localeCompare(divB);
    if (compareDiv !== 0) return compareDiv;

    // 4. Ordenar por asignatura
    const asigA = a.asignatura || "";
    const asigB = b.asignatura || "";
    return asigA.localeCompare(asigB);
  });

  // --- Imprimir ---
  const handlePrint = () => {
    const fullLogoUrl = new URL(logo, window.location.href).href;

    // Helper para formatear los datos complejos para la tabla
    const formatHorarios = (horarios) => {
      if (!Array.isArray(horarios)) return "";
      return horarios.map(h => {
        const horasConPlaza = (h.horas || []).map(hr => {
          const plazaInfo = h.plazas && h.plazas[hr] ? ` [${h.plazas[hr]}]` : '';
          const horaText = hr === "EDUCACIÓN FÍSICA" ? `EF (${h.ef_horario || 'N/A'})` : hr.split(" ")[0];
          return `${horaText}${plazaInfo}`;
        }).join(", ");
        return `<div><strong>${h.dia}:</strong> ${horasConPlaza}</div>`;
      }).join('');
    };

    const formatDocente = (docente) => {
      if (!docente || !docente.nombre || docente.nombre === '---') return "";
      const estado = docente.estado ? ` (${docente.estado})` : "";
      return `${docente.nombre}${estado}`;
    };

    const formatSuplentes = (suplentes) => {
      if (!Array.isArray(suplentes) || suplentes.length === 0) return "";
      return suplentes.map(s => `<div>${formatDocente(s)}</div>`).join('');
    };

    const rowsHtml = filteredData.map(item => `
      <tr>
        <td>${item.cargo || ''}</td>
        <td>${item.curso || ''} ${item.division || ''}</td>
        <td>${item.turno || ''}</td>
        <td>${item.asignatura || ''}</td>
        <td>${formatHorarios(item.horarios)}</td>
        <td>${formatDocente(item.docente_titular)}</td>
        <td>${formatDocente(item.docente_interino)}</td>
        <td>${formatSuplentes(item.docentes_suplentes)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Estructura de Horario</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th, td { border: 1px solid #000; padding: 5px; text-align: left; vertical-align: top; }
          th { background-color: #f2f2f2; }
          .header-container { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .logo { width: 60px; height: auto; margin-right: 20px; }
          .school-info h1 { font-size: 16px; margin: 0; }
          .school-info p { font-size: 12px; margin: 2px 0; }
          @media print {
            .no-print { display: none !important; }
            thead { display: table-header-group; } 
            tr { page-break-inside: avoid; }
            @page { size: landscape; margin: 15mm; }
          }
          .preview-controls { position: fixed; bottom: 0; left: 0; width: 100%; background: #333; padding: 15px; text-align: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.3); z-index: 1000; }
          .btn { padding: 10px 20px; margin: 0 10px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; }
          .btn-pdf { background-color: #007bff; color: white; }
          .btn-print { background-color: #ffc107; color: black; }
          .btn-cancel { background-color: #dc3545; color: white; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th colspan="7" style="border: none; background: none; text-align: left; padding: 0 0 10px 0;">
                <div class="header-container">
                  <img src="${fullLogoUrl}" class="logo" alt="Logo" />
                  <div class="school-info">
                    <h1>Escuela Secundaria Gobernador Garmendia</h1>
                    <p>CUE: 9001717/00 - Av. de la Soja S/N° - Gobernador Garmendia - Burruyacu</p>
                    <p><strong>ESTRUCTURA DE HORARIO</strong></p>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th>Cargo</th>
              <th>Curso/Div</th><th>Turno</th><th>Asignatura</th><th>Días y Horarios</th>
              <th>Titular</th><th>Interino</th><th>Suplentes</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="preview-controls no-print">
          <button class="btn btn-pdf" onclick="window.print()">GUARDAR COMO PDF</button>
          <button class="btn btn-print" onclick="window.print()">IMPRIMIR</button>
          <button class="btn btn-cancel" onclick="window.close()">CANCELAR</button>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  // Listas únicas para filtros
  const uniqueCursos = [...new Set(codigos.map(c => c.curso))].sort();
  const uniqueDivisiones = [...new Set(codigos.map(c => c.division))].sort();
  const uniqueCargos = [...new Set(codigos.map(c => c.cargo).filter(Boolean))].sort();

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>ESTRUCTURA DE HORARIO</h2>
      
      {/* Botones de Acción */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
        <button 
          onClick={() => { setMode("create"); setFormData(initialFormState); setSelectedId(null); }} 
          style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          NUEVO
        </button>
        <button 
          onClick={() => { setMode("edit"); setSelectedId(null); }} 
          style={{ backgroundColor: 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          MODIFICAR
        </button>
        <button 
          onClick={() => { setMode("delete"); setSelectedId(null); }} 
          style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ELIMINAR
        </button>
        <button 
          onClick={handlePrint} 
          style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          IMPRIMIR
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
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
      </div>

      {/* Formulario */}
      {(mode === "create" || (mode === "edit" && selectedId)) && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '0 auto 20px', maxWidth: '900px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>{mode === "create" ? "Nueva Estructura" : "Modificar Estructura"}</h3>
          <form onSubmit={handleSave}>
            
            {/* Datos Académicos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <label style={{ gridColumn: '1 / -1' }}>Cargo:
                <select name="cargo" value={formData.cargo} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                  <option value="">Seleccione...</option>
                  {uniqueCargos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              {formData.cargo === "DOCENTE" ? (
                <>
                  <label>Curso:
                    <select name="curso" value={formData.curso} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                      <option value="">Seleccione...</option>
                      {uniqueCursos.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label>División:
                    <select name="division" value={formData.division} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                      <option value="">Seleccione...</option>
                      {availableDivisiones.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <label>Turno:
                    <input name="turno" value={formData.turno} readOnly style={{ width: '100%', padding: '5px', backgroundColor: '#eee' }} />
                  </label>
                  <label>Asignatura:
                    <select name="asignatura" value={formData.asignatura} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                      <option value="">Seleccione...</option>
                      {availableAsignaturas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </label>
                </>
              ) : (
                <>
                  {formData.cargo && (
                    <label>Turno:
                      <select name="turno" value={formData.turno} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                        <option value="">Seleccione...</option>
                        {availableTurnos.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </label>
                  )}
                </>
              )}
            </div>

            {/* Horarios */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <h4>Días y Horarios</h4>
              {formData.horarios.map((h, index) => (
                <div key={index} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                      <select value={h.dia} onChange={(e) => updateDiaHorario(index, 'dia', e.target.value)} style={{ padding: '5px' }}>
                        <option value="">Seleccione Día...</option>
                        {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <button type="button" onClick={() => removeDiaHorario(index)} style={{ backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px', padding: '5px 10px', cursor: 'pointer' }}>X</button>
                  </div>

                  {/* Selección de Horas */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                    {(() => {
                      const isSubjectEF = (formData.asignatura || "").toUpperCase().includes("EDUCACIÓN FÍSICA");

                      if (!isSubjectEF) {
                        const isEFChecked = h.horas.includes("EDUCACIÓN FÍSICA");
                        const horasDelTurno = (formData.turno === "Mañana" || formData.turno === "Mañana y Tarde" ? horariosManana : [])
                          .concat(formData.turno === "Tarde" || formData.turno === "Mañana y Tarde" ? horariosTarde : []);

                        return horasDelTurno.map(hora => {
                          const currentPlazaForThisSlot = h.plazas[hora];
                          const finalOptions = getOptionsForPlaza(currentPlazaForThisSlot);

                          return (
                            <div key={hora} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid #eee', padding: '3px 5px', borderRadius: '4px' }}>
                              <input type="checkbox" id={`cb-${index}-${hora}`} checked={h.horas.includes(hora)} onChange={() => toggleHora(index, hora)} disabled={isEFChecked} />
                              <label htmlFor={`cb-${index}-${hora}`} style={{ fontSize: '12px', cursor: 'pointer' }}>{hora}</label>
                              {h.horas.includes(hora) && (
                                <select
                                  value={currentPlazaForThisSlot || ""}
                                  onChange={(e) => updateHoraPlaza(index, hora, e.target.value)}
                                  style={{ fontSize: '11px', padding: '2px' }}
                                >
                                  <option value="">Plaza...</option>
                                  {finalOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                              )}
                            </div>
                          );
                        });
                      }
                      return null;
                    })()}

                    {/* Educación Física */}
                    {(() => {
                      const isSubjectEF = (formData.asignatura || "").toUpperCase().includes("EDUCACIÓN FÍSICA");
                      
                      if (isSubjectEF) {
                        const hasRegularHours = h.horas.some(hr => hr !== "EDUCACIÓN FÍSICA");
                        const hora = "EDUCACIÓN FÍSICA";

                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid #eee', padding: '3px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                            <input type="checkbox" id={`cb-${index}-${hora}`} checked={h.horas.includes(hora)} onChange={() => toggleHora(index, hora)} disabled={hasRegularHours && h.horas.length > 0} />
                            <label htmlFor={`cb-${index}-${hora}`} style={{ fontSize: '12px', cursor: 'pointer' }}>EDUCACIÓN FÍSICA</label>
                            {h.horas.includes(hora) && (
                              <span style={{ fontSize: '11px', padding: '2px', marginLeft: '5px', color: '#555' }}>
                                {availablePlazas.length > 0 ? availablePlazas.join(" - ") : "Sin plazas"}
                              </span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {h.horas.includes("EDUCACIÓN FÍSICA") && (
                    <div style={{ marginTop: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Ingrese horario Ed. Física (Ej: 14:00 a 15:00)" 
                        value={h.ef_horario}
                        onChange={(e) => updateDiaHorario(index, 'ef_horario', e.target.value)}
                        style={{ width: '100%', padding: '5px' }}
                      />
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={addDiaHorario} style={{ backgroundColor: '#eee', border: '1px solid #ccc', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>+ Agregar Día</button>
            </div>

            {/* Docentes */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Docentes</h4>
              {renderDocenteInput("Titular", "docente_titular", formData.docente_titular)}
              {renderDocenteInput("Interino", "docente_interino", formData.docente_interino)}
              
              <h5>Suplentes</h5>
              {formData.docentes_suplentes.map((suplente, index) => (
                <div key={index}>
                  {renderDocenteInput(`Suplente ${index + 1}`, "suplente", suplente, index)}
                </div>
              ))}
              <button type="button" onClick={addSuplente} style={{ backgroundColor: '#eee', border: '1px solid #ccc', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>+ Agregar Suplente</button>
            </div>

            {/* Botones Formulario */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button type="submit" style={{ padding: '10px 30px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>GUARDAR</button>
              <button type="button" onClick={() => { setMode("view"); setSelectedId(null); }} style={{ padding: '10px 30px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Datos */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
        {mode === "edit" && !selectedId && <div style={{ backgroundColor: '#e6fffa', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid green', borderRadius: '5px' }}>Seleccione un registro para modificar.</div>}
        {mode === "delete" && <div style={{ backgroundColor: '#fff5f5', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid red', borderRadius: '5px' }}>Seleccione un registro para eliminar.</div>}

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
              <tr 
                key={item.id}
                onClick={() => handleRowClick(item)}
                style={{ 
                  cursor: (mode === "edit" || mode === "delete") ? "pointer" : "default",
                  backgroundColor: (mode === "edit" || mode === "delete") && selectedId === item.id ? "#fffbe6" : "transparent"
                }}
              >
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.cargo}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.curso} {item.division}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.turno}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.asignatura}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {Array.isArray(item.horarios) && item.horarios.map((h, i) => {
                    const horasConPlaza = (h.horas || []).map(hr => {
                      const plazaInfo = h.plazas && h.plazas[hr] ? ` [${h.plazas[hr]}]` : '';
                      const horaText = hr === "EDUCACIÓN FÍSICA" ? `EF (${h.ef_horario || ''})` : hr.split(" ")[0];
                      return `${horaText}${plazaInfo}`;
                    }).join(", ");
                    return <div key={i}><strong>{h.dia}:</strong> {horasConPlaza}</div>;
                  })}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {(!filters.estado || item.docente_titular?.estado === filters.estado) && (
                    <>
                      {item.docente_titular?.nombre} 
                      {item.docente_titular?.estado && <span style={{fontSize: '10px', color: item.docente_titular.estado === 'ACTIVO' ? 'green' : 'red'}}> ({item.docente_titular.estado})</span>}
                    </>
                  )}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {(!filters.estado || item.docente_interino?.estado === filters.estado) && (
                    <>
                      {item.docente_interino?.nombre}
                      {item.docente_interino?.estado && <span style={{fontSize: '10px', color: item.docente_interino.estado === 'ACTIVO' ? 'green' : 'red'}}> ({item.docente_interino.estado})</span>}
                    </>
                  )}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {Array.isArray(item.docentes_suplentes) && item.docentes_suplentes
                    .filter(s => !filters.estado || s.estado === filters.estado)
                    .map((s, i) => (
                      <div key={i}>
                        {s.nombre}
                        {s.estado && <span style={{fontSize: '10px', color: s.estado === 'ACTIVO' ? 'green' : 'red'}}> ({s.estado})</span>}
                      </div>
                  ))}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" style={{ padding: "15px", textAlign: "center" }}>No hay datos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocentesEstructura;
