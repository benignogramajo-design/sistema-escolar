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
  // --- Estado de Filtros ---
  const [filters, setFilters] = useState({
    fecha: "", mes: "", anio: "", cargo: "", curso: "", division: "",
    turno: "", asignatura: "", causal: "", desde: "",
    hasta: "", estado: ""
  });

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

  const handleNew = () => {
    setMode('create');
    setSelectedId(null);
    setFormData(createInitialState());
    setShowForm(true);
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
              {/* AQUI VA EL NUEVO FORMULARIO */}
              <p>Formulario en construcción...</p>
              {renderObservationInputs('en_direccion_nivel')}
              {renderObservationInputs('en_junta')}
              {renderObservationInputs('en_novedades')}
              {renderObservationInputs('en_institucion')}
              {renderObservationInputs('fecha_cobro_docente')}

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
                        <th style={{ border: '1px solid black', padding: '5px' }}>CARGO</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>CURSO</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>ASIGNATURA</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>DOCENTE</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>CAUSAL</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>DOCENTE PROPUESTO</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>DESDE</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>HASTA</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(item => {
                        const cursoInfo = item.cursos_data && item.cursos_data[0] ? `${item.cursos_data[0].curso} ${item.cursos_data[0].division} - ${item.cursos_data[0].turno}` : `${item.curso || ''} ${item.division || ''} - ${item.turno || ''}`;
                        const asignaturaInfo = item.cursos_data && item.cursos_data[0] ? item.cursos_data[0].asignatura : item.asignatura;
                        return (<tr key={item.id} style={{ color: getRowColor(item.estado) }}>
                           <td style={{ border: '1px solid black', padding: '5px' }}>{formatDate(item.fecha_ofrecimiento)}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{formatDate(item.fecha_designacion)}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{item.cargo}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{cursoInfo}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{asignaturaInfo}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{getDocenteName(item.docente_dueno_id)} - {item.caracter_dueno}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{item.causal}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{getDocenteName(item.docente_propuesto_id)} - {item.caracter_propuesto}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{formatDate(item.desde)}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{formatDate(item.hasta)}</td>
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
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th>F. OFREC.</th><th>F. DESIG.</th><th>F. SEGUIM.</th><th>CARGO</th><th>CURSO</th>
              <th>ASIGNATURA</th><th>DOCENTE</th><th>CAUSAL</th><th>DOCENTE PROPUESTO</th><th>DESDE</th><th>HASTA</th><th>ESTADO</th><th>VISTA</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="13" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map(item => {
                const cursoInfo = item.cursos_data && item.cursos_data[0] ? `${item.cursos_data[0].curso} ${item.cursos_data[0].division} - ${item.cursos_data[0].turno}` : `${item.curso || ''} ${item.division || ''} - ${item.turno || ''}`;
                const asignaturaInfo = item.cursos_data && item.cursos_data[0] ? item.cursos_data[0].asignatura : item.asignatura;
                return (<tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: (mode === 'edit' || mode === 'delete') ? 'pointer' : 'default', color: getRowColor(item.estado), fontWeight: 'bold' }}>
                  <td>{formatDate(item.fecha_ofrecimiento)}</td>
                  <td>{formatDate(item.fecha_designacion)}</td>
                  <td>{formatDate(item.fecha_seguimiento)}</td>
                  <td>{item.cargo}</td>
                  <td>{cursoInfo}</td>
                  <td>{asignaturaInfo}</td>
                  <td>{getDocenteName(item.docente_dueno_id)} - {item.caracter_dueno}</td>
                  <td>{item.causal}</td>
                  <td>{getDocenteName(item.docente_propuesto_id)} - {item.caracter_propuesto}</td>
                  <td>{formatDate(item.desde)}</td>
                  <td>{formatDate(item.hasta)}</td>
                  <td>{item.estado}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setShowDetail({ show: true, data: item, isPrint: false })} style={{ backgroundColor: 'lightblue', color: 'black', fontSize: '10px', padding: '2px 5px', marginRight: '5px' }}>VER</button>
                    <button onClick={() => setShowDetail({ show: true, data: item, isPrint: true })} style={{ backgroundColor: 'yellow', color: 'black', fontSize: '10px', padding: '2px 5px' }}>IMPRIMIR</button>
                  </td>
                </tr>)
              })
            ) : (
              <tr><td colSpan="13" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SeguimientoF501;