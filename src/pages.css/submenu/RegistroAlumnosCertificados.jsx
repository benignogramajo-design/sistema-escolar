import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo REGISTRO ALUMNOS1.jpg";
import logo from "../../assets/logos/Logo.png"; // Logo general para tabla
// Nuevos logos para certificados
import logoMinisterio from "../../assets/logos/Logo MINISTERIO DE EDUCACION.png";
import logoEscuela from "../../assets/logos/Logo ESC. GDIA.png";
import { supabase } from "../../components.css/supabaseClient";

const RegistroAlumnosCertificados = ({ goBack, goHome }) => {
  // --- Estados de Datos ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de UI ---
  const [mode, setMode] = useState("view"); // 'view', 'create', 'edit', 'delete'
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // Para botón VER
  const [selectedId, setSelectedId] = useState(null);
  
  // Estados para Impresión
  const [printMode, setPrintMode] = useState(null); // 'table' | 'record'
  const [recordToPrint, setRecordToPrint] = useState(null);

  // --- Filtros ---
  const [filters, setFilters] = useState({
    alumno: "", // Apellido y Nombre
    dni_alumno: "",
    tutor: "", // Apellido y Nombre
    dni_tutor: "",
    constancia: "",
    curso: "",
    division: "",
    mes: "",
    anio: ""
  });

  // --- Formulario ---
  const initialFormState = {
    tipo_constancia: "",
    fecha_emision: "",
    fecha_inicio_ciclo: "",
    fecha_fin_ciclo: "",
    dni_alumno: "",
    apellido_alumno: "",
    nombre_alumno: "",
    fecha_nacimiento_alumno: "",
    lugar_nacimiento_alumno: "",
    curso: "",
    division: "",
    apellido_tutor: "",
    nombre_tutor: "",
    dni_tutor: "",
    presentado_ante: "",
    presentado_ante_otro: "",
    objetivo: "",
    objetivo_otro: "",
    nro_boleta: "__________"
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Listas Estáticas Actualizadas ---
  const constanciaOptions = [
    "CONSTANCIA DE ESCOLARIDAD",
    "INICIO CICLO LECTIVO",
    "FINALIZACIÓN CICLO LECTIVO"
  ];

  const autoridadesOptions = [
    "LAS AUTORIDADES QUE LO REQUIERA",
    "COMUNA RURAL DE GOBERNADOR GARMENDIA",
    "COMUNA RURAL DE PIEDRABUENA",
    "COMUNA RURAL DE 7 DE ABRIL",
    "MUNICIPALIDAD DE BURRUYACU",
    "MINISTERIO DE EDUCACIÓN",
    "DEPARTAMENTO DE POLICÍAS",
    "SIPROSA",
    "OTROS"
  ];

  const objetivoOptions = [
    "PERCIBIR ASIGNACIÓN FAMILIAR",
    "OTROS"
  ];

  const cursosOptions = ["1", "2", "3", "4", "5", "6"];
  const divisionesOptions = ["A", "B", "C", "D"];

  // --- Carga de Datos ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('registro_alumnos_certificados')
        .select('*')
        .order('fecha_emision', { ascending: false });

      if (error) throw error;
      setData(result || []);
    } catch (error) {
      alert("Error cargando datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Filtrado ---
  const getFilteredData = () => {
    return data.filter(item => {
      const alumnoFull = `${item.apellido_alumno || ''} ${item.nombre_alumno || ''}`.toLowerCase();
      const tutorFull = `${item.apellido_tutor || ''} ${item.nombre_tutor || ''}`.toLowerCase();
      
      const date = item.fecha_emision ? new Date(item.fecha_emision) : null;
      const itemMes = date ? (date.getMonth() + 1).toString() : "";
      const itemAnio = date ? date.getFullYear().toString() : "";

      return (
        (!filters.alumno || alumnoFull.includes(filters.alumno.toLowerCase())) &&
        (!filters.dni_alumno || (item.dni_alumno || "").includes(filters.dni_alumno)) &&
        (!filters.tutor || tutorFull.includes(filters.tutor.toLowerCase())) &&
        (!filters.dni_tutor || (item.dni_tutor || "").includes(filters.dni_tutor)) &&
        (!filters.constancia || item.tipo_constancia === filters.constancia) &&
        (!filters.curso || item.curso === filters.curso) &&
        (!filters.division || item.division === filters.division) &&
        (!filters.mes || itemMes === filters.mes) &&
        (!filters.anio || itemAnio === filters.anio)
      );
    });
  };

  const filteredData = getFilteredData();

  // --- Obtener opciones únicas para filtros basadas en datos ---
  const getUniqueOptions = (field) => {
    if (field === "alumno") return [...new Set(data.map(i => `${i.apellido_alumno} ${i.nombre_alumno}`))].sort();
    if (field === "tutor") return [...new Set(data.map(i => `${i.apellido_tutor} ${i.nombre_tutor}`))].sort();
    return [...new Set(data.map(i => i[field]).filter(Boolean))].sort();
  };

  // --- Manejadores ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setMode("create");
    setFormData(initialFormState);
    setShowForm(true);
    setSelectedId(null);
  };

  const handleModify = () => {
    setMode("edit");
    setSelectedId(null); // Reset selection to force user to click
  };

  const handleDeleteMode = () => {
    setMode("delete");
    setSelectedId(null);
  };

  const handleRowClick = (item) => {
    if (mode === "edit") {
      setFormData(item);
      setSelectedId(item.id);
      setShowForm(true);
    } else if (mode === "delete") {
      if (window.confirm("¿Está seguro de eliminar este registro?")) {
        deleteRecord(item.id);
      }
    }
  };

  const deleteRecord = async (id) => {
    try {
      const { error } = await supabase.from('registro_alumnos_certificados').delete().eq('id', id);
      if (error) throw error;
      fetchData();
      setMode("view");
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Manejar el valor por defecto de nro_boleta si está vacío
      const payload = { ...formData };
      if (!payload.nro_boleta) payload.nro_boleta = "__________";

      if (mode === "create") {
        const { error } = await supabase.from('registro_alumnos_certificados').insert([payload]);
        if (error) throw error;
      } else if (mode === "edit" && selectedId) {
        const { error } = await supabase.from('registro_alumnos_certificados').update(payload).eq('id', selectedId);
        if (error) throw error;
      }
      
      fetchData();
      setShowForm(false);
      setMode("view");
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const openDetailModal = (item) => {
    setFormData(item);
    setShowDetailModal(true);
  };

  const openPrintRecord = (item) => {
    setRecordToPrint(item);
    setPrintMode("record");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Helper para obtener partes de fecha en texto para los certificados
  const getFechaParts = (dateString) => {
    if (!dateString) return { dia: "...", mes: "...", anio: "..." };
    const [year, month, day] = dateString.split('-');
    const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    return {
        dia: day,
        mes: meses[parseInt(month) - 1],
        anio: year
    };
  };

  // --- Renderizado de Vistas de Impresión ---
  const renderPrintHeader = () => {
    // Header por defecto para listado
    return (
      <div className="print-header" style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
        <img src={logo} alt="Logo" style={{ width: '80px', marginRight: '20px' }} />
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '18px', margin: 0, color: 'black' }}>Escuela Secundaria Gobernador Garmendia</h1>
          <p style={{ fontSize: '12px', margin: '2px 0', color: 'black' }}>CUE: 9001717/00 - Av. de la Soja S/N°</p>
          <p style={{ fontSize: '12px', margin: '2px 0', color: 'black' }}>Gobernador Garmendia - Burruyacu - Tucumán</p>
        </div>
      </div>
    );
  };

  const renderPrintOverlay = () => {
    if (!printMode) return null;

    return (
      <div className="print-overlay">
        <div className="print-content">
          <div className={`print-page ${printMode === 'record' ? 'print-record' : ''}`}>
            
            {/* VISTA PREVIA LISTADO (TABLA) */}
            {printMode === "table" && (
              <>
                {renderPrintHeader()}
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>LISTADO DE CERTIFICADOS</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                      <th style={{ border: "1px solid black", padding: "5px" }}>CONSTANCIA</th>
                      <th style={{ border: "1px solid black", padding: "5px" }}>EMISIÓN</th>
                      <th style={{ border: "1px solid black", padding: "5px" }}>DNI ALUMNO</th>
                      <th style={{ border: "1px solid black", padding: "5px" }}>ALUMNO</th>
                      <th style={{ border: "1px solid black", padding: "5px" }}>FEC. NAC.</th>
                      <th style={{ border: "1px solid black", padding: "5px" }}>CURSO/DIV</th>
                      <th style={{ border: "1px solid black", padding: "5px" }}>TUTOR</th>
                      <th style={{ border: "1px solid black", padding: "5px" }}>DNI TUTOR</th>
                      <th style={{ border: "1px solid black", padding: "5px" }}>PRESENTADO EN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <td style={{ border: "1px solid black", padding: "5px" }}>{item.tipo_constancia}</td>
                        <td style={{ border: "1px solid black", padding: "5px" }}>{formatDate(item.fecha_emision)}</td>
                        <td style={{ border: "1px solid black", padding: "5px" }}>{item.dni_alumno}</td>
                        <td style={{ border: "1px solid black", padding: "5px" }}>{item.apellido_alumno} {item.nombre_alumno}</td>
                        <td style={{ border: "1px solid black", padding: "5px" }}>{formatDate(item.fecha_nacimiento_alumno)}</td>
                        <td style={{ border: "1px solid black", padding: "5px" }}>{item.curso} "{item.division}"</td>
                        <td style={{ border: "1px solid black", padding: "5px" }}>{item.apellido_tutor} {item.nombre_tutor}</td>
                        <td style={{ border: "1px solid black", padding: "5px" }}>{item.dni_tutor}</td>
                        <td style={{ border: "1px solid black", padding: "5px" }}>
                          {item.presentado_ante === "OTROS" ? item.presentado_ante_otro : item.presentado_ante}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* VISTA PREVIA CERTIFICADO INDIVIDUAL */}
            {printMode === "record" && recordToPrint && (
              <div style={{ fontFamily: 'Arial', color: 'black', height: '100%', position: 'relative' }}>
                {/* Header Logos */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <img src={logoMinisterio} alt="Ministerio" style={{ width: '6cm', height: '3cm', objectFit: 'contain' }} />
                    <img src={logoEscuela} alt="Escuela" style={{ width: '8cm', height: '2.5cm', objectFit: 'contain' }} />
                </div>

                {/* Titulo */}
                <h1 style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', margin: '20px 0', textTransform: 'uppercase', color: 'black' }}>
                    {recordToPrint.tipo_constancia}
                </h1>

                {/* Cuerpo del Certificado */}
                <div style={{ fontSize: '12pt', textAlign: 'justify', lineHeight: '1.15' }}>
                    {(() => {
                        // Preparar variables comunes
                        const alumno = `${recordToPrint.apellido_alumno} ${recordToPrint.nombre_alumno}`.toUpperCase();
                        const lugarNac = (recordToPrint.lugar_nacimiento_alumno || "").toUpperCase();
                        const nacParts = getFechaParts(recordToPrint.fecha_nacimiento_alumno);
                        const emiParts = getFechaParts(recordToPrint.fecha_emision);
                        const iniParts = getFechaParts(recordToPrint.fecha_inicio_ciclo);
                        const finParts = getFechaParts(recordToPrint.fecha_fin_ciclo);
                        
                        const tutor = `${recordToPrint.apellido_tutor} ${recordToPrint.nombre_tutor}`.toUpperCase();
                        const presentado = recordToPrint.presentado_ante === "OTROS" ? recordToPrint.presentado_ante_otro : recordToPrint.presentado_ante;
                        const objetivo = recordToPrint.objetivo === "OTROS" ? recordToPrint.objetivo_otro : recordToPrint.objetivo;

                        // Lógica por tipo
                        if (recordToPrint.tipo_constancia === "CONSTANCIA DE ESCOLARIDAD") {
                            return (
                                <>
                                    <p style={{marginBottom: '1.2em', textIndent: '1.5cm'}}>
                                        La Dirección de la ESCUELA SECUNDARIA GOBERNADOR GARMENDIA, CUE N° 9001717/00, hace constar que {alumno}, Nacido/a en {lugarNac}, el día {nacParts.dia} del mes de {nacParts.mes} del año {nacParts.anio}, con tipo y Nº de documento, DNI N° {recordToPrint.dni_alumno}, es alumno/a de la institución en {recordToPrint.curso}° año – Nivel Secundario durante este ciclo lectivo.
                                    </p>
                                    <p style={{textIndent: '1.5cm'}}>
                                        GOBERNADOR GARMENDIA, TUCUMAN, {emiParts.dia} del mes de {emiParts.mes} del año {emiParts.anio}.
                                    </p>
                                </>
                            );
                        } else if (recordToPrint.tipo_constancia === "INICIO CICLO LECTIVO") {
                            return (
                                <>
                                    <p style={{marginBottom: '1.2em', textIndent: '1.5cm'}}>
                                        La Dirección de la ESCUELA SECUNDARIA GOBERNADOR GARMENDIA, CUE N° 9001717/00, certifica que el/la alumno/a {alumno}, DNI Nº {recordToPrint.dni_alumno}, ha iniciado el {iniParts.dia} del mes de {iniParts.mes} del año {iniParts.anio} el {recordToPrint.curso}° AÑO como alumno/a regular el ciclo lectivo correspondiente al año {iniParts.anio} en Nivel SECUNDARIO, en este Establecimiento Educativo.
                                    </p>
                                    <p style={{marginBottom: '1.2em', textIndent: '1.5cm'}}>
                                        Este Certificado se extiende en Garmendia - Burruyacú a los {emiParts.dia} del mes de {emiParts.mes} del año {emiParts.anio}.para ser presentado por el/la Sr/a. {tutor} DNI Nº {recordToPrint.dni_tutor} ante {presentado} con el objetivo de {objetivo}.
                                    </p>
                                    <p style={{textIndent: '1.5cm'}}>
                                        Nº de Boleta del Beneficiario: {recordToPrint.nro_boleta}.
                                    </p>
                                </>
                            );
                        } else if (recordToPrint.tipo_constancia === "FINALIZACIÓN CICLO LECTIVO") {
                            return (
                                <>
                                    <p style={{marginBottom: '1.2em', textIndent: '1.5cm'}}>
                                        La Dirección de la ESCUELA SECUNDARIA GOBERNADOR GARMENDIA, CUE N° 9001717/00, certifica que el/la alumno/a {alumno}, DNI Nº {recordToPrint.dni_alumno}, ha finalizado el {finParts.dia} del mes de {finParts.mes} del año {finParts.anio} el {recordToPrint.curso}° AÑO el ciclo lectivo correspondiente al año {finParts.anio} en Nivel SECUNDARIO, en este Establecimiento Educativo.
                                    </p>
                                    <p style={{marginBottom: '1.2em', textIndent: '1.5cm'}}>
                                        Este Certificado se extiende en Garmendia - Burruyacú a los {emiParts.dia} del mes de {emiParts.mes} del año {emiParts.anio}.para ser presentado por el/la Sr/a. {tutor} DNI Nº {recordToPrint.dni_tutor} ante {presentado} con el objetivo de {objetivo}.
                                    </p>
                                    <p style={{textIndent: '1.5cm'}}>
                                        Nº de Boleta del Beneficiario: {recordToPrint.nro_boleta}.
                                    </p>
                                </>
                            );
                        }
                    })()}
                </div>

                {/* Footer Firmas */}
                <div style={{ marginTop: '4cm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ width: '5cm', textAlign: 'center' }}>
                        <div style={{ borderTop: '1px dotted black', marginBottom: '5px' }}></div>
                        <p style={{ fontSize: '10pt', margin: 0, fontWeight: 'normal', color: 'black' }}>SELLO DEL ESTABLECIMIENTO</p>
                    </div>
                    <div style={{ width: '7cm', textAlign: 'center' }}>
                        <div style={{ borderTop: '1px dotted black', marginBottom: '5px' }}></div>
                        <p style={{ fontSize: '10pt', margin: 0, fontWeight: 'normal', color: 'black' }}>FIRMA Y SELLO DEL DIRECTOR/A o RESPONSABLE</p>
                    </div>
                </div>

              </div>
            )}

            <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#333', padding: '15px', textAlign: 'center' }}>
                <button onClick={() => window.print()} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>GUARDAR COMO PDF</button>
                <button onClick={() => window.print()} style={{ backgroundColor: '#ffc107', color: 'black', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>IMPRIMIR</button>
                <button onClick={() => { setPrintMode(null); setRecordToPrint(null); }} style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', margin: '0 10px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>CANCELAR</button>
            </div>
          </div>
        </div>
        <style>{`
          .print-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 2000; overflow-y: auto; display: flex; flex-direction: column; }
          .print-content { flex: 1; padding: 20px; display: flex; flex-direction: column; alignItems: center; }
          .print-page { width: 210mm; min-height: 297mm; padding: 1.5cm; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.3); box-sizing: border-box; }
          @media print {
            .no-print { display: none !important; }
            .print-overlay { position: absolute; z-index: 9999; background-color: white !important; }
            .print-page { box-shadow: none; margin: 0; width: 100%; padding: 0; }
            @page { size: A4; margin: 1.27cm; }
            body { background: white; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>CERTIFICADOS</h2>

      {/* --- Filtros --- */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        <select name="alumno" value={filters.alumno} onChange={(e) => setFilters({...filters, alumno: e.target.value})} style={{ padding: '5px' }}>
            <option value="">APELLIDO Y NOMBRE DEL ALUMNO</option>
            {getUniqueOptions("alumno").map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <select name="dni_alumno" value={filters.dni_alumno} onChange={(e) => setFilters({...filters, dni_alumno: e.target.value})} style={{ padding: '5px' }}>
            <option value="">DNI DEL ALUMNO</option>
            {getUniqueOptions("dni_alumno").map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <select name="tutor" value={filters.tutor} onChange={(e) => setFilters({...filters, tutor: e.target.value})} style={{ padding: '5px' }}>
            <option value="">APELLIDO Y NOMBRE DEL TUTOR</option>
            {getUniqueOptions("tutor").map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <select name="dni_tutor" value={filters.dni_tutor} onChange={(e) => setFilters({...filters, dni_tutor: e.target.value})} style={{ padding: '5px' }}>
            <option value="">DNI DEL TUTOR</option>
            {getUniqueOptions("dni_tutor").map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <select name="constancia" value={filters.constancia} onChange={(e) => setFilters({...filters, constancia: e.target.value})} style={{ padding: '5px' }}>
            <option value="">CONSTANCIA</option>
            {getUniqueOptions("tipo_constancia").map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <select name="curso" value={filters.curso} onChange={(e) => setFilters({...filters, curso: e.target.value})} style={{ padding: '5px' }}>
            <option value="">CURSO</option>
            {cursosOptions.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <select name="division" value={filters.division} onChange={(e) => setFilters({...filters, division: e.target.value})} style={{ padding: '5px' }}>
            <option value="">DIVISIÓN</option>
            {divisionesOptions.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <select name="mes" value={filters.mes} onChange={(e) => setFilters({...filters, mes: e.target.value})} style={{ padding: '5px' }}>
            <option value="">MES</option>
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </select>
        <input type="text" placeholder="AÑO" value={filters.anio} onChange={(e) => setFilters({...filters, anio: e.target.value})} style={{ padding: '5px', width: '60px' }} />
      </div>

      {/* --- Botones de Acción --- */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
        <button onClick={handleNew} style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>NUEVO</button>
        <button onClick={handleModify} style={{ backgroundColor: 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>MODIFICAR</button>
        <button onClick={handleDeleteMode} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>ELIMINAR</button>
        <button onClick={() => setPrintMode("table")} style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>IMPRIMIR</button>
      </div>

      {/* --- Mensajes de Modo --- */}
      {mode === 'edit' && <div style={{ backgroundColor: '#e6fffa', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid green', borderRadius: '5px', color: 'black' }}>Seleccione un registro de la lista para modificarlo.</div>}
      {mode === 'delete' && <div style={{ backgroundColor: '#fff5f5', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid red', borderRadius: '5px', color: 'black' }}>Seleccione un registro de la lista para eliminarlo.</div>}

      {/* --- Tabla --- */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
        {loading ? <p style={{color: 'white', textAlign: 'center'}}>Cargando...</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.95)", fontSize: '11px' }}>
                <thead>
                    <tr style={{ backgroundColor: "#333", color: "white" }}>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>CONSTANCIA</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>FECHA DE EMISIÓN DE CONSTANCIA</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>DNI DEL ALUMNO</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>APELLIDO y nombre DEL ALUMNO</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>FECHA DE NACIMIENTO DEL ALUMNO</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>CURSO y división</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>APELLIDO y nombre DEL TUTOR</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>DNI DEL TUTOR</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>PARA SE PRESENTADO EN</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>VISTA</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 ? filteredData.map(item => (
                        <tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: (mode === 'edit' || mode === 'delete') ? 'pointer' : 'default', backgroundColor: (mode === 'edit' || mode === 'delete') ? '#f0f8ff' : 'transparent' }}>
                            <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.tipo_constancia}</td>
                            <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>{formatDate(item.fecha_emision)}</td>
                            <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.dni_alumno}</td>
                            <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.apellido_alumno} {item.nombre_alumno}</td>
                            <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>{formatDate(item.fecha_nacimiento_alumno)}</td>
                            <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>{item.curso} "{item.division}"</td>
                            <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.apellido_tutor} {item.nombre_tutor}</td>
                            <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.dni_tutor}</td>
                            <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                {item.presentado_ante === "OTROS" ? item.presentado_ante_otro : item.presentado_ante}
                            </td>
                            <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: 'center' }}>
                                <button onClick={(e) => { e.stopPropagation(); openDetailModal(item); }} style={{ backgroundColor: '#87CEEB', color: 'black', border: 'none', padding: '3px 8px', marginRight: '5px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>VER</button>
                                <button onClick={(e) => { e.stopPropagation(); openPrintRecord(item); }} style={{ backgroundColor: 'yellow', color: 'black', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>IMPRIMIR</button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="10" style={{ padding: "15px", textAlign: "center" }}>No se encontraron registros.</td></tr>
                    )}
                </tbody>
            </table>
        )}
      </div>

      {/* --- Modal Formulario --- */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{mode === 'create' ? 'Nueva Constancia' : 'Modificar Constancia'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    
                    <label style={{ gridColumn: '1 / -1' }}>CONSTANCIA:
                        <select name="tipo_constancia" value={formData.tipo_constancia} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}>
                            <option value="">Seleccione...</option>
                            {constanciaOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </label>

                    <label>FECHA DE EMISIÓN DE CONSTANCIA: <input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
                    <label>FECHA DE INICIO DE CICLO LECTIVO: <input type="date" name="fecha_inicio_ciclo" value={formData.fecha_inicio_ciclo} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
                    <label>FECHA DE FINALIZACIÓN DE CICLO LECTIVO: <input type="date" name="fecha_fin_ciclo" value={formData.fecha_fin_ciclo} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>

                    <h4 style={{ gridColumn: '1 / -1', margin: '0', borderBottom: '1px solid #eee' }}>Datos del Alumno</h4>
                    <label>DNI DEL ALUMNO: <input name="dni_alumno" value={formData.dni_alumno} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
                    <label>APELLIDO DEL ALUMNO: <input name="apellido_alumno" value={formData.apellido_alumno} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
                    <label>NOMBRE DEL ALUMNO: <input name="nombre_alumno" value={formData.nombre_alumno} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
                    <label>FECHA DE NACIMIENTO DEL ALUMNO: <input type="date" name="fecha_nacimiento_alumno" value={formData.fecha_nacimiento_alumno} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
                    <label style={{ gridColumn: '1 / -1' }}>LUGAR DE NACIMIENTO DEL ALUMNO: <input name="lugar_nacimiento_alumno" value={formData.lugar_nacimiento_alumno} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
                    
                    <label>CURSO: 
                        <select name="curso" value={formData.curso} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}>
                            <option value="">Seleccione...</option>
                            {cursosOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </label>
                    <label>DIVISIÓN: 
                        <select name="division" value={formData.division} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}>
                            <option value="">Seleccione...</option>
                            {divisionesOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </label>

                    <h4 style={{ gridColumn: '1 / -1', margin: '0', borderBottom: '1px solid #eee' }}>Datos del Tutor</h4>
                    <label>APELLIDO DEL TUTOR: <input name="apellido_tutor" value={formData.apellido_tutor} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
                    <label>NOMBRE DEL TUTOR: <input name="nombre_tutor" value={formData.nombre_tutor} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
                    <label>DNI DEL TUTOR: <input name="dni_tutor" value={formData.dni_tutor} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>

                    <h4 style={{ gridColumn: '1 / -1', margin: '0', borderBottom: '1px solid #eee' }}>Otros Datos</h4>
                    <label style={{ gridColumn: '1 / -1' }}>PARA SER PRESENTADO EN:
                        <select name="presentado_ante" value={formData.presentado_ante} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}>
                            <option value="">Seleccione...</option>
                            {autoridadesOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        {formData.presentado_ante === "OTROS" && (
                            <input name="presentado_ante_otro" placeholder="Especifique donde será presentado" value={formData.presentado_ante_otro} onChange={handleInputChange} style={{ width: '100%', padding: '5px', marginTop: '5px' }} />
                        )}
                    </label>

                    <label style={{ gridColumn: '1 / -1' }}>OBJETIVO:
                        <select name="objetivo" value={formData.objetivo} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}>
                            <option value="">Seleccione...</option>
                            {objetivoOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        {formData.objetivo === "OTROS" && (
                            <input name="objetivo_otro" placeholder="Especifique objetivo" value={formData.objetivo_otro} onChange={handleInputChange} style={{ width: '100%', padding: '5px', marginTop: '5px' }} />
                        )}
                    </label>

                    <label style={{ gridColumn: '1 / -1' }}>BOLETA DEL BENEFICIARIO:
                        <input name="nro_boleta" value={formData.nro_boleta} onChange={handleInputChange} placeholder="__________" style={{ width: '100%', padding: '5px' }} />
                    </label>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Guardar</button>
                        <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- Modal Ver Detalle (Solo Lectura) --- */}
      {showDetailModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                <h3 style={{ textAlign: 'center' }}>Detalle de Constancia</h3>
                <div style={{ lineHeight: '1.8' }}>
                    <p><strong>Constancia:</strong> {formData.tipo_constancia}</p>
                    <p><strong>Fecha Emisión:</strong> {formatDate(formData.fecha_emision)}</p>
                    <p><strong>Alumno:</strong> {formData.apellido_alumno}, {formData.nombre_alumno} (DNI: {formData.dni_alumno})</p>
                    <p><strong>Nacimiento:</strong> {formatDate(formData.fecha_nacimiento_alumno)} en {formData.lugar_nacimiento_alumno}</p>
                    <p><strong>Curso:</strong> {formData.curso} "{formData.division}"</p>
                    <p><strong>Tutor:</strong> {formData.apellido_tutor}, {formData.nombre_tutor} (DNI: {formData.dni_tutor})</p>
                    <p><strong>Ciclo Lectivo:</strong> {formatDate(formData.fecha_inicio_ciclo)} al {formatDate(formData.fecha_fin_ciclo)}</p>
                    <p><strong>Presentado ante:</strong> {formData.presentado_ante === "OTROS" ? formData.presentado_ante_otro : formData.presentado_ante}</p>
                    <p><strong>Objetivo:</strong> {formData.objetivo === "OTROS" ? formData.objetivo_otro : formData.objetivo}</p>
                    <p><strong>Boleta:</strong> {formData.nro_boleta}</p>
                </div>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => setShowDetailModal(false)} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cerrar</button>
                </div>
            </div>
        </div>
      )}

      {/* --- Overlays de Impresión --- */}
      {renderPrintOverlay()}

    </div>
  );
};

export default RegistroAlumnosCertificados;
