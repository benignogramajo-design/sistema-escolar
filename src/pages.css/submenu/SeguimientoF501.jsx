import React, { useState, useEffect, useCallback } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import * as XLSX from 'xlsx';
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets/logos/Logo.png";

const SeguimientoF501 = ({ goBack, goHome, user }) => {
  // --- Estados de Datos ---
  const [seguimientos, setSeguimientos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [estructura, setEstructura] = useState([]);

  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("view"); // 'view', 'create', 'edit', 'delete'
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showDetail, setShowDetail] = useState({ show: false, data: null, isPrint: false });

  // --- Estado del Formulario ---
  const createInitialState = () => ({
    caracteristicas: "",
    causal: "",
    causal_licencia_tipo: "",
    causal_licencia_otro: "",
    cpf_resolucion_fecha: null,
    cpf_resolucion_nro: "",
    cpf_expte_nro: "",
    cpf_expte_reparticion: "",
    cpf_expte_letra: "",
    cpf_expte_anio: "",
    desde: null,
    hasta: "",
    fecha_ofrecimiento: null,
    fecha_designacion: null,
    cargo: "",
    docente_dueno_id: "SIN DOCENTES",
    caracter_dueno: "TITULAR",
    docente_propuesto_id: "VACANTE ENVIADO A JUNTA",
    caracter_propuesto: "INTERINO",
    cursos_data: [{
      curso: "",
      division: "",
      turno: "",
      asignatura: "",
      modalidad: "",
      dias_horarios: [{ dia: "", horario: "" }],
      plazas: "",
    }],
    estado: "",
    en_direccion_nivel: { value: "", observations: [] },
    en_junta: { value: "", observations: [] },
    en_novedades: { value: "", observations: [] },
    en_institucion: { value: "", observations: [] },
    fecha_cobro_docente: { value: "", observations: [] },
    documentacion_adjunta: [],
    fecha_seguimiento: null,
  });
  const [formData, setFormData] = useState(createInitialState());

  // --- Estados para Desplegables Dependientes ---
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [availableAsignaturas, setAvailableAsignaturas] = useState([]);

  const [selectedDocenteDetails, setSelectedDocenteDetails] = useState(null);
  const [customDocInput, setCustomDocInput] = useState("");
  const [docSelections, setDocSelections] = useState({}); // To store selections for items with dropdowns
  // --- Estado de Filtros ---
  const [filters, setFilters] = useState({
    fecha: "", mes: "", anio: "", cargo: "", curso: "", division: "",
    turno: "", asignatura: "", causal: "", desde: "",
    hasta: "", estado: ""
  });

  // --- Actualizar Modalidad Automáticamente cuando cambia curso/division ---
  const getModalidad = (curso, division) => {
    const c = parseInt(curso);
    if (c >= 1 && c <= 3) return "CICLO BASICO";
    if (c >= 4 && c <= 6) {
      return division === "C" ? "RESOLUCION N° 300/5 - ORIENTACION EN INFORMATICA" : "RESOLUCION N° 297/5 - ORIENTACION EN ECONOMIA Y ADMINISTRACION";
    }
    return "";
  };

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const cargosList = [
    "DIRECTOR/A", "SECRETARIO", "AYUDANTE DE SECRETARIA", "PRECEPTOR",
    "ASESOR PED.", "DOCENTE", "BIBLIOTECARIO/A",
    "AYUDANTE CLASES PRACTICAS (TECN/INFORM)", "AYUDANTE CLASES PRACTICAS (FISICA)",
    "PERSONAL AUXILIAR (CAT. 18)", "PERSONAL AUXILIAR (CAT. 15)"
  ];

  const formatDate = (dateString) => {
    if (!dateString || dateString === '---') return '---';
    // Handles 'YYYY-MM-DD' format by splitting to avoid timezone issues with new Date()
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      // Basic validation
      if (!isNaN(parseInt(day)) && !isNaN(parseInt(month)) && !isNaN(parseInt(year))) {
        return `${day}/${month}/${year}`;
      }
    }
    // Fallback for other formats or if it's not a date string
    return dateString;
  };

  // --- Carga de Datos ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: segData, error: segError },
        { data: docData, error: docError },
        { data: codData, error: codError },
        { data: estData, error: estError },
      ] = await Promise.all([
        supabase.from('seguimiento_f501').select('*').order('fecha_seguimiento', { ascending: false }),
        supabase.from('datos_de_legajo_docentes').select('id, apellido, nombre, dni, mail, celular').order('apellido'),
        supabase.from('codigos').select('*'),
        supabase.from('estructura_horario').select('*'),
      ]);

      if (segError) throw segError;
      if (docError) throw docError;
      if (codError) throw codError;
      if (estError) throw estError;

      setSeguimientos(segData || []);
      setDocentes(docData || []);
      setCodigos(codData || []);
      setEstructura(estData || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Lógica del Formulario ---
  useEffect(() => {
    if (formData.cargo !== 'DOCENTE') {
        setFormData(prev => ({
            ...prev,
            cursos_data: [{
                curso: "---",
                division: "---",
                turno: "",
                asignatura: "---",
                modalidad: "",
                dias_horarios: [{ dia: "", horario: "" }],
                plazas: "",
            }]
        }));
    }
  }, [formData.cargo]);

  useEffect(() => {
    if (formData.docente_propuesto_id && formData.docente_propuesto_id !== 'VACANTE ENVIADO A JUNTA') {
      const docente = docentes.find(d => d.id === parseInt(formData.docente_propuesto_id));
      setSelectedDocenteDetails(docente || null);
    } else {
      setSelectedDocenteDetails(null);
    }
  }, [formData.docente_propuesto_id, docentes]);

  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleObservationChange = (section, field, value, obsIndex = null) => {
    setFormData(prev => {
      const newSectionData = { ...prev[section] };
      if (obsIndex === null) { // Campo principal (value)
        newSectionData.value = value;
        // If a date/status is set, and there are no observations, add an empty one to start.
        if (value && (!newSectionData.observations || newSectionData.observations.length === 0)) {
          newSectionData.observations = [{ text: '', date: '' }];
        }
      } else { // Campo de una observación
        if (!newSectionData.observations) newSectionData.observations = [];
        newSectionData.observations[obsIndex][field] = value;
        // Si se escribe en la última observación, se añade una nueva vacía
        if (field === 'text' && value.trim() !== '' && obsIndex === newSectionData.observations.length - 1) {
          newSectionData.observations.push({ text: '', date: '' });
        }
      }
      return { ...prev, [section]: newSectionData };
    });
  };

  // Handler para cambios en cursos múltiples
  const handleCursoChange = (index, field, value) => {
    const newCursos = JSON.parse(JSON.stringify(formData.cursos_data));
    const cursoItem = newCursos[index];
    cursoItem[field] = value;
    
    if (field === 'curso') {
        cursoItem.division = "";
        cursoItem.asignatura = "";
        cursoItem.turno = "";
        cursoItem.plazas = "";
        cursoItem.dias_horarios = [{ dia: '', horario: '' }];
    }
    if (field === 'division') {
        cursoItem.asignatura = "";
        cursoItem.plazas = "";
        cursoItem.dias_horarios = [{ dia: '', horario: '' }];
        // Autocomplete turno
        const match = codigos.find(c => c.curso === cursoItem.curso && c.division === value);
        cursoItem.turno = match ? match.turno : "";
    }
    if (field === 'asignatura') {
        // Plazas
        const matchPlazas = codigos.find(c => 
            c.curso === cursoItem.curso &&
            c.division === cursoItem.division &&
            c.asignatura === value
        );
        if (matchPlazas && matchPlazas.plazas) {
            let plazasData = matchPlazas.plazas;
            if (typeof plazasData === 'string') {
                try { plazasData = JSON.parse(plazasData); } catch(e) { plazasData = []; }
            }
            cursoItem.plazas = Array.isArray(plazasData) ? plazasData.join(' - ') : '';
        } else {
            cursoItem.plazas = '';
        }

        // Horarios
        const estructuraMatch = estructura.find(e => 
            e.cargo === 'DOCENTE' &&
            e.curso === cursoItem.curso &&
            e.division === cursoItem.division &&
            e.asignatura === value
        );
        if (estructuraMatch && estructuraMatch.horarios) {
            const horariosStr = estructuraMatch.horarios.map(h => {
                const horas = (h.horas || []).map(hr => hr.split(' ')[0]).join(', ');
                return `${h.dia}: ${horas}`;
            }).join('; ');
            cursoItem.dias_horarios[0].horario = horariosStr;
        } else {
            cursoItem.dias_horarios[0].horario = '';
        }
    }

    if (field === 'curso' || field === 'division') {
        cursoItem.modalidad = getModalidad(cursoItem.curso, cursoItem.division);
    }

    setFormData(prev => ({ ...prev, cursos_data: newCursos }));
  };

  const handleNew = () => {
    setMode('create');
    setSelectedId(null);
    setFormData(createInitialState());
    setShowForm(true);
  };

  const handleNonDocenteHorarioChange = (dhIndex, field, value) => {
    const newCursos = JSON.parse(JSON.stringify(formData.cursos_data));
    newCursos[0].dias_horarios[dhIndex][field] = value;
    setFormData(prev => ({ ...prev, cursos_data: newCursos }));
  };

  const addNonDocenteHorario = () => {
    const newCursos = JSON.parse(JSON.stringify(formData.cursos_data));
    newCursos[0].dias_horarios.push({ dia: '', horario: '' });
    setFormData(prev => ({ ...prev, cursos_data: newCursos }));
  };

  const removeNonDocenteHorario = (dhIndex) => {
    const newCursos = JSON.parse(JSON.stringify(formData.cursos_data));
    if (newCursos[0].dias_horarios.length > 1) {
        newCursos[0].dias_horarios.splice(dhIndex, 1);
        setFormData(prev => ({ ...prev, cursos_data: newCursos }));
    }
  };

  const handleEdit = (item) => {
    setMode('edit');
    setSelectedId(item.id);
    // Asegurar que los campos JSON y arrays tengan valores por defecto si son null
    const safeData = {
      ...createInitialState(),
      ...item, // Carga los datos del registro
      // Convierte datos de formato antiguo a nuevo si es necesario
      cursos_data: (item.cursos_data && item.cursos_data.length > 0)
        ? item.cursos_data
        : [{
            curso: item.curso || "",
            division: item.division || "",
            turno: item.turno || "",
            asignatura: item.asignatura || "",
            modalidad: "", // Se calculará
            dias_horarios: item.dias_horarios && item.dias_horarios.length > 0 ? item.dias_horarios : [{ dia: "", horario: "" }],
            plazas: item.plazas || "",
          }],
      en_direccion_nivel: item.en_direccion_nivel || { value: "", observations: [] },
      en_junta: item.en_junta || { value: "", observations: [] },
      en_novedades: item.en_novedades || { value: "", observations: [] },
      en_institucion: item.en_institucion || { value: "", observations: [] },
      fecha_cobro_docente: item.fecha_cobro_docente || { value: "", observations: [] },
      documentacion_adjunta: item.documentacion_adjunta || [],
      caracter_dueno: item.caracter_dueno || "TITULAR",
      caracter_propuesto: item.caracter_propuesto || "INTERINO",
    };
    // Limpiar campos que ya no existen en la estructura principal
    delete safeData.curso;
    delete safeData.division;
    delete safeData.turno;
    delete safeData.asignatura;
    delete safeData.dias_horarios;
    delete safeData.plazas;
    // Añadir un campo de observación vacío si es necesario
    ['en_direccion_nivel', 'en_junta', 'en_novedades', 'en_institucion', 'fecha_cobro_docente'].forEach(key => {
        if (safeData[key].value && (!safeData[key].observations || safeData[key].observations.length === 0 || safeData[key].observations[safeData[key].observations.length - 1].text !== '')) {
            if (!safeData[key].observations) safeData[key].observations = [];
            safeData[key].observations.push({ text: '', date: '' });
        }
    });
    setFormData(safeData);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      try {
        const { error } = await supabase.from('seguimiento_f501').delete().eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (err) {
        setError(err.message);
        alert("Error al eliminar: " + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Error de autenticación: No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.");
      return;
    }

    const cleanField = (value) => value || '---';

    const payload = {
      ...formData,
      fecha_ofrecimiento: formData.fecha_ofrecimiento || null,
      fecha_designacion: formData.fecha_designacion || null,
      desde: formData.desde || null,
      hasta: cleanField(formData.hasta)
    };

    // Limpiar observaciones vacías antes de guardar
    ['en_direccion_nivel', 'en_junta', 'en_novedades', 'en_institucion', 'fecha_cobro_docente'].forEach(key => {
        if (payload[key] && payload[key].observations) {
            payload[key].observations = payload[key].observations.filter(obs => obs.text.trim() !== '');
        }
    });

    try {
      let error;
      if (mode === 'edit') {
        ({ error } = await supabase.from('seguimiento_f501').update(payload).eq('id', selectedId));
      } else {
        ({ error } = await supabase.from('seguimiento_f501').insert([payload]));
      }
      if (error) throw error;

      await fetchData();
      setShowForm(false);
      setMode('view');
    } catch (err) {
      setError(err.message);
      alert("Error al guardar: " + err.message);
    }
  };

  const handleExcelExport = () => {
    const headers = ["F. OFREC.", "F. DESIG.", "F. SEGUIM.", "CARGO", "CURSO", "ASIGNATURA", "DOCENTE", "CAUSAL", "DOCENTE PROPUESTO", "DESDE", "HASTA", "ESTADO"];
    
    const rows = filteredData.map(item => {
        const cursoInfo = item.cursos_data && item.cursos_data[0] 
            ? `${item.cursos_data[0].curso || ''} ${item.cursos_data[0].division || ''} - ${item.cursos_data[0].turno || ''}`
            : `${item.curso || ''} ${item.division || ''} - ${item.turno || ''}`;
        const asignaturaInfo = item.cursos_data && item.cursos_data[0] ? item.cursos_data[0].asignatura : item.asignatura;

        return [
            formatDate(item.fecha_ofrecimiento),
            formatDate(item.fecha_designacion),
            formatDate(item.fecha_seguimiento),
            item.cargo,
            cursoInfo,
            asignaturaInfo,
            `${getDocenteName(item.docente_dueno_id)} - ${item.caracter_dueno}`,
            item.causal,
            `${getDocenteName(item.docente_propuesto_id)} - ${item.caracter_propuesto}`,
            formatDate(item.desde),
            formatDate(item.hasta),
            item.estado
        ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SeguimientoF501");
    XLSX.writeFile(workbook, "Seguimiento_F501.xlsx");
};
  const handleRowClick = (item) => {
    if (mode === 'edit') handleEdit(item);
    else if (mode === 'delete') handleDelete(item.id);
  };

  // --- Filtrado ---
  const filteredData = seguimientos.filter(item => {
    const itemDate = new Date(item.fecha_seguimiento);
    const itemMes = item.fecha_seguimiento ? (itemDate.getUTCMonth() + 1).toString() : "";
    const itemAnio = item.fecha_seguimiento ? itemDate.getUTCFullYear().toString() : "";

    return (
      (!filters.fecha || (item.fecha_seguimiento && item.fecha_seguimiento.startsWith(filters.fecha))) &&
      (!filters.mes || itemMes === filters.mes) &&
      (!filters.anio || itemAnio === filters.anio) &&
      (!filters.cargo || item.cargo === filters.cargo) &&
      // Updated to check inside cursos_data for new records
      (!filters.curso || (item.cursos_data && item.cursos_data.some(c => c.curso === filters.curso)) || item.curso === filters.curso) &&
      (!filters.division || (item.cursos_data && item.cursos_data.some(c => c.division === filters.division)) || item.division === filters.division) &&
      (!filters.turno || (item.cursos_data && item.cursos_data.some(c => c.turno === filters.turno)) || item.turno === filters.turno) &&
      (!filters.asignatura || (item.cursos_data && item.cursos_data.some(c => (c.asignatura || "").toLowerCase().includes(filters.asignatura.toLowerCase()))) || (item.asignatura || "").toLowerCase().includes(filters.asignatura.toLowerCase())) &&
      (!filters.causal || (item.causal || "").toLowerCase().includes(filters.causal.toLowerCase())) &&
      (!filters.desde || item.desde === filters.desde) &&
      (!filters.hasta || item.hasta === filters.hasta) &&
      (!filters.estado || item.estado === filters.estado)
    );
  });

  // --- Ordenamiento ---
  const getEstadoOrder = (estado) => {
    if (!estado) return 99;
    const e = estado.toUpperCase();
    if (e.includes("D.E.S.") || e.includes("DIRECCIÓN DE NIVEL")) return 1;
    if (e.includes("JUNTA")) return 2;
    if (e.includes("NOVEDADES")) return 3;
    if (e.includes("INSTITUCION") || e.includes("INSTITUCIÓN")) return 4;
    if (e.includes("COBRANDO") || e.includes("COBRO")) return 5;
    return 99;
  };

  filteredData.sort((a, b) => {
    const orderA = getEstadoOrder(a.estado);
    const orderB = getEstadoOrder(b.estado);
    if (orderA !== orderB) return orderA - orderB;
    
    // Ordenar por fecha de designación
    const dateA = new Date(a.fecha_designacion || '1900-01-01');
    const dateB = new Date(b.fecha_designacion || '1900-01-01');
    return dateA - dateB;
  });

  // --- Helpers de Visualización ---
  const getDocenteName = (id) => {
    if (!id) return id;
    const docente = docentes.find(d => d.id == id);
    return docente ? `${docente.apellido}, ${docente.nombre}` : id;
  };
  
  const getDocenteDetails = (id) => {
    return docentes.find(d => d.id == id);
  };

  // --- Renderizado ---
  const renderDetailContent = (data) => {
    if (!data) return null;
    const docenteDueno = getDocenteName(data.docente_dueno_id);
    const docentePropuesto = getDocenteName(data.docente_propuesto_id);

    const renderSection = (label, sectionData) => (
      <div style={{ marginBottom: '5px' }}>
        <strong>{label}:</strong> {sectionData?.value || '---'}
        {sectionData?.observations?.filter(o => o.text).map((obs, i) => (
          <div key={i} style={{ marginLeft: '20px', fontSize: '0.9em' }}>
            <em>Obs:</em> {obs.text} ({formatDate(obs.date)})
          </div>
        ))}
      </div>
    );

    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            <td style={{ border: 'none', paddingBottom: '10px' }}>
               <div className="print-header" style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', color: 'black' }}>
                  <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                  <div>
                    <h1 style={{ fontSize: '18px', margin: 0 }}>Escuela Secundaria Gobernador Garmendia</h1>
                    <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                  </div>
                </div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div style={{ padding: '10px', lineHeight: '1.6' }}>
                <p><strong>Fecha Ofrecimiento:</strong> {formatDate(data.fecha_ofrecimiento)}</p>
                <p><strong>Fecha Designación:</strong> {formatDate(data.fecha_designacion)}</p>
                <p><strong>Cargo:</strong> {data.cargo}</p>
                <p><strong>Docente Dueño:</strong> {docenteDueno}</p>
                <p><strong>Docente Propuesto:</strong> {docentePropuesto}</p>
                <p><strong>Curso/Div - Turno:</strong> {data.cursos_data?.[0]?.curso} {data.cursos_data?.[0]?.division} - {data.cursos_data?.[0]?.turno}</p>
                <p><strong>Asignatura:</strong> {data.cursos_data?.[0]?.asignatura}</p>
                <p><strong>Carácter Dueño:</strong> {data.caracter_dueno}</p>
                <p><strong>Carácter Propuesto:</strong> {data.caracter_propuesto}</p>
                <p><strong>Plazas:</strong> {data.cursos_data?.[0]?.plazas}</p>
                <p><strong>Causal:</strong> {data.causal}</p>
                <p><strong>Desde:</strong> {formatDate(data.desde)} <strong>Hasta:</strong> {formatDate(data.hasta)}</p>
                <hr style={{ borderTop: '1px solid #ccc' }} />
                {renderSection("Enviado a Dirección de Nivel", data.en_direccion_nivel)}
                {renderSection("Enviado a Junta", data.en_junta)}
                {renderSection("En Novedades Salariales", data.en_novedades)}
                {renderSection("En la Institución", data.en_institucion)}
                {renderSection("Fecha de Cobro", data.fecha_cobro_docente)}
                <hr style={{ borderTop: '1px solid #ccc' }} />
                <p><strong>Fecha Seguimiento:</strong> {formatDate(data.fecha_seguimiento)}</p>
                <p><strong>Estado:</strong> {data.estado}</p>
                <p><strong>Documentación Adjunta:</strong> {(data.documentacion_adjunta || []).join(", ")}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderObservationInputs = (sectionName) => (
    <div style={{ gridColumn: '1 / -1', border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
      <label style={{ fontWeight: 'bold' }}>{sectionName.replace('en_direccion_nivel', 'ENVIADO A DIRECCION NIVEL').replace('en_junta', 'ENVIADO A JUNTA').replace('en_novedades', 'EN NOVEDADES').replace('en_institucion', 'CARGADO EN EL SIME INSTITUCIONAL').replace('fecha_cobro_docente', 'FECHA COBRO DOCENTE').replace(/_/g, ' ').toUpperCase()}:</label>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="date" value={formData[sectionName]?.value === 'PENDIENTE' ? '' : formData[sectionName]?.value || ''} onChange={e => handleObservationChange(sectionName, 'value', e.target.value)} style={{ flex: 1, padding: '5px' }} />
        <button type="button" onClick={() => handleObservationChange(sectionName, 'value', formData[sectionName]?.value === 'PENDIENTE' ? '' : 'PENDIENTE')} style={{ backgroundColor: formData[sectionName]?.value === 'PENDIENTE' ? 'orange' : '#eee' }}>PENDIENTE</button>
      </div>
      {formData[sectionName]?.value && (
        <div style={{ marginTop: '10px' }}>
          <label>Observaciones:</label>
          {(formData[sectionName]?.observations || []).map((obs, i) => (
            <div key={i} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <input type="text" placeholder={`Obs. ${i + 1}`} value={obs.text} onChange={e => handleObservationChange(sectionName, 'text', e.target.value, i)} style={{ flex: 2, padding: '5px' }} />
              {obs.text && (
                <input type="date" value={obs.date} onChange={e => handleObservationChange(sectionName, 'date', e.target.value, i)} style={{ flex: 1, padding: '5px' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const getRowColor = (estado) => {
    if (!estado) return 'black';
    const e = estado.toUpperCase();
    if (e === 'PENDIENTE') return 'red';
    if (e.includes("D.E.S.")) return 'blue';
    if (e.includes("JUNTA") || e.includes("NOVEDADES")) return 'green';
    if (e.includes("INSTITUCION") || e.includes("COBRANDO")) return 'black';
    return 'black';
  };

  const getUniqueOptions = (field) => [...new Set(seguimientos.map(item => item[field]).filter(Boolean))].sort();

  const uniqueCursos = [...new Set(codigos.map(c => c.curso).filter(Boolean))].sort();

  // Lógica para documentación adjunta
  const getDocumentationOptions = () => {
    const { causal, cursos_data } = formData;
    let options = ["OTRA DOCUMENTACIÓN"];
    const isATE = cursos_data.some(c => (c.asignatura || "").toUpperCase().includes("ACOMPAÑAMIENTO A LAS TRAYECTORIAS ESCOLARES") || (c.asignatura || "").toUpperCase().includes("ATE"));
    
    const commonDocs = [
        "ACTA DE OFRECIMIENTO", "ACTA DE TOMA", "ACTA DE TOMA ANTERIOR", 
        "DDJJ ACTUALIZADA DEL DOCENTE", "F501", "DECRETO 586", 
        "RESOLUCIÓN MINISTERIAL N° 2063 MED 22", "RESOLUCIÓN MINISTERIAL N° 008", 
        "RESOLUCIÓN MINISTERIAL N° 1465 MED 26"
    ];

    if (causal === "CPF CON RESOLUCION") {
        options = [...options, "CPF CON RESOLUCION", "ACTA DE RECONVERSIÓN PROFE INTERINO", ...commonDocs];
    } else if (causal === "CPF CON EXPTE") {
        options = [...options, "CPF CON EXPTE", "ACTA DE RECONVERSIÓN PROFE INTERINO", ...commonDocs];
    } else if (causal === "LICENCIA ") {
        options = [...options, "ACTA DE RECONVERSIÓN PROFE DUEÑO", "ACTA DE RECONVERSIÓN PROFE INTERINO", "ACTA DE RECONVERSIÓN PROFE SUPLENTE", ...commonDocs, "ACTA DE NACIMIENTO DEL HIJO/A", "CERTIFICADO DE A.R.T.", "CERTIFICADO MÉDICO", "CERTIFICADO MÉDICO DEL SESOP", "CONSTANCIA DE ATENCIÓN DE SESOP", "CÓDIGO ESPECIAL 2020 SESOP"];
    } else if (causal === "RENUNCIA") {
        options = [...options, "ACTA DE RECONVERSIÓN PROFE DUEÑO", "ACTA DE RECONVERSIÓN PROFE INTERINO", "ACTA DE RECONVERSIÓN PROFE SUPLENTE", ...commonDocs, "BAJA INFORMADA DE SIME", "ACTA DE CESE DEFINITIVO DE LA ESCUELA", "NOTA DE RENUNCIA"];
    } else if (causal === "CONTINUIDAD") {
        options = [...options, "ACTA DE RECONVERSIÓN PROFE DUEÑO", "ACTA DE RECONVERSIÓN PROFE INTERINO", "ACTA DE RECONVERSIÓN PROFE SUPLENTE", ...commonDocs, "ACTA DE CONTINUIDAD DIDÁCTICA", "ACTA DE REINTEGRO DEL DUEÑO", "CERTIFICADO DE A.R.T.", "CERTIFICADO MÉDICO", "CERTIFICADO MÉDICO DEL SESOP", "CONSTANCIA DE ATENCIÓN DE SESOP", "CÓDIGO ESPECIAL 2020 SESOP"];
    } else if (causal === "ADSCRIPCION") {
        options = [...options, "ACTA DE RECONVERSIÓN PROFE DUEÑO", "ACTA DE RECONVERSIÓN PROFE INTERINO", "ACTA DE RECONVERSIÓN PROFE SUPLENTE", ...commonDocs, "CONSTANCIA DE ADSCRIPCIÓN", "NOTA DE ADSCRIPCIÓN", "RESOLUCIÓN DE ADSCRIPCIÓN"];
    } else if (causal === "REUBICACION") {
        options = [...options, "ACTA DE RECONVERSIÓN PROFE DUEÑO", "ACTA DE RECONVERSIÓN PROFE INTERINO", "ACTA DE RECONVERSIÓN PROFE SUPLENTE", ...commonDocs, "ACTA DE LA ESCUELA DONDE QUEDA CONSTANCIA DE LA REUBICACIÓN"];
    } else if (causal === "JUBILACION") {
        options = [...options, "ACTA DE RECONVERSIÓN PROFE DUEÑO", "ACTA DE RECONVERSIÓN PROFE INTERINO", "ACTA DE RECONVERSIÓN PROFE SUPLENTE", ...commonDocs, "BAJA INFORMADA DE SIME", "ACTA DE CESE DEFINITIVO DE LA ESCUELA", "NOTIFICACIÓN DEL ANSES", "RESOLUCIÓN DE JUBILACIÓN"];
    } else if (causal === "FALLECIMIENTO") {
        options = [...options, "ACTA DE RECONVERSIÓN PROFE DUEÑO", "ACTA DE RECONVERSIÓN PROFE INTERINO", "ACTA DE RECONVERSIÓN PROFE SUPLENTE", ...commonDocs, "BAJA INFORMADA DE SIME", "ACTA DE CESE DEFINITIVO DE LA ESCUELA"];
    } else if (causal === "OTROS") {
        // Lista completa para 'OTROS' (simplificada aquí, agregar el resto según requerimiento)
        options = [...options, "CPF CON RESOLUCION", "CPF CON EXPTE", "ACTA DE RECONVERSIÓN PROFE DUEÑO", ...commonDocs, "ACTA DE CESE DEFINITIVO DE LA ESCUELA", "ACTA DE LICENCIA DEL ART 33", "PROYECTO ATE", "ANEXO 1 PLANILLA DE REORGANIZACIÓN DE HORAS CÁTEDRA DE ATE."];
    }

    if (isATE) {
        options = [...new Set([...options, "ANEXO 1 PLANILLA DE REORGANIZACIÓN DE HORAS CÁTEDRA DE ATE.", "ANEXO 2 PLANILLA DE RECEPCIÓN DE PROYECTOS DE ATE.", "ANEXO 3 ACTAS DE RESULTADOS DE PROYECTOS PRESENTADOS Y PROPUESTA DOCENTE.", "ANEXO 4: F501", "ANEXO 5: RÚBRICA DE EVALUACIÓN DE PROYECTOS DE ATE.", "PROYECTO ATE"])];
    }

    return options;
  };

  const resolveDocLabel = (doc) => {
    const due = getDocenteName(formData.docente_dueno_id);
    const prop = getDocenteName(formData.docente_propuesto_id);
    const cargoInfo = `${formData.cargo || ''} - ${formData.cursos_data[0]?.asignatura || ''} - ${formData.cursos_data[0]?.curso || ''} ${formData.cursos_data[0]?.division || ''} - ${formData.cursos_data[0]?.turno || ''}`;

    if (doc === "CPF CON RESOLUCION") return `CPF CON RESOLUCION ${formatDate(formData.cpf_resolucion_fecha)} - ${formData.cpf_resolucion_nro || ''}`;
    if (doc === "CPF CON EXPTE") return `CPF CON EXPTE ${formData.cpf_expte_nro || ''}/${formData.cpf_expte_reparticion || ''}-${formData.cpf_expte_letra || ''}-${formData.cpf_expte_anio || ''}`;
    
    // Items que continúan con DOCENTE DUEÑO
    const itemsDueno = [
        "ACTA DE RECONVERSIÓN PROFE DUEÑO", "ACTA DE LA ESCUELA POR RENUNCIA", "ACTA DE LICENCIA DEL ART 33", 
        "ACTA DE NACIMIENTO DEL HIJO/A", "ACTA DE REINTEGRO DEL DUEÑO", "ACTA DE TOMA ART 33 (CARGO DIRECTIVO O TOMA DE NUEVAS HORAS", 
        "CERTIFICADO DE A.R.T.", "CERTIFICADO MÉDICO", "CERTIFICADO MÉDICO DEL SESOP", "CONSTANCIA DE ADSCRIPCIÓN", 
        "CONSTANCIA DE ATENCIÓN DE SESOP", "CÓDIGO ESPECIAL 2020 SESOP", "NOTA DE ADSCRIPCIÓN", "NOTA DE RENUNCIA", 
        "NOTIFICACIÓN DEL ANSES", "NUEVA LICENCIA DEL DUEÑO (ART33)", "RESOLUCIÓN DE ADSCRIPCIÓN", "RESOLUCIÓN DE JUBILACIÓN"
    ];
    if (itemsDueno.includes(doc)) return `${doc} ${due}`;

    // Items que continúan con DOCENTE PROPUESTO
    const itemsPropuesto = [
        "ACTA DE RECONVERSIÓN PROFE SUPLENTE", "ACTA DE TOMA", "ACTA DE TOMA ANTERIOR", 
        "DDJJ ACTUALIZADA DEL DOCENTE", "BAJA INFORMADA DE SIME", "ACTA DE CONTINUIDAD DIDÁCTICA"
    ];
    if (itemsPropuesto.includes(doc)) return `${doc} ${prop}`;

    // Items que continúan con CARGO/ASIG...
    if (doc === "ACTA DE OFRECIMIENTO" || doc === "F501" || doc === "ANEXO 4: F501") return `${doc} ${cargoInfo}`;

    // Items con selección (Dropdown) - Retornamos base, el render manejará la selección
    // "ACTA DE RECONVERSIÓN PROFE INTERINO", "ACTA DE CESE DEFINITIVO DE LA ESCUELA", "ACTA DE CESE DEL REEMPLAZANTE", "ACTA DE SOLICITUD CAMBIO DE FUNCIÓN"
    
    return doc;
  };

  const toggleDocumentation = (doc) => {
    const resolvedLabel = resolveDocLabel(doc);
    
    // Si es un item con dropdown, usamos el valor seleccionado si existe
    const itemsWithDropdown = ["ACTA DE RECONVERSIÓN PROFE INTERINO", "ACTA DE CESE DEFINITIVO DE LA ESCUELA", "ACTA DE CESE DEL REEMPLAZANTE", "ACTA DE SOLICITUD CAMBIO DE FUNCIÓN"];
    let finalValue = resolvedLabel;

    if (itemsWithDropdown.includes(doc)) {
        const selection = docSelections[doc];
        if (!selection) {
            alert("Por favor seleccione una opción del desplegable para este documento.");
            return;
        }
        finalValue = `${doc} ${selection}`;
    }

    setFormData(prev => {
        const currentDocs = prev.documentacion_adjunta || [];
        if (currentDocs.includes(finalValue)) {
            return { ...prev, documentacion_adjunta: currentDocs.filter(d => d !== finalValue) };
        } else {
            return { ...prev, documentacion_adjunta: [...currentDocs, finalValue] };
        }
    });
  };

  const addCustomDoc = () => {
      if (customDocInput.trim()) {
          setFormData(prev => ({
              ...prev,
              documentacion_adjunta: [...prev.documentacion_adjunta, customDocInput.trim()]
          }));
          setCustomDocInput("");
      }
  };

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>SEGUIMIENTO DE F501</h2>

      {/* --- Filtros --- */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        <input type="date" name="fecha" value={filters.fecha} onChange={handleFilterChange} style={{ padding: '5px' }} />
        <select name="mes" value={filters.mes} onChange={handleFilterChange} style={{ padding: '5px' }}><option value="">Mes</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select>
        <input type="number" name="anio" placeholder="Año" value={filters.anio} onChange={handleFilterChange} style={{ padding: '5px', width: '70px' }} />
        {['cargo', 'curso', 'division', 'turno', 'asignatura', 'causal', 'estado'].map(f => (
          <select key={f} name={f} value={filters[f]} onChange={handleFilterChange} style={{ padding: '5px' }}>
            <option value="">{f.replace('_', ' ').toUpperCase()}</option>
            {getUniqueOptions(f).map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        ))}
      </div>

      {/* --- Botones de Acción --- */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
        <button onClick={handleNew} style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>NUEVO</button>
        <button onClick={() => setMode(prev => prev === 'edit' ? 'view' : 'edit')} style={{ backgroundColor: mode === 'edit' ? 'orange' : 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>MODIFICAR</button>
        <button onClick={() => setMode(prev => prev === 'delete' ? 'view' : 'delete')} style={{ backgroundColor: mode === 'delete' ? 'orange' : 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>ELIMINAR</button>
        <button onClick={() => setShowDetail({ show: true, data: null, isPrint: true })} style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>IMPRIMIR</button>
        <button onClick={handleExcelExport} style={{ backgroundColor: 'limegreen', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>DESCARGAR EXCEL</button>
      </div>

      {/* --- Formulario Modal --- */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ textAlign: 'center' }}>{mode === 'create' ? 'Nuevo Seguimiento' : 'Modificar Seguimiento'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              
              <label style={{ gridColumn: '1 / -1' }}>CARACTERISTICAS:
                <select name="caracteristicas" value={formData.caracteristicas} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}>
                    <option value="">Seleccione...</option>
                    <option value="PLANEA CON DOC. DESIGNADO">PLANEA CON DOC. DESIGNADO</option>
                    <option value="PLANEA SIN DOC. DESIGNADO">PLANEA SIN DOC. DESIGNADO</option>
                    <option value="ATE CON DOC. DESIGNADO">ATE CON DOC. DESIGNADO</option>
                    <option value="ATE SIN DOC. DESIGNADO">ATE SIN DOC. DESIGNADO</option>
                </select>
              </label>

              <label style={{ gridColumn: '1 / -1' }}>CAUSAL:
                <select name="causal" value={formData.causal} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}>
                    <option value="">Seleccione...</option>
                    {["CPF CON RESOLUCION", "CPF CON EXPTE", "LICENCIA ", "RENUNCIA", "CONTINUIDAD", "ADSCRIPCION", "REUBICACION", "TRASLADO POR RAZONES DE SALUD", "JUBILACION", "FALLECIMIENTO", "OTROS"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              {formData.causal === "CPF CON RESOLUCION" && (
                  <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <label>FECHA DE RESOLUCIÓN: <input type="date" name="cpf_resolucion_fecha" value={formData.cpf_resolucion_fecha || ''} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                      <label>N° DE RESOLUCIÓN (MEd): <input type="text" name="cpf_resolucion_nro" value={formData.cpf_resolucion_nro} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  </div>
              )}

              {formData.causal === "CPF CON EXPTE" && (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                      <input placeholder="N° EXP" name="cpf_expte_nro" value={formData.cpf_expte_nro} onChange={handleInputChange} style={{ flex: 1 }} /> /
                      <input placeholder="COD REP" name="cpf_expte_reparticion" value={formData.cpf_expte_reparticion} onChange={handleInputChange} style={{ flex: 1 }} /> -
                      <input placeholder="LETRA" name="cpf_expte_letra" value={formData.cpf_expte_letra} onChange={handleInputChange} style={{ flex: 1 }} /> -
                      <input placeholder="AÑO" name="cpf_expte_anio" value={formData.cpf_expte_anio} onChange={handleInputChange} style={{ flex: 1 }} />
                  </div>
              )}

              {formData.causal === "LICENCIA " && (
                  <label style={{ gridColumn: '1 / -1' }}>TIPO DE LICENCIA:
                      <select name="causal_licencia_tipo" value={formData.causal_licencia_tipo} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}>
                          <option value="">Seleccione...</option>
                          {["SESOP CORTO TRATAMIENTO", "SESOP LARGO TRATAMIENTO", "LIC 9254", "LIC 2457-ART", "LIC ART 6 EXTENSION HORARIA", "ART 15 - CAMBIO FUNCION", "ART 19 - MATERNIDAD", "ART 30 - CARGO ELECTIVO", "ART 33 - MAYOR JERARQUIA", "ART 33 - MAYOR REMUNERACIÓN", "ART 33 - CONCENTRACIÓN HORARIA ", "ART 35 - SIN GOCE DE HABERES", "OTROS"].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      {formData.causal_licencia_tipo === "OTROS" && <input placeholder="Especifique..." name="causal_licencia_otro" value={formData.causal_licencia_otro} onChange={handleInputChange} style={{ width: '100%', marginTop: '5px' }} />}
                  </label>
              )}

              <label>DESDE: <input type="date" name="desde" value={formData.desde || ''} onChange={handleInputChange} style={{ width: '100%' }} /></label>
              <label>HASTA: <input name="hasta" value={formData.hasta} onChange={handleInputChange} style={{ width: '100%' }} /></label>

              <label>FECHA OFRECIMIENTO: <input type="date" name="fecha_ofrecimiento" value={formData.fecha_ofrecimiento || ''} onChange={handleInputChange} style={{ width: '100%' }} /></label>
              <label>FECHA DESIGNACIÓN: <input type="date" name="fecha_designacion" value={formData.fecha_designacion || ''} onChange={handleInputChange} style={{ width: '100%' }} /></label>

              <label style={{ gridColumn: '1 / -1' }}>CARGO: <select name="cargo" value={formData.cargo} onChange={handleInputChange} required style={{ width: '100%' }}><option value="">Seleccione...</option>{cargosList.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
              <label>DOCENTE DUEÑO: <select name="docente_dueno_id" value={formData.docente_dueno_id} onChange={handleInputChange} style={{ width: '100%' }}><option value="SIN DOCENTES">SIN DOCENTES</option>{docentes.map(d => <option key={d.id} value={d.id}>{`${d.apellido}, ${d.nombre}`}</option>)}</select></label>
              <label>CARÁCTER DUEÑO: <select name="caracter_dueno" value={formData.caracter_dueno} onChange={handleInputChange} style={{ width: '100%' }}><option value="TITULAR">TITULAR</option><option value="INTERINO">INTERINO</option><option value="SUPLENTE">SUPLENTE</option></select></label>
              <label>DOCENTE PROPUESTO: <select name="docente_propuesto_id" value={formData.docente_propuesto_id} onChange={handleInputChange} style={{ width: '100%' }}><option value="VACANTE ENVIADO A JUNTA">VACANTE ENVIADO A JUNTA</option>{docentes.map(d => <option key={d.id} value={d.id}>{`${d.apellido}, ${d.nombre}`}</option>)}</select></label>
              <label>CARÁCTER PROPUESTO: <select name="caracter_propuesto" value={formData.caracter_propuesto} onChange={handleInputChange} style={{ width: '100%' }}><option value="INTERINO">INTERINO</option><option value="SUPLENTE">SUPLENTE</option></select></label>

              {formData.cursos_data.map((cursoItem, idx) => {
                  const isDocente = formData.cargo === 'DOCENTE';
                  const availableDivisions = isDocente && cursoItem.curso 
                      ? [...new Set(codigos.filter(c => c.curso === cursoItem.curso).map(c => c.division))].sort()
                      : [];
                  const availableAsignaturas = isDocente && cursoItem.curso && cursoItem.division
                      ? [...new Set(codigos.filter(c => c.curso === cursoItem.curso && c.division === cursoItem.division).map(c => c.asignatura))].sort()
                      : [];

                  return (
                      <div key={idx} style={{ gridColumn: '1 / -1', border: '1px solid #ddd', padding: '10px', marginTop: '10px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                              <label>CURSO: 
                                  {isDocente ? (
                                      <select value={cursoItem.curso} onChange={e => handleCursoChange(idx, 'curso', e.target.value)} style={{ width: '100%' }}>
                                          <option value="">Seleccione...</option>
                                          {uniqueCursos.map(c => <option key={c} value={c}>{c}</option>)}
                                      </select>
                                  ) : (
                                      <input value="---" readOnly style={{ width: '100%', backgroundColor: '#eee' }} />
                                  )}
                              </label>
                              <label>DIVISIÓN: 
                                  {isDocente ? (
                                      <select value={cursoItem.division} onChange={e => handleCursoChange(idx, 'division', e.target.value)} style={{ width: '100%' }} disabled={!cursoItem.curso}>
                                          <option value="">Seleccione...</option>
                                          {availableDivisions.map(d => <option key={d} value={d}>{d}</option>)}
                                      </select>
                                  ) : (
                                      <input value="---" readOnly style={{ width: '100%', backgroundColor: '#eee' }} />
                                  )}
                              </label>
                              <label>TURNO: <input value={cursoItem.turno} readOnly style={{ width: '100%', backgroundColor: '#eee' }} /></label>
                              
                              <label style={{ gridColumn: '1 / -1' }}>ASIGNATURA:
                                  {isDocente ? (
                                      <select value={cursoItem.asignatura} onChange={e => handleCursoChange(idx, 'asignatura', e.target.value)} style={{ width: '100%' }} disabled={!cursoItem.division}>
                                          <option value="">Seleccione...</option>
                                          {availableAsignaturas.map(a => <option key={a} value={a}>{a}</option>)}
                                      </select>
                                  ) : (
                                      <input value="---" readOnly style={{ width: '100%', backgroundColor: '#eee' }} />
                                  )}
                              </label>

                              <label style={{ gridColumn: '1 / -1' }}>MODALIDAD: <input value={cursoItem.modalidad} readOnly style={{ width: '100%', backgroundColor: '#eee' }} /></label>
                              <label style={{ gridColumn: '1 / -1' }}>HORARIOS: <input value={cursoItem.dias_horarios[0].horario} onChange={e => {
                                  const newCursos = [...formData.cursos_data];
                                  newCursos[idx].dias_horarios[0].horario = e.target.value;
                                  setFormData(prev => ({...prev, cursos_data: newCursos}));
                              }} placeholder="Ej: Lun 8:00, Mar 10:00" style={{ width: '100%' }} /></label>
                              <label>PLAZAS: <input value={cursoItem.plazas} onChange={e => handleCursoChange(idx, 'plazas', e.target.value)} style={{ width: '100%' }} /></label>
                          </div>
                      </div>
                  );
              })}
              {formData.cargo === "DOCENTE" && (
                  <button type="button" onClick={() => setFormData(prev => ({...prev, cursos_data: [...prev.cursos_data, { curso: "", division: "", turno: "", modalidad: "", dias_horarios: [{dia:"", horario:""}], plazas: "" }] }))} style={{ gridColumn: '1 / -1', padding: '5px' }}>+ AGREGAR OTRO CURSO</button>
              )}

              <label style={{ gridColumn: '1 / -1' }}>ESTADO:
                  <select name="estado" value={formData.estado} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}>
                      <option value="">Seleccione...</option>
                      {["VISADO EN JUNTA", "SIN CUBRIR", "CUBIERTO", "CUBIERTO 2063 CON DOCENTE", "CUBIERTO POR CONTINUIDAD", "CUBIERTO ATE", "CUBIERTO REINTEGRADA", "PUBLICADO", "DEVUELTO POR JUNTA A LA ESCUELA"].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
              </label>

              {/* Seguimiento */}
              {renderObservationInputs('en_direccion_nivel')}
              {renderObservationInputs('en_junta')}
              {renderObservationInputs('en_novedades')}
              {renderObservationInputs('en_institucion')}
              {renderObservationInputs('fecha_cobro_docente')}

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                  {/* Formulario de Datos Personales */}
                  {selectedDocenteDetails && (
                      <div style={{ border: '1px solid black', padding: '10px', width: '100%', fontSize: '12px' }}>
                          <h4>FORMULARIO DE DATOS PERSONALES para JUNTA</h4>
                          <p><strong>APELLIDOS Y NOMBRES:</strong> {selectedDocenteDetails.apellido}, {selectedDocenteDetails.nombre}</p>
                          <p><strong>CUIL/DNI:</strong> ___ - {selectedDocenteDetails.dni} - ___</p>
                          <p><strong>CORREO:</strong> {selectedDocenteDetails.mail}</p>
                          <p><strong>CELULAR:</strong> {selectedDocenteDetails.celular}</p>
                          <p><strong>ESCUELA:</strong> Escuela Secundaria Gobernador Garmendia</p>
                          <p><strong>CIRCUITO:</strong> Circuito N°1 - Agrupamiento N°17</p>
                          <p><strong>CARGO:</strong> {formData.cargo}</p>
                          <p><strong>FECHA DE TOMA:</strong> {formData.fecha_designacion}</p>
                      </div>
                  )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                  <label>DOCUMENTACIÓN ADJUNTADA:</label>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '5px' }}>
                      {/* Lista generada automáticamente */}
                      {getDocumentationOptions().filter(d => d !== "OTRA DOCUMENTACIÓN").map(doc => {
                          const itemsWithDropdown = ["ACTA DE RECONVERSIÓN PROFE INTERINO", "ACTA DE CESE DEFINITIVO DE LA ESCUELA", "ACTA DE CESE DEL REEMPLAZANTE", "ACTA DE SOLICITUD CAMBIO DE FUNCIÓN"];
                          const isDropdown = itemsWithDropdown.includes(doc);
                          let label = resolveDocLabel(doc);
                          let isChecked = false;
                          
                          if (isDropdown) {
                              const selection = docSelections[doc];
                              const valToCheck = selection ? `${doc} ${selection}` : doc; // Check logic simplified
                              isChecked = formData.documentacion_adjunta.some(d => d.startsWith(doc));
                          } else {
                              isChecked = formData.documentacion_adjunta.includes(label);
                          }

                          return (
                              <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <label style={{flex: 1}}>
                                      <input type="checkbox" checked={isChecked} onChange={() => toggleDocumentation(doc)} /> 
                                      {label}
                                  </label>
                                  {isDropdown && (
                                      <select 
                                        value={docSelections[doc] || ""} 
                                        onChange={e => setDocSelections(prev => ({...prev, [doc]: e.target.value}))}
                                        style={{ fontSize: '11px', padding: '2px' }}
                                        onClick={e => e.stopPropagation()}
                                      >
                                          <option value="">Seleccione...</option>
                                          <option value={getDocenteName(formData.docente_dueno_id)}>{getDocenteName(formData.docente_dueno_id)}</option>
                                          <option value={getDocenteName(formData.docente_propuesto_id)}>{getDocenteName(formData.docente_propuesto_id)}</option>
                                      </select>
                                  )}
                              </div>
                          );
                      })}
                      
                      {/* Sección para OTRA DOCUMENTACIÓN y documentos personalizados ya agregados */}
                      <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                          <strong>OTRA DOCUMENTACIÓN:</strong>
                          <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                              <input 
                                  placeholder="Escriba otra documentación..." 
                                  value={customDocInput} 
                                  onChange={e => setCustomDocInput(e.target.value)} 
                                  style={{ flex: 1, padding: '5px' }}
                              />
                              <button type="button" onClick={addCustomDoc} style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>+</button>
                          </div>
                          {/* Listar documentos personalizados (aquellos que no están en la lista estándar generada o fueron agregados manualmente) */}
                          {formData.documentacion_adjunta.map((doc, idx) => {
                              // Simple check: if resolveDocLabel(doc base) isn't in standard list roughly
                              // For simplicity, we just list ALL checked docs here as chips to allow removal
                              return (
                                  <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#e0e0e0', borderRadius: '15px', padding: '2px 8px', margin: '2px', fontSize: '11px' }}>
                                      <span>{doc}</span>
                                      <button 
                                          type="button" 
                                          onClick={() => setFormData(prev => ({...prev, documentacion_adjunta: prev.documentacion_adjunta.filter(d => d !== doc)}))}
                                          style={{ marginLeft: '5px', background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}
                                      >x</button>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ padding: '10px 20px' }}>Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Vista Detallada / Impresión --- */}
      {(showDetail.show) && (
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#555', zIndex: 2000, overflowY: 'auto' }}>
          <div className="print-content" style={{ padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="print-page">
              {showDetail.data ? renderDetailContent(showDetail.data) : (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                      <tr>
                        <th colSpan="11" style={{ border: 'none', paddingBottom: '10px' }}>
                          <div className="print-header" style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', color: 'black' }}>
                            <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                            <div>
                              <h1 style={{ fontSize: '18px', margin: 0 }}>Escuela Secundaria Gobernador Garmendia</h1>
                              <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                            </div>
                          </div>
                        </th>
                      </tr>
                      <tr style={{ backgroundColor: "#f2f2f2", color: "black" }}>
                        <th style={{ border: '1px solid black', padding: '5px' }}>F. OFREC.</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>F. DESIG.</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>F. INGRESO DES</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>CIRCUITO</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>AGRUP.</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>C.U.E.</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>ESCUELA</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>CARACTERISTICAS</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>MODALIDAD</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(item => {
                        const cursoInfo = item.cursos_data && item.cursos_data[0] ? `${item.cursos_data[0].curso} ${item.cursos_data[0].division} - ${item.cursos_data[0].turno}` : `${item.curso || ''} ${item.division || ''} - ${item.turno || ''}`;
                        const asignaturaInfo = item.cursos_data && item.cursos_data[0] ? item.cursos_data[0].asignatura : item.asignatura;
                        return (<tr key={item.id} >
                           <td style={{ border: '1px solid black', padding: '5px' }}>{formatDate(item.fecha_ofrecimiento)}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{formatDate(item.fecha_designacion)}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{formatDate(item.en_direccion_nivel?.value)}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>1</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>17</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>9001717/00</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>Esc. Sec. Gob. Garmendia</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{item.caracteristicas}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{item.cursos_data?.[0]?.modalidad}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{item.estado}</td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
          <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#333', padding: '15px', textAlign: 'center' }}>
            <button onClick={() => window.print()} style={{ padding: '10px 20px', margin: '0 10px' }}>GUARDAR COMO PDF</button>
            <button onClick={() => window.print()} style={{ padding: '10px 20px', margin: '0 10px' }}>IMPRIMIR</button>
            <button onClick={() => setShowDetail({ show: false, data: null, isPrint: false })} style={{ padding: '10px 20px', margin: '0 10px' }}>CANCELAR</button>
          </div>
          <style>{`
            .print-page { background: white; width: ${showDetail.data ? '210mm' : '297mm'}; padding: 10mm; margin: 20px auto; box-sizing: border-box; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
            @media print {
              .no-print { display: none !important; }
              @page {
                size: ${showDetail.data ? 'A4 portrait' : 'A4 landscape'};
                margin: 10mm;
              }
              html, body {
                height: auto !important;
                overflow: visible !important;
                margin: 0 !important;
                padding: 0 !important;
                background: none !important;
              }
              body * {
                visibility: hidden;
              }
              .print-overlay, .print-overlay * {
                visibility: visible;
              }
              .print-overlay {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                background-color: white !important;
                height: auto !important;
                overflow: visible !important;
              }
              .print-content {
                padding: 0 !important;
              }
              .print-page {
                box-shadow: none !important;
                margin: 0 !important;
                width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
              }
              thead { display: table-header-group; }
              tr { page-break-inside: avoid; }
            }
          `}</style>
        </div>
      )}

      {/* --- Tabla Principal --- */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '11px' }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white", fontSize: '10px' }}>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>FECHA DE INGRESO DES</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>CIRCUITO</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>AGRUPAMIENTO</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>C.U.E.</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>ESCUELA</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>CARACTERISTICAS</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>MODALIDAD O BACHILLER CON ORIENTACION EN</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>CARÁCTER</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>APELLIDO Y NOMBRE DEL DOCENTE DUEÑO / OBS</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>CAUSAL DE LA VACANTE</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>CARÁCTER</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>APELLIDO Y NOMBRE DEL DOCENTE PROPUESTO / OBS</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>CARGO Y/O MATERIA</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>NRO PLAZAS</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>TURNO</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>HS CAT</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>CURSO DIV</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>DESDE</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>HASTA</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>OBSERVACIONES-DES</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>ESTADO</th>
              <th style={{ border: '1px solid black', padding: '5px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '180px', whiteSpace: 'nowrap' }}>VISTA</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="22" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map(item => {
                const cursoData = item.cursos_data?.[0] || {};
                const cargoMateria = item.cargo === 'DOCENTE' ? (cursoData.asignatura || item.asignatura || '---') : item.cargo;
                const cursoDiv = item.cargo === 'DOCENTE' ? `${cursoData.curso || item.curso || ''} ${cursoData.division || item.division || ''}`.trim() : '---';
                const hsCatMatch = codigos.find(c => c.curso === (cursoData.curso || item.curso) && c.division === (cursoData.division || item.division) && c.asignatura === (cursoData.asignatura || item.asignatura));
                const lastObs = (item.en_direccion_nivel?.observations || []).filter(o => o.text?.trim()).slice(-1)[0];

                return (<tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: (mode === 'edit' || mode === 'delete') ? 'pointer' : 'default', color: getRowColor(item.estado), fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{formatDate(item.en_direccion_nivel?.value)}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>1</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>17</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>9001717/00</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>Esc. Sec. Gob. Garmendia</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{item.caracteristicas}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{cursoData.modalidad || '---'}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{item.caracter_dueno}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{getDocenteName(item.docente_dueno_id)}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{item.causal}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{item.caracter_propuesto}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{getDocenteName(item.docente_propuesto_id)}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{cargoMateria}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{cursoData.plazas || item.plazas || '---'}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{cursoData.turno || item.turno || '---'}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{hsCatMatch?.carga_horaria || '---'}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{cursoDiv}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{formatDate(item.desde)}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{formatDate(item.hasta)}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{lastObs ? `${formatDate(lastObs.date)} - ${lastObs.text}` : '---'}</td>
                  <td style={{ border: '1px solid black', padding: '5px', color: getRowColor(item.estado), fontWeight: 'bold' }}>{item.estado}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setShowDetail({ show: true, data: item, isPrint: false })} style={{ backgroundColor: 'lightblue', color: 'black', fontSize: '10px', padding: '2px 5px', marginRight: '5px' }}>VER</button>
                    <button onClick={() => setShowDetail({ show: true, data: item, isPrint: true })} style={{ backgroundColor: 'yellow', color: 'black', fontSize: '10px', padding: '2px 5px' }}>IMPRIMIR</button>
                  </td>
                </tr>)
              })
            ) : (
              <tr><td colSpan="22" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SeguimientoF501;