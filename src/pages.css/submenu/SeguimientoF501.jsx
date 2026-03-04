import React, { useState, useEffect, useCallback } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets/logos/Logo.png";

const SeguimientoF501 = ({ goBack, goHome }) => {
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
    fecha_ofrecimiento: null,
    fecha_designacion: null,
    cargo: "",
    docente_dueno_id: "SIN DOCENTES",
    docente_propuesto_id: "VACANTE ENVIADO A JUNTA",
    curso: "",
    division: "",
    turno: "",
    asignatura: "",
    dias_horarios: [{ dia: "", horario: "" }],
    caracter: "INTERINO",
    plazas: "",
    causal: "",
    desde: null,
    hasta: "",
    en_direccion_nivel: { value: "", observations: [] },
    en_junta: { value: "", observations: [] },
    en_novedades: { value: "", observations: [] },
    en_institucion: { value: "", observations: [] },
    fecha_cobro_docente: { value: "", observations: [] },
    documentacion_adjunta: [""],
    fecha_seguimiento: null,
    estado: "",
  });
  const [formData, setFormData] = useState(createInitialState());

  // --- Estados para Desplegables Dependientes ---
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [availableAsignaturas, setAvailableAsignaturas] = useState([]);
  const [availablePlazas, setAvailablePlazas] = useState([]);

  // --- Estado de Filtros ---
  const [filters, setFilters] = useState({
    fecha: "", mes: "", anio: "", cargo: "", curso: "", division: "",
    turno: "", asignatura: "", caracter: "", causal: "", desde: "",
    hasta: "", estado: ""
  });

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const cargosList = [
    "DIRECTOR/A", "SECRETARIO", "AYUDANTE DE SECRETARIA", "PRECEPTOR",
    "ASESOR PED.", "DOCENTE", "BIBLIOTECARIO/A",
    "AYUDANTE CLASES PRACTICAS (TECN/INFORM)", "AYUDANTE CLASES PRACTICAS (FISICA)",
    "PERSONAL AUXILIAR (CAT. 18)", "PERSONAL AUXILIAR (CAT. 15)"
  ];

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
        supabase.from('datos_de_legajo_docentes').select('id, apellido, nombre').order('apellido'),
        supabase.from('codigos').select('*'),
        supabase.from('estructura_horario').select('*'),
      ]);

      if (segError) throw segError;
      if (docError) throw docError;
      if (codError) throw codError;
      if (estError) throw estError;

      setSeguimientos(segData || []);
      setDocentes(docData.map(d => ({ id: d.id, nombre: `${d.apellido}, ${d.nombre}` })) || []);
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

  // --- Lógica de Formulario y Campos Automáticos ---
  const updateStatusAndDate = useCallback(() => {
    setFormData(prev => {
      const newFormData = { ...prev };
      let latestDate = null;
      let latestSource = "";
      let latestIsObservation = false;

      const sections = [
        { key: 'en_direccion_nivel', status: 'ENVIADO A D.E.S.', obsStatus: 'EN CORRECCIÓN DE D.E.S.' },
        { key: 'en_junta', status: 'EN JUNTA', obsStatus: 'EN CORRECCIÓN DE JUNTA' },
        { key: 'en_novedades', status: 'EN NOVEDADES SALARIALES', obsStatus: 'EN CORRECCIÓN DE NOVEDADES SALARIALES' },
        { key: 'en_institucion', status: 'EN LA INSTITUCION', obsStatus: 'EN LA INSTITUCION' },
        { key: 'fecha_cobro_docente', status: 'DOCENTE COBRANDO', obsStatus: 'DOCENTE COBRANDO' },
      ];

      sections.forEach(section => {
        const data = newFormData[section.key];
        if (data) {
          if (data.value && data.value !== 'PENDIENTE') {
            const currentDate = new Date(data.value);
            if (!latestDate || currentDate > latestDate) {
              latestDate = currentDate;
              latestSource = section.key;
              latestIsObservation = false;
            }
          }
          if (data.observations) {
            data.observations.forEach(obs => {
              if (obs.date) {
                const obsDate = new Date(obs.date);
                if (!latestDate || obsDate >= latestDate) {
                  latestDate = obsDate;
                  latestSource = section.key;
                  latestIsObservation = true;
                }
              }
            });
          }
        }
      });

      newFormData.fecha_seguimiento = latestDate ? latestDate.toISOString().split('T')[0] : null;

      const finalSection = sections.find(s => s.key === latestSource);
      if (finalSection) {
        newFormData.estado = latestIsObservation ? finalSection.obsStatus : finalSection.status;
      } else {
        newFormData.estado = "";
      }

      return newFormData;
    });
  }, []);

  useEffect(() => {
    updateStatusAndDate();
  }, [
    formData.en_direccion_nivel, formData.en_junta, formData.en_novedades,
    formData.en_institucion, formData.fecha_cobro_docente, updateStatusAndDate
  ]);

  useEffect(() => {
    const { cargo, curso, division } = formData;
    if (cargo !== 'DOCENTE') {
      setFormData(prev => ({ ...prev, curso: '---', division: '---', asignatura: '---', turno: '' }));
      setAvailableDivisions([]);
      setAvailableAsignaturas([]);
      setAvailablePlazas([]);
      return;
    }

    if (curso && curso !== '---') {
      const divs = [...new Set(codigos.filter(c => c.curso === curso).map(c => c.division))].sort();
      setAvailableDivisions(divs);
    } else {
      setAvailableDivisions([]);
    }

    if (curso && curso !== '---' && division && division !== '---') {
      const asigs = [...new Set(codigos.filter(c => c.curso === curso && c.division === division).map(c => c.asignatura))].sort();
      const plazas = codigos.find(c => c.curso === curso && c.division === division)?.plazas || [];
      const turno = codigos.find(c => c.curso === curso && c.division === division)?.turno || "";
      setAvailableAsignaturas(asigs);
      setAvailablePlazas(Array.isArray(plazas) ? plazas : []);
      setFormData(prev => ({ ...prev, turno }));
    } else {
      setAvailableAsignaturas([]);
      setAvailablePlazas([]);
    }
  }, [formData.cargo, formData.curso, formData.division, codigos]);

  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDynamicListChange = (listName, index, value) => {
    setFormData(prev => {
      const newList = [...prev[listName]];
      newList[index] = value;
      if (index === newList.length - 1 && value.trim() !== "") {
        newList.push("");
      }
      return { ...prev, [listName]: newList };
    });
  };

  const handleObservationChange = (section, field, value, obsIndex = null) => {
    setFormData(prev => {
      const newSectionData = { ...prev[section] };
      if (obsIndex === null) { // Campo principal (value)
        newSectionData.value = value;
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
      ...item,
      en_direccion_nivel: item.en_direccion_nivel || { value: "", observations: [] },
      en_junta: item.en_junta || { value: "", observations: [] },
      en_novedades: item.en_novedades || { value: "", observations: [] },
      en_institucion: item.en_institucion || { value: "", observations: [] },
      fecha_cobro_docente: item.fecha_cobro_docente || { value: "", observations: [] },
      documentacion_adjunta: item.documentacion_adjunta ? [...item.documentacion_adjunta, ""] : [""],
      dias_horarios: item.dias_horarios && item.dias_horarios.length > 0 ? item.dias_horarios : [{ dia: "", horario: "" }],
    };
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
    
    const cleanField = (value) => value || '---';

    const payload = {
      ...formData,
      fecha_ofrecimiento: formData.fecha_ofrecimiento || null,
      fecha_designacion: formData.fecha_designacion || null,
      desde: formData.desde || null,
      hasta: cleanField(formData.hasta),
      documentacion_adjunta: formData.documentacion_adjunta.filter(d => d.trim() !== ''),
      dias_horarios: formData.dias_horarios.filter(d => d.dia && d.horario),
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
      (!filters.fecha || item.fecha_seguimiento === filters.fecha) &&
      (!filters.mes || itemMes === filters.mes) &&
      (!filters.anio || itemAnio === filters.anio) &&
      (!filters.cargo || item.cargo === filters.cargo) &&
      (!filters.curso || item.curso === filters.curso) &&
      (!filters.division || item.division === filters.division) &&
      (!filters.turno || item.turno === filters.turno) &&
      (!filters.asignatura || (item.asignatura || "").toLowerCase().includes(filters.asignatura.toLowerCase())) &&
      (!filters.caracter || item.caracter === filters.caracter) &&
      (!filters.causal || (item.causal || "").toLowerCase().includes(filters.causal.toLowerCase())) &&
      (!filters.desde || item.desde === filters.desde) &&
      (!filters.hasta || item.hasta === filters.hasta) &&
      (!filters.estado || item.estado === filters.estado)
    );
  });

  // --- Renderizado ---
  const renderDetailContent = (data) => {
    if (!data) return null;
    const docenteDueno = docentes.find(d => d.id === data.docente_dueno_id)?.nombre || data.docente_dueno_id;
    const docentePropuesto = docentes.find(d => d.id === data.docente_propuesto_id)?.nombre || data.docente_propuesto_id;

    const renderSection = (label, sectionData) => (
      <div>
        <strong>{label}:</strong> {sectionData?.value || '---'}
        {sectionData?.observations?.filter(o => o.text).map((obs, i) => (
          <div key={i} style={{ marginLeft: '20px', fontSize: '0.9em' }}>
            <em>Obs:</em> {obs.text} ({obs.date || 's/f'})
          </div>
        ))}
      </div>
    );

    return (
      <div style={{ padding: '10px', fontSize: '12px', lineHeight: '1.6' }}>
        <p><strong>Fecha Ofrecimiento:</strong> {data.fecha_ofrecimiento || '---'}</p>
        <p><strong>Fecha Designación:</strong> {data.fecha_designacion || '---'}</p>
        <p><strong>Cargo:</strong> {data.cargo}</p>
        <p><strong>Docente Dueño:</strong> {docenteDueno}</p>
        <p><strong>Docente Propuesto:</strong> {docentePropuesto}</p>
        <p><strong>Curso/Div/Turno:</strong> {data.curso} {data.division} ({data.turno})</p>
        <p><strong>Asignatura:</strong> {data.asignatura}</p>
        <p><strong>Carácter:</strong> {data.caracter}</p>
        <p><strong>Plazas:</strong> {data.plazas}</p>
        <p><strong>Causal:</strong> {data.causal}</p>
        <p><strong>Desde:</strong> {data.desde || '---'} <strong>Hasta:</strong> {data.hasta || '---'}</p>
        <hr />
        {renderSection("En Dirección de Nivel", data.en_direccion_nivel)}
        {renderSection("En Junta", data.en_junta)}
        {renderSection("En Novedades Salariales", data.en_novedades)}
        {renderSection("En la Institución", data.en_institucion)}
        {renderSection("Fecha de Cobro", data.fecha_cobro_docente)}
        <hr />
        <p><strong>Fecha Seguimiento:</strong> {data.fecha_seguimiento}</p>
        <p><strong>Estado:</strong> {data.estado}</p>
        <p><strong>Documentación Adjunta:</strong> {(data.documentacion_adjunta || []).join(", ")}</p>
      </div>
    );
  };

  const renderObservationInputs = (sectionName) => (
    <div style={{ gridColumn: '1 / -1', border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
      <label style={{ fontWeight: 'bold' }}>{sectionName.replace(/_/g, ' ').toUpperCase()}:</label>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="date" value={formData[sectionName]?.value === 'PENDIENTE' ? '' : formData[sectionName]?.value || ''} onChange={e => handleObservationChange(sectionName, 'value', e.target.value)} style={{ flex: 1, padding: '5px' }} />
        <button type="button" onClick={() => handleObservationChange(sectionName, 'value', formData[sectionName]?.value === 'PENDIENTE' ? '' : 'PENDIENTE')} style={{ backgroundColor: formData[sectionName]?.value === 'PENDIENTE' ? 'orange' : '#eee' }}>PENDIENTE</button>
      </div>
      {formData[sectionName]?.value && (
        <div style={{ marginTop: '10px' }}>
          <label>Observaciones:</label>
          {(formData[sectionName]?.observations || [{ text: '', date: '' }]).map((obs, i) => (
            <div key={i} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <input type="text" placeholder={`Obs. ${i + 1}`} value={obs.text} onChange={e => handleObservationChange(sectionName, 'text', e.target.value, i)} style={{ flex: 2, padding: '5px' }} />
              <input type="date" value={obs.date} onChange={e => handleObservationChange(sectionName, 'date', e.target.value, i)} style={{ flex: 1, padding: '5px' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
        {['cargo', 'curso', 'division', 'turno', 'asignatura', 'caracter', 'causal', 'estado'].map(f => (
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
      </div>

      {/* --- Formulario Modal --- */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ textAlign: 'center' }}>{mode === 'create' ? 'Nuevo Seguimiento' : 'Modificar Seguimiento'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <label>Fecha Ofrecimiento: <input type="date" name="fecha_ofrecimiento" value={formData.fecha_ofrecimiento || ''} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
              <label>Fecha Designación: <input type="date" name="fecha_designacion" value={formData.fecha_designacion || ''} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
              <label>Cargo: <select name="cargo" value={formData.cargo} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}><option value="">Seleccione...</option>{cargosList.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
              <label>Docente Dueño: <select name="docente_dueno_id" value={formData.docente_dueno_id} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}><option value="SIN DOCENTES">SIN DOCENTES</option>{docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></label>
              <label style={{ gridColumn: '1 / -1' }}>Docente Propuesto: <select name="docente_propuesto_id" value={formData.docente_propuesto_id} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}><option value="VACANTE ENVIADO A JUNTA">VACANTE ENVIADO A JUNTA</option>{docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></label>
              <label>Curso: <input name="curso" value={formData.curso} onChange={handleInputChange} disabled={formData.cargo !== 'DOCENTE'} style={{ width: '100%', padding: '5px' }} /></label>
              <label>División: <select name="division" value={formData.division} onChange={handleInputChange} disabled={formData.cargo !== 'DOCENTE' || !formData.curso} style={{ width: '100%', padding: '5px' }}><option value="">Seleccione...</option>{availableDivisions.map(d => <option key={d} value={d}>{d}</option>)}</select></label>
              <label>Turno: <input name="turno" value={formData.turno} readOnly style={{ width: '100%', padding: '5px', backgroundColor: '#eee' }} /></label>
              <label>Asignatura: <select name="asignatura" value={formData.asignatura} onChange={handleInputChange} disabled={formData.cargo !== 'DOCENTE' || !formData.division} style={{ width: '100%', padding: '5px' }}><option value="">Seleccione...</option>{availableAsignaturas.map(a => <option key={a} value={a}>{a}</option>)}</select></label>
              <label>Carácter: <select name="caracter" value={formData.caracter} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}><option value="INTERINO">INTERINO</option><option value="SUPLENTE">SUPLENTE</option></select></label>
              <label>Plazas: <select name="plazas" value={formData.plazas} onChange={handleInputChange} disabled={!formData.division} style={{ width: '100%', padding: '5px' }}><option value="">Seleccione...</option>{availablePlazas.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
              <label style={{ gridColumn: '1 / -1' }}>Causal: <input name="causal" value={formData.causal} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
              <label>Desde: <input type="date" name="desde" value={formData.desde || ''} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
              <label>Hasta: <input name="hasta" value={formData.hasta} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
              
              {renderObservationInputs('en_direccion_nivel')}
              {renderObservationInputs('en_junta')}
              {renderObservationInputs('en_novedades')}
              {renderObservationInputs('en_institucion')}
              {renderObservationInputs('fecha_cobro_docente')}

              <div style={{ gridColumn: '1 / -1' }}>
                <label>Documentación Adjunta:</label>
                {formData.documentacion_adjunta.map((doc, i) => (
                  <input key={i} type="text" value={doc} onChange={e => handleDynamicListChange('documentacion_adjunta', i, e.target.value)} style={{ width: '100%', padding: '5px', marginTop: '5px' }} />
                ))}
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
          <div className="print-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="print-page">
              <div className="print-header" style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px', color: 'black' }}>
                <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                <div>
                  <h1 style={{ fontSize: '18px', margin: 0 }}>Escuela Secundaria Gobernador Garmendia</h1>
                  <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                </div>
              </div>
              {showDetail.data ? renderDetailContent(showDetail.data) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  {/* Renderizado de tabla para impresión general */}
                </table>
              )}
            </div>
          </div>
          <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#333', padding: '15px', textAlign: 'center' }}>
            <button onClick={() => window.print()} style={{ padding: '10px 20px', margin: '0 10px' }}>GUARDAR COMO PDF</button>
            <button onClick={() => window.print()} style={{ padding: '10px 20px', margin: '0 10px' }}>IMPRIMIR</button>
            <button onClick={() => setShowDetail({ show: false, data: null, isPrint: false })} style={{ padding: '10px 20px', margin: '0 10px' }}>CANCELAR</button>
          </div>
          <style>{`
            @media print { .no-print { display: none; } @page { size: A4; margin: 20mm; } }
            .print-page { background: white; width: 210mm; min-height: 297mm; padding: 20mm; margin: 20px auto; box-sizing: border-box; }
          `}</style>
        </div>
      )}

      {/* --- Tabla Principal --- */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '11px' }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th>F. OFREC.</th><th>F. DESIG.</th><th>F. SEGUIM.</th><th>CARGO</th><th>CURSO</th><th>DIV</th>
              <th>TURNO</th><th>ASIGNATURA</th><th>CARÁCTER</th><th>CAUSAL</th><th>DESDE</th><th>HASTA</th><th>ESTADO</th><th>VISTA</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="14" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map(item => (
                <tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: (mode === 'edit' || mode === 'delete') ? 'pointer' : 'default' }}>
                  <td>{item.fecha_ofrecimiento || '---'}</td>
                  <td>{item.fecha_designacion || '---'}</td>
                  <td>{item.fecha_seguimiento || '---'}</td>
                  <td>{item.cargo}</td>
                  <td>{item.curso}</td>
                  <td>{item.division}</td>
                  <td>{item.turno}</td>
                  <td>{item.asignatura}</td>
                  <td>{item.caracter}</td>
                  <td>{item.causal}</td>
                  <td>{item.desde || '---'}</td>
                  <td>{item.hasta || '---'}</td>
                  <td>{item.estado}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setShowDetail({ show: true, data: item, isPrint: false })} style={{ backgroundColor: 'lightblue', color: 'black', fontSize: '10px', padding: '2px 5px', marginRight: '5px' }}>VER</button>
                    <button onClick={() => setShowDetail({ show: true, data: item, isPrint: true })} style={{ backgroundColor: 'yellow', color: 'black', fontSize: '10px', padding: '2px 5px' }}>IMPRIMIR</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="14" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SeguimientoF501;