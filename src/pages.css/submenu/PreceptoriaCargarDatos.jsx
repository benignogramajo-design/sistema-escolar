import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PRECEPTORIA1.jpg";
import logo from "../../assets/logos/Logo.png";
import { supabase } from "../../components.css/supabaseClient";
import * as XLSX from 'xlsx';

const PreceptoriaCargarDatos = ({ goBack, goHome }) => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [showPrint, setShowPrint] = useState(false);

  // --- Initial Form State ---
  const initialTutor = {
    parentesco: "", parentesco_otro: "", apellido: "", nombre: "",
    pre_cuil: "", dni: "", pos_cuil: "", sexo: "", fecha_nacimiento: "", edad: "",
    celular: "", ocupacion: "", ocupacion_otro: "", escolaridad: "", asignacion: ""
  };

  const initialForm = {
    estado_alumno: "REGULAR",
    curso: "", division: "", turno: "",
    anio_ingreso: "", libro_matriz: "", folio: "",
    apellido: "", nombre: "",
    fecha_nacimiento: "", edad: "",
    pre_cuil: "", dni: "", pos_cuil: "",
    sexo: "", celular: "",
    domicilio: "", localidad: "", departamento: "", provincia: "", lugar_nacimiento: "",
    discapacidad: "NO", certificado_medico: "NO", diagnostico: "", docente_integrador: "NO",
    documentacion: [], // Array de strings
    tutores: [{ ...initialTutor }], // Array de objetos tutor
    fecha_egreso: null,
    ciclo_lectivo_pendiente: ""
  };

  const [formData, setFormData] = useState(initialForm);

  // --- Filters State ---
  const [filters, setFilters] = useState({
    curso: "", division: "", turno: "",
    apellido_nombre: "", dni: "", estado: [],
    anio: ""
  });
  const [showEstadoFilter, setShowEstadoFilter] = useState(false);

  // --- Constants for Lists ---
  const cursosList = ["1", "2", "3", "4", "5", "6"];
  const divisionesList = ["A", "B", "C", "D"];
  const estadosPosibles = ["REGULAR", "REPITENTE", "EGRESADO", "PENDIENTE DE EGRESO"];
  const turnosList = ["MAÑANA", "TARDE"];
  const documentacionList = [
    "CERTIFICADO DE EDUCACIÓN PRIMARIA", "DNI", "CUIL", "ACTA DE NACIMIENTO",
    "CERTIFICADO DE SALUD", "FICHA MÉDICA", "GRUPO SANGUÍNEO",
    "CERTIFICADO DE VACUNACIÓN", "DNI DEL TUTOR", "CUIL DEL TUTOR", "INSCRIPCIÓN"
  ];
  const parentescosList = ["PADRE", "MADRE", "ABUELO/A", "HERMANO/A", "TIO/A", "TUTOR", "OTRO"];
  const ocupacionesList = ["AMA DE CASA", "EMPLEADO/A", "DESEMPLEADO/A", "INDEPENDIENTE", "DOCENTE", "JORNALERO/A", "PROFESIONAL", "PENSIONADO/JUBILADO", "OTRO"];
  const escolaridadList = ["PRIMARIA INCOMPLETA", "PRIMARIA COMPLETA", "SECUNDARIA INCOMPLETA", "SECUNDARIA COMPLETA", "TERCIARIA/UNIVERSITARIA COMPLETO O INCOMPLETO"];
  const asignacionList = ["NO COBRA NADA", "COBRA ASIGNACIÓN UNIVERSAL POR HIJO", "COBRA SALARIO FAMILIAR"];

  // --- Fetch Data ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registro_alumnos')
        .select('*')
        .order('apellido', { ascending: true });
      
      if (error) throw error;
      setAlumnos(data || []);
    } catch (error) {
      console.error("Error fetching alumnos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Auto-Turno Logic
  useEffect(() => {
    if (formData.curso && formData.division) {
      const code = `${formData.curso}${formData.division}`;
      const mananaCodes = ["1A", "2A", "3A", "4A", "5A", "6A", "1B", "2B", "3B"];
      const newTurno = mananaCodes.includes(code) ? "MAÑANA" : "TARDE";
      setFormData(prev => ({ ...prev, turno: newTurno }));
    }
  }, [formData.curso, formData.division]);

  // Auto-Edad Alumno
  useEffect(() => {
    if (formData.fecha_nacimiento) {
      setFormData(prev => ({ ...prev, edad: calculateAge(formData.fecha_nacimiento) }));
    }
  }, [formData.fecha_nacimiento]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocChange = (doc) => {
    setFormData(prev => {
      const current = prev.documentacion || [];
      if (current.includes(doc)) {
        return { ...prev, documentacion: current.filter(d => d !== doc) };
      } else {
        return { ...prev, documentacion: [...current, doc] };
      }
    });
  };

  // Tutor Handlers
  const handleTutorChange = (index, field, value) => {
    const newTutores = [...formData.tutores];
    newTutores[index][field] = value;
    
    // Auto edad tutor
    if (field === "fecha_nacimiento") {
      newTutores[index].edad = calculateAge(value);
    }

    setFormData(prev => ({ ...prev, tutores: newTutores }));
  };

  const addTutor = () => {
    setFormData(prev => ({ ...prev, tutores: [...prev.tutores, { ...initialTutor }] }));
  };

  const removeTutor = (index) => {
    const newTutores = [...formData.tutores];
    newTutores.splice(index, 1);
    setFormData(prev => ({ ...prev, tutores: newTutores }));
  };

  // CRUD Handlers
  const handleNew = () => {
    setModalMode("create");
    setFormData(initialForm);
    setSelectedId(null);
    setShowModal(true);
  };

  const handleModify = () => {
    if (!selectedId) return alert("Seleccione un alumno para modificar.");
    const item = alumnos.find(a => a.id === selectedId);
    if (item) {
      setModalMode("edit");
      // Asegurar estructura de tutores al editar
      const safeItem = {
        ...item,
        tutores: (item.tutores && Array.isArray(item.tutores) && item.tutores.length > 0) 
          ? item.tutores 
          : [{ ...initialTutor }]
      };
      setFormData(safeItem);
      setShowModal(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return alert("Seleccione un alumno para eliminar.");
    if (window.confirm("¿Está seguro de eliminar este alumno?")) {
      const { error } = await supabase.from('registro_alumnos').delete().eq('id', selectedId);
      if (error) alert("Error al eliminar: " + error.message);
      else {
        setSelectedId(null);
        fetchData();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Defaults for empty fields
    const payload = {
      ...formData,
      pre_cuil: formData.pre_cuil || "---",
      pos_cuil: formData.pos_cuil || "---",
      celular: formData.celular || "---",
      tutores: formData.tutores.map(t => ({
        ...t,
        pre_cuil: t.pre_cuil || "---",
        pos_cuil: t.pos_cuil || "---",
        celular: t.celular || "---"
      }))
    };

    try {
      if (modalMode === "create") {
        const { error } = await supabase.from('registro_alumnos').insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('registro_alumnos').update(payload).eq('id', selectedId);
        if (error) throw error;
      }
      setShowModal(false);
      fetchData();
      setSelectedId(null);
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  // --- Filtering ---
  const filteredAlumnos = alumnos.filter(a => {
    const f = filters;
    const fullName = `${a.apellido} ${a.nombre}`.toLowerCase();
    
    const yearMatch = !f.anio || (
      (a.estado_alumno === 'EGRESADO' && a.fecha_egreso && a.fecha_egreso.startsWith(f.anio)) ||
      (a.estado_alumno === 'PENDIENTE DE EGRESO' && a.ciclo_lectivo_pendiente && String(a.ciclo_lectivo_pendiente).includes(f.anio))
    );

    return (
      (!f.curso || a.curso === f.curso) &&
      (!f.division || a.division === f.division) &&
      (!f.turno || a.turno === f.turno) &&
      (!f.dni || String(a.dni).includes(f.dni)) &&
      (!f.estado || f.estado.length === 0 || f.estado.includes(a.estado_alumno)) &&
      (!f.apellido_nombre || fullName.includes(f.apellido_nombre.toLowerCase())) &&
      yearMatch
    );
  }).sort((a, b) => {
    // 1. CURSO Y DIVISIÓN
    const cursoA = parseInt(a.curso) || 0;
    const cursoB = parseInt(b.curso) || 0;
    if (cursoA !== cursoB) return cursoA - cursoB;
    
    const divA = (a.division || "").toUpperCase();
    const divB = (b.division || "").toUpperCase();
    if (divA !== divB) return divA.localeCompare(divB);

    // 2. APELLIDO Y NOMBRE del ALUMNO
    const nameA = `${a.apellido} ${a.nombre}`.toLowerCase();
    const nameB = `${b.apellido} ${b.nombre}`.toLowerCase();
    if (nameA !== nameB) return nameA.localeCompare(nameB);

    // 3. ESTADO
    const estA = (a.estado_alumno || "").toLowerCase();
    const estB = (b.estado_alumno || "").toLowerCase();
    return estA.localeCompare(estB);
  });

  const uniqueEstados = [...new Set(alumnos.map(a => a.estado_alumno).filter(Boolean))];

  // --- Excel Export ---
  const handleExcelExport = () => {
    const dataToExport = filteredAlumnos.map(a => {
      // Flatten data
      const flat = {
        "CURSO": a.curso,
        "DIVISION": a.division,
        "TURNO": a.turno,
        "APELLIDO": a.apellido,
        "NOMBRE": a.nombre,
        "DNI": a.dni,
        "ESTADO": a.estado_alumno,
        "FECHA NAC": a.fecha_nacimiento,
        "EDAD": a.edad,
        "CUIL": `${a.pre_cuil}-${a.dni}-${a.pos_cuil}`,
        "SEXO": a.sexo,
        "CELULAR": a.celular,
        "DOMICILIO": a.domicilio,
        "LOCALIDAD": a.localidad,
        "DISCAPACIDAD": a.discapacidad,
        "DIAGNOSTICO": a.diagnostico
      };

      // Add tutors dynamically
      a.tutores.forEach((t, i) => {
        flat[`TUTOR ${i+1} NOMBRE`] = `${t.apellido} ${t.nombre}`;
        flat[`TUTOR ${i+1} DNI`] = t.dni;
        flat[`TUTOR ${i+1} CEL`] = t.celular;
        flat[`TUTOR ${i+1} PARENTESCO`] = t.parentesco === 'OTRO' ? t.parentesco_otro : t.parentesco;
      });

      return flat;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alumnos");
    XLSX.writeFile(workbook, "Datos_Alumnos.xlsx");
  };

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      
      {!showPrint && (
        <>
          <h2>CARGAR DATOS DE ALUMNOS</h2>

          {/* --- Filtros --- */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '15px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
            <select value={filters.curso} onChange={e => setFilters({...filters, curso: e.target.value})} style={{ padding: '8px' }}>
              <option value="">CURSO</option>
              {cursosList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.division} onChange={e => setFilters({...filters, division: e.target.value})} style={{ padding: '8px' }}>
              <option value="">DIVISIÓN</option>
              {divisionesList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.turno} onChange={e => setFilters({...filters, turno: e.target.value})} style={{ padding: '8px' }}>
              <option value="">TURNO</option>
              {turnosList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="APELLIDO Y NOMBRE" value={filters.apellido_nombre} onChange={e => setFilters({...filters, apellido_nombre: e.target.value})} style={{ padding: '8px', width: '200px' }} />
            <input placeholder="DNI" value={filters.dni} onChange={e => setFilters({...filters, dni: e.target.value})} style={{ padding: '8px', width: '120px' }} />
            <input placeholder="AÑO" value={filters.anio} onChange={e => setFilters({...filters, anio: e.target.value})} style={{ padding: '8px', width: '80px' }} />
            
            {/* Filtro de Estado Multi-selección (Desplegable) */}
            <div style={{ position: 'relative', minWidth: '150px' }}>
              <button 
                type="button"
                onClick={() => setShowEstadoFilter(!showEstadoFilter)} 
                style={{ width: '100%', padding: '8px', textAlign: 'left', cursor: 'pointer', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
              >
                {filters.estado.length === 0 ? "ESTADOS" : `ESTADOS (${filters.estado.length})`}
              </button>
              {showEstadoFilter && (
                <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', zIndex: 10, padding: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                  {estadosPosibles.map(est => (
                    <label key={est} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '4px 2px' }}>
                      <input 
                        type="checkbox" 
                        checked={filters.estado.includes(est)} 
                        onChange={e => setFilters({...filters, estado: e.target.checked ? [...filters.estado, est] : filters.estado.filter(s => s !== est)})} 
                      /> {est}
                    </label>
                  ))}
                  <button type="button" onClick={() => setShowEstadoFilter(false)} style={{ width: '100%', fontSize: '10px', marginTop: '5px', cursor: 'pointer', border: 'none', backgroundColor: '#f0f0f0', padding: '3px' }}>Cerrar</button>
                </div>
              )}
            </div>
          </div>

          {/* --- Botones de Acción --- */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
            <button onClick={handleNew} style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>NUEVO</button>
            <button onClick={handleModify} style={{ backgroundColor: 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>MODIFICAR</button>
            <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>ELIMINAR</button>
            <button onClick={() => setShowPrint(true)} style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>IMPRIMIR</button>
            <button onClick={handleExcelExport} style={{ backgroundColor: '#ccff00', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>DESCARGAR EXCEL</button>
          </div>

          {/* --- Tabla --- */}
          <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: "#333", color: "white" }}>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CURSO Y DIVISIÓN</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>TURNO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>APELLIDO Y NOMBRE del ALUMNO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>DNI DEL ALUMNO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CELULAR</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>ESTADO</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>DISCAPACIDAD</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>APELLIDO Y NOMBRE DEL TUTOR</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>DNI DEL TUTOR</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>CELULAR DEL TUTOR</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>PARENTESCO</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
                ) : filteredAlumnos.length > 0 ? (
                  filteredAlumnos.map((a) => {
                    const tutor = (a.tutores && a.tutores.length > 0) ? a.tutores[0] : {};
                    return (
                    <tr 
                      key={a.id} 
                      onClick={() => setSelectedId(a.id)}
                      style={{ 
                        cursor: 'pointer', 
                        backgroundColor: selectedId === a.id ? '#fffbe6' : 'transparent',
                        fontWeight: selectedId === a.id ? 'bold' : 'normal'
                      }}
                    >
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>{a.curso} "{a.division}"</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>{a.turno}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{a.apellido}, {a.nombre}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{a.dni}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{a.celular}</td>
                      <td style={{ 
                        padding: "8px", 
                        border: "1px solid #ddd", 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: a.estado_alumno === 'REPITENTE' ? 'red' : 
                               a.estado_alumno === 'EGRESADO' ? 'green' : 
                               a.estado_alumno === 'PENDIENTE DE EGRESO' ? 'blue' : 'black'
                      }}>
                        {a.estado_alumno}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>{a.discapacidad}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{tutor.apellido ? `${tutor.apellido} ${tutor.nombre}` : '-'}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{tutor.dni || '-'}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{tutor.celular || '-'}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{tutor.parentesco === 'OTRO' ? tutor.parentesco_otro : (tutor.parentesco || '-')}</td>
                    </tr>
                  )})
                ) : (
                  <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>No hay registros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- Modal Formulario --- */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
              {modalMode === 'create' ? 'NUEVO ALUMNO' : 'MODIFICAR ALUMNO'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              
              {/* Sección Académica */}
              <div style={{ gridColumn: '1 / -1', backgroundColor: '#f0f8ff', padding: '10px', borderRadius: '5px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'blue' }}>DATOS ACADÉMICOS</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <label>ESTADO:
                    <select name="estado_alumno" value={formData.estado_alumno} onChange={handleInputChange} style={{ width: '100%' }}>
                      {estadosPosibles.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </label>
                  <label>CURSO:
                    <select name="curso" value={formData.curso} onChange={handleInputChange} style={{ width: '100%' }}>
                      <option value="">Seleccione</option>
                      {cursosList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label>DIVISIÓN:
                    <select name="division" value={formData.division} onChange={handleInputChange} style={{ width: '100%' }}>
                      <option value="">Seleccione</option>
                      {divisionesList.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <label>TURNO:
                    <input name="turno" value={formData.turno} readOnly style={{ width: '100%', backgroundColor: '#eee' }} />
                  </label>
                  <label>AÑO INGRESO:<input name="anio_ingreso" value={formData.anio_ingreso} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  <label>LIBRO MATRIZ:<input name="libro_matriz" value={formData.libro_matriz} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  <label>N° FOLIO:<input name="folio" value={formData.folio} onChange={handleInputChange} style={{ width: '100%' }} /></label>

                  {/* Campos condicionales según Estado */}
                  {formData.estado_alumno === 'EGRESADO' && (
                    <label style={{ gridColumn: 'span 2' }}>FECHA DE EGRESO: 
                      <input type="date" name="fecha_egreso" value={formData.fecha_egreso || ""} onChange={handleInputChange} required style={{ width: '100%' }} />
                    </label>
                  )}
                  {formData.estado_alumno === 'PENDIENTE DE EGRESO' && (
                    <label style={{ gridColumn: 'span 2' }}>CICLO LECTIVO: 
                      <input type="text" name="ciclo_lectivo_pendiente" value={formData.ciclo_lectivo_pendiente || ""} onChange={handleInputChange} placeholder="Ej: 2025" required style={{ width: '100%' }} />
                    </label>
                  )}
                </div>
              </div>

              {/* Datos Alumno */}
              <div style={{ gridColumn: '1 / -1', backgroundColor: '#fff0f5', padding: '10px', borderRadius: '5px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'purple' }}>DATOS DEL ALUMNO</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <label style={{ gridColumn: 'span 2' }}>APELLIDO:<input name="apellido" value={formData.apellido} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  <label style={{ gridColumn: 'span 2' }}>NOMBRE:<input name="nombre" value={formData.nombre} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  
                  <label>FECHA NAC:<input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  <label>EDAD:<input name="edad" value={formData.edad} readOnly style={{ width: '100%', backgroundColor: '#eee' }} /></label>
                  <label>SEXO:
                    <select name="sexo" value={formData.sexo} onChange={handleInputChange} style={{ width: '100%' }}>
                      <option value="">Seleccione</option>
                      <option value="MASCULINO">MASCULINO</option>
                      <option value="FEMENINO">FEMENINO</option>
                    </select>
                  </label>
                  <label>CELULAR:<input name="celular" value={formData.celular} onChange={handleInputChange} placeholder="---" style={{ width: '100%' }} /></label>

                  <label>PRE CUIL:<input name="pre_cuil" value={formData.pre_cuil} onChange={handleInputChange} placeholder="---" style={{ width: '100%' }} /></label>
                  <label>DNI:<input name="dni" value={formData.dni} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  <label>POS CUIL:<input name="pos_cuil" value={formData.pos_cuil} onChange={handleInputChange} placeholder="---" style={{ width: '100%' }} /></label>
                  <div></div>

                  <label style={{ gridColumn: 'span 2' }}>DOMICILIO:<input name="domicilio" value={formData.domicilio} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  <label>LOCALIDAD:<input name="localidad" value={formData.localidad} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  <label>DEPARTAMENTO:<input name="departamento" value={formData.departamento} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  <label>PROVINCIA:<input name="provincia" value={formData.provincia} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                  <label>LUGAR NAC.:<input name="lugar_nacimiento" value={formData.lugar_nacimiento} onChange={handleInputChange} style={{ width: '100%' }} /></label>
                </div>
              </div>

              {/* Salud */}
              <div style={{ gridColumn: '1 / -1', border: '1px solid #ccc', padding: '10px' }}>
                <label style={{ marginRight: '15px' }}><strong>DISCAPACIDAD:</strong> 
                  <select name="discapacidad" value={formData.discapacidad} onChange={handleInputChange} style={{ marginLeft: '5px' }}>
                    <option value="NO">NO</option>
                    <option value="SI">SI</option>
                  </select>
                </label>
                {formData.discapacidad === "SI" && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <label>CERT. MÉDICO: <select name="certificado_medico" value={formData.certificado_medico} onChange={handleInputChange}><option value="NO">NO</option><option value="SI">SI</option></select></label>
                    <label>DIAGNÓSTICO: <input name="diagnostico" value={formData.diagnostico} onChange={handleInputChange} /></label>
                    <label>DOC. INTEGRADOR: <select name="docente_integrador" value={formData.docente_integrador} onChange={handleInputChange}><option value="NO">NO</option><option value="SI">SI</option></select></label>
                  </div>
                )}
              </div>

              {/* Documentación */}
              <div style={{ gridColumn: '1 / -1', border: '1px solid #ccc', padding: '10px' }}>
                <strong>DOCUMENTACIÓN PRESENTADA:</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '5px' }}>
                  {documentacionList.map(doc => (
                    <label key={doc} style={{ fontSize: '12px' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.documentacion.includes(doc)} 
                        onChange={() => handleDocChange(doc)} 
                        style={{ marginRight: '5px' }}
                      />
                      {doc}
                    </label>
                  ))}
                </div>
              </div>

              {/* Tutores */}
              <div style={{ gridColumn: '1 / -1', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '5px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'green' }}>DATOS DEL PADRE / MADRE O TUTOR</h4>
                {formData.tutores.map((tutor, idx) => (
                  <div key={idx} style={{ marginBottom: '15px', borderBottom: '1px dashed #999', paddingBottom: '10px' }}>
                    <h5 style={{ margin: '0 0 5px 0' }}>Tutor {idx + 1}</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      <label>PARENTESCO:
                        <select value={tutor.parentesco} onChange={e => handleTutorChange(idx, 'parentesco', e.target.value)} style={{ width: '100%' }}>
                          <option value="">Seleccione</option>
                          {parentescosList.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </label>
                      {tutor.parentesco === "OTRO" && (
                        <label>OTRO PARENTESCO:<input value={tutor.parentesco_otro} onChange={e => handleTutorChange(idx, 'parentesco_otro', e.target.value)} style={{ width: '100%' }} /></label>
                      )}
                      
                      <label style={{ gridColumn: 'span 2' }}>APELLIDO:<input value={tutor.apellido} onChange={e => handleTutorChange(idx, 'apellido', e.target.value)} style={{ width: '100%' }} /></label>
                      <label style={{ gridColumn: 'span 2' }}>NOMBRE:<input value={tutor.nombre} onChange={e => handleTutorChange(idx, 'nombre', e.target.value)} style={{ width: '100%' }} /></label>
                      
                      <label>PRE CUIL:<input value={tutor.pre_cuil} onChange={e => handleTutorChange(idx, 'pre_cuil', e.target.value)} placeholder="---" style={{ width: '100%' }} /></label>
                      <label>DNI:<input value={tutor.dni} onChange={e => handleTutorChange(idx, 'dni', e.target.value)} style={{ width: '100%' }} /></label>
                      <label>POS CUIL:<input value={tutor.pos_cuil} onChange={e => handleTutorChange(idx, 'pos_cuil', e.target.value)} placeholder="---" style={{ width: '100%' }} /></label>
                      
                      <label>SEXO:<select value={tutor.sexo} onChange={e => handleTutorChange(idx, 'sexo', e.target.value)} style={{ width: '100%' }}><option value="">Seleccione</option><option value="FEMENINO">FEMENINO</option><option value="MASCULINO">MASCULINO</option></select></label>
                      
                      <label>FECHA NAC:<input type="date" value={tutor.fecha_nacimiento} onChange={e => handleTutorChange(idx, 'fecha_nacimiento', e.target.value)} style={{ width: '100%' }} /></label>
                      <label>EDAD:<input value={tutor.edad} readOnly style={{ width: '100%', backgroundColor: '#eee' }} /></label>
                      <label>CELULAR:<input value={tutor.celular} onChange={e => handleTutorChange(idx, 'celular', e.target.value)} placeholder="---" style={{ width: '100%' }} /></label>
                      
                      <label>OCUPACIÓN:
                        <select value={tutor.ocupacion} onChange={e => handleTutorChange(idx, 'ocupacion', e.target.value)} style={{ width: '100%' }}>
                          <option value="">Seleccione</option>
                          {ocupacionesList.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </label>
                      {tutor.ocupacion === "OTRO" && (
                         <label>OTRA OCUPACIÓN:<input value={tutor.ocupacion_otro} onChange={e => handleTutorChange(idx, 'ocupacion_otro', e.target.value)} style={{ width: '100%' }} /></label>
                      )}

                      <label style={{ gridColumn: 'span 2' }}>ESCOLARIDAD:
                        <select value={tutor.escolaridad} onChange={e => handleTutorChange(idx, 'escolaridad', e.target.value)} style={{ width: '100%' }}>
                          <option value="">Seleccione</option>
                          {escolaridadList.map(esc => <option key={esc} value={esc}>{esc}</option>)}
                        </select>
                      </label>

                      <label style={{ gridColumn: 'span 2' }}>ASIGNACIÓN:
                        <select value={tutor.asignacion} onChange={e => handleTutorChange(idx, 'asignacion', e.target.value)} style={{ width: '100%' }}>
                          <option value="">Seleccione</option>
                          {asignacionList.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </label>
                    </div>
                    {idx > 0 && <button type="button" onClick={() => removeTutor(idx)} style={{ marginTop: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Eliminar Tutor</button>}
                  </div>
                ))}
                <button type="button" onClick={addTutor} style={{ backgroundColor: '#28a745', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>+ Agregar Tutor</button>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                <button type="submit" style={{ padding: '10px 40px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>GUARDAR</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 40px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Vista Previa Impresión --- */}
      {showPrint && (
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#555', zIndex: 2000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div className="print-content" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="print-page">
              <div style={{ borderBottom: '2px solid black', marginBottom: '10px', paddingBottom: '5px', color: 'black', display: 'flex', alignItems: 'center' }}>
                 <img src={logo} alt="Logo" style={{ width: '60px', marginRight: '20px' }} />
                 <div>
                   <h1 style={{ fontSize: '18px', margin: 0, color: 'black' }}>Escuela Secundaria Gobernador Garmendia</h1>
                   <p style={{ fontSize: '12px', margin: 0 }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                   <p style={{ fontWeight: 'bold' }}>LISTADO DE ALUMNOS</p>
                 </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid black', padding: '5px' }}>CURSO/DIV</th>
                    <th style={{ border: '1px solid black', padding: '5px' }}>TURNO</th>
                    <th style={{ border: '1px solid black', padding: '5px' }}>APELLIDO Y NOMBRE</th>
                    <th style={{ border: '1px solid black', padding: '5px' }}>DNI</th>
                    <th style={{ border: '1px solid black', padding: '5px' }}>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlumnos.map((a, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{a.curso} "{a.division}"</td>
                      <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{a.turno}</td>
                      <td style={{ border: '1px solid black', padding: '5px' }}>{a.apellido}, {a.nombre}</td>
                      <td style={{ border: '1px solid black', padding: '5px' }}>{a.dni}</td>
                      <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{a.estado_alumno}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#333', padding: '15px', textAlign: 'center' }}>
            <button onClick={() => window.print()} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>GUARDAR COMO PDF</button>
            <button onClick={() => window.print()} style={{ backgroundColor: '#ffc107', color: 'black', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>IMPRIMIR</button>
            <button onClick={() => setShowPrint(false)} style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>CANCELAR</button>
          </div>
          <style>{`
            .print-page { width: 210mm; min-height: 297mm; padding: 10mm; background: white; margin: 0 auto; }
            @media print {
              .no-print { display: none !important; }
              body * { visibility: hidden; }
              .print-overlay, .print-overlay * { visibility: visible; }
              .print-overlay { position: absolute; top: 0; left: 0; width: 100%; height: auto; background: white; }
              .print-page { margin: 0; width: 100%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default PreceptoriaCargarDatos;
