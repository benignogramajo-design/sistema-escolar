import React, { useState, useEffect, useCallback } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets/logos/Logo.png";

const Licencias = ({ goBack, goHome, user }) => {
  // --- Estados de Datos ---
  const [licencias, setLicencias] = useState([]);
  const [docentes, setDocentes] = useState([]);

  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("view"); // 'view', 'create', 'edit', 'delete'
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // --- Estado del Formulario ---
  const initialFormState = {
    docente_id: "",
    dni: "",
    tipo_de_licencia: "",
    inicio_de_licencia: "",
    cantidad_dias: "",
    finalizacion_de_licencia: "",
    fecha_envio_mail: "",
    fecha_presentacion_documentacion: "",
    fecha_carga_sime: "",
    documentacion_adjuntada: [],
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Estado de Filtros ---
  const [filters, setFilters] = useState({
    apellido_nombre: "",
    tipo_de_licencia: "",
    fecha: "",
    mes: "",
    anio: "",
  });

  const docAdjuntadaOptions = [
    "FORMULARIO DE LICENCIA", "CERTIFICADO DE SESOP", "CERTIFICADO MÉDICO",
    "ALTA MÉDICA", "CÓDIGO DE SESOP"
  ];

  // --- Carga de Datos ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: licenciasData, error: licenciasError },
        { data: docentesData, error: docentesError },
      ] = await Promise.all([
        supabase.from('licencias').select('*').order('inicio_de_licencia', { ascending: false }),
        supabase.from('datos_de_legajo_docentes').select('id, apellido, nombre, dni').order('apellido'),
      ]);

      if (licenciasError) throw licenciasError;
      if (docentesError) throw docentesError;

      setLicencias(licenciasData || []);
      setDocentes(docentesData || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Lógica del Formulario ---
  useEffect(() => {
    if (formData.docente_id) {
      const selectedDocente = docentes.find(d => d.id === parseInt(formData.docente_id));
      if (selectedDocente) {
        setFormData(prev => ({ ...prev, dni: selectedDocente.dni }));
      }
    }
  }, [formData.docente_id, docentes]);

  useEffect(() => {
    if (formData.inicio_de_licencia && formData.cantidad_dias > 0) {
      // Se crea la fecha en la zona horaria local para evitar errores de un día por UTC.
      const startDate = new Date(formData.inicio_de_licencia + 'T00:00:00');
      // Se suma la cantidad de días y se resta 1 según el requerimiento.
      startDate.setDate(startDate.getDate() + parseInt(formData.cantidad_dias) - 1);
      setFormData(prev => ({ ...prev, finalizacion_de_licencia: startDate.toISOString().split('T')[0] }));
    } else {
      setFormData(prev => ({ ...prev, finalizacion_de_licencia: "" }));
    }
  }, [formData.inicio_de_licencia, formData.cantidad_dias]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const newDocs = checked
        ? [...prev.documentacion_adjuntada, value]
        : prev.documentacion_adjuntada.filter(doc => doc !== value);
      return { ...prev, documentacion_adjuntada: newDocs };
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setMode('create');
    setSelectedId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setMode('edit');
    setSelectedId(item.id);
    setFormData({
      docente_id: item.docente_id || "",
      dni: item.dni || "",
      tipo_de_licencia: item.tipo_de_licencia || "",
      inicio_de_licencia: item.inicio_de_licencia || "",
      cantidad_dias: item.cantidad_dias || "",
      finalizacion_de_licencia: item.finalizacion_de_licencia || "",
      fecha_envio_mail: item.fecha_envio_mail || "",
      fecha_presentacion_documentacion: item.fecha_presentacion_documentacion || "",
      fecha_carga_sime: item.fecha_carga_sime || "",
      documentacion_adjuntada: Array.isArray(item.documentacion_adjuntada) ? item.documentacion_adjuntada : [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      try {
        const { error } = await supabase.from('licencias').delete().eq('id', id);
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
    const selectedDocente = docentes.find(d => d.id === parseInt(formData.docente_id));
    if (!selectedDocente) {
      alert("Por favor, seleccione un docente válido.");
      return;
    }

    const payload = {
      ...formData,
      apellido_nombre: `${selectedDocente.apellido}, ${selectedDocente.nombre}`,
      tipo_de_licencia: formData.tipo_de_licencia || "---",
      inicio_de_licencia: formData.inicio_de_licencia || null,
      cantidad_dias: formData.cantidad_dias || null,
      finalizacion_de_licencia: formData.finalizacion_de_licencia || null,
      fecha_envio_mail: formData.fecha_envio_mail || null,
      fecha_presentacion_documentacion: formData.fecha_presentacion_documentacion || null,
      fecha_carga_sime: formData.fecha_carga_sime || null,
    };

    try {
      let error;
      if (mode === 'edit') {
        ({ error } = await supabase.from('licencias').update(payload).eq('id', selectedId));
      } else {
        ({ error } = await supabase.from('licencias').insert([payload]));
      }
      if (error) throw error;

      await fetchData();
      setShowModal(false);
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

  const handlePrint = () => {
    const fullLogoUrl = new URL(logo, window.location.href).href;
    
    const rowsHtml = filteredData.map(item => `
      <tr>
        <td>${item.apellido_nombre || ''}</td>
        <td>${item.dni || ''}</td>
        <td>${item.tipo_de_licencia || ''}</td>
        <td>${formatDate(item.inicio_de_licencia)}</td>
        <td>${item.cantidad_dias || ''}</td>
        <td>${formatDate(item.finalizacion_de_licencia)}</td>
        <td>${formatDate(item.fecha_envio_mail)}</td>
        <td>${formatDate(item.fecha_presentacion_documentacion)}</td>
        <td>${formatDate(item.fecha_carga_sime)}</td>
        <td>${Array.isArray(item.documentacion_adjuntada) ? item.documentacion_adjuntada.join(', ') : ''}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vista Previa - Licencias</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px; }
          th, td { border: 1px solid #000; padding: 4px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header-container { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; color: black; }
          .logo { width: 60px; height: auto; margin-right: 20px; }
          .school-info h1 { font-size: 16px; margin: 0; }
          .school-info p { font-size: 12px; margin: 2px 0; }
          @media print {
            .no-print { display: none !important; }
            thead { display: table-header-group; } 
            tr { page-break-inside: avoid; }
            @page { size: A4 landscape; margin: 15mm; }
          }
          .preview-controls { position: fixed; bottom: 0; left: 0; width: 100%; background: #333; padding: 15px; text-align: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.3); }
          .btn { padding: 10px 20px; margin: 0 10px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th colspan="10" style="border: none; background: none; text-align: left; padding: 0 0 10px 0;">
                <div class="header-container">
                  <img src="${fullLogoUrl}" class="logo" alt="Logo" />
                  <div class="school-info">
                    <h1>Escuela Secundaria Gobernador Garmendia</h1>
                    <p>CUE: 9001717/00 - Av. de la Soja S/N° - Gobernador Garmendia - Burruyacu</p>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th>APELLIDO Y NOMBRE</th><th>DNI</th><th>TIPO DE LICENCIA</th><th>INICIO</th><th>DÍAS</th><th>FIN</th>
              <th>ENVÍO MAIL</th><th>PRES. DOC.</th><th>CARGA SIME</th><th>DOC. ADJ.</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="preview-controls no-print">
          <button class="btn" style="background-color: #fff; color: #333;" onclick="window.print()">GUARDAR COMO PDF</button>
          <button class="btn" style="background-color: yellow; color: black;" onclick="window.print()">IMPRIMIR</button>
          <button class="btn" style="background-color: red; color: white;" onclick="window.close()">CANCELAR</button>
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

  // --- Filtrado y Helpers ---
  const filteredData = licencias.filter(item => {
    const itemDate = item.inicio_de_licencia ? new Date(item.inicio_de_licencia + 'T00:00:00') : null;
    const itemMes = itemDate ? (itemDate.getMonth() + 1).toString() : "";
    const itemAnio = itemDate ? itemDate.getFullYear().toString() : "";

    return (
      (!filters.apellido_nombre || (item.apellido_nombre || "").toLowerCase().includes(filters.apellido_nombre.toLowerCase())) &&
      (!filters.tipo_de_licencia || (item.tipo_de_licencia || "").toLowerCase().includes(filters.tipo_de_licencia.toLowerCase())) &&
      (!filters.fecha || item.inicio_de_licencia === filters.fecha) &&
      (!filters.mes || itemMes === filters.mes) &&
      (!filters.anio || itemAnio.includes(filters.anio))
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-AR');
  };

  if (loading) return <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}><NavBar goBack={goBack} goHome={goHome} /><p>Cargando...</p></div>;
  if (error) return <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}><NavBar goBack={goBack} goHome={goHome} /><p>Error: {error}</p></div>;

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>LICENCIAS</h2>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        <input type="text" name="apellido_nombre" placeholder="Apellido y Nombre" value={filters.apellido_nombre} onChange={handleFilterChange} style={{ padding: '5px' }} />
        <input type="text" name="tipo_de_licencia" placeholder="Tipo de Licencia" value={filters.tipo_de_licencia} onChange={handleFilterChange} style={{ padding: '5px' }} />
        <input type="date" name="fecha" value={filters.fecha} onChange={handleFilterChange} style={{ padding: '5px' }} />
        <select name="mes" value={filters.mes} onChange={handleFilterChange} style={{ padding: '5px' }}><option value="">Mes</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select>
        <input type="number" name="anio" placeholder="Año" value={filters.anio} onChange={handleFilterChange} style={{ padding: '5px', width: '80px' }} />
      </div>

      {/* Botones de Acción */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
        <button onClick={handleNew} style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>NUEVO</button>
        <button onClick={() => setMode(prev => prev === 'edit' ? 'view' : 'edit')} style={{ backgroundColor: 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>MODIFICAR</button>
        <button onClick={() => setMode(prev => prev === 'delete' ? 'view' : 'delete')} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>ELIMINAR</button>
        <button onClick={handlePrint} style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>IMPRIMIR</button>
      </div>

      {/* Formulario Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ textAlign: 'center' }}>{mode === 'create' ? 'Nueva Licencia' : 'Modificar Licencia'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <label style={{ gridColumn: '1 / 2' }}>Apellido y Nombre:
                <select name="docente_id" value={formData.docente_id} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }}>
                  <option value="">Seleccione...</option>
                  {docentes.map(d => <option key={d.id} value={d.id}>{d.apellido}, {d.nombre}</option>)}
                </select>
              </label>
              <label style={{ gridColumn: '2 / 3' }}>DNI: <input name="dni" value={formData.dni} readOnly style={{ width: '100%', padding: '8px', backgroundColor: '#eee' }} /></label>
              <label>Tipo de Licencia: <input name="tipo_de_licencia" value={formData.tipo_de_licencia} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} /></label>
              <label>Inicio de Licencia: <input type="date" name="inicio_de_licencia" value={formData.inicio_de_licencia} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} /></label>
              <label>Cantidad de Días: <input type="number" name="cantidad_dias" value={formData.cantidad_dias} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} /></label>
              <label>Finalización de Licencia: <input name="finalizacion_de_licencia" value={formData.finalizacion_de_licencia} readOnly style={{ width: '100%', padding: '8px', backgroundColor: '#eee' }} /></label>
              <label>Fecha de Envío al Mail: <input type="date" name="fecha_envio_mail" value={formData.fecha_envio_mail} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} /></label>
              <label>Fecha de Presentación de Doc.: <input type="date" name="fecha_presentacion_documentacion" value={formData.fecha_presentacion_documentacion} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} /></label>
              <label style={{ gridColumn: '1 / -1' }}>Fecha de Carga de SIME: <input type="date" name="fecha_carga_sime" value={formData.fecha_carga_sime} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} /></label>
              
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <h4>Documentación Adjuntada</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {docAdjuntadaOptions.map(opt => (
                    <label key={opt}><input type="checkbox" value={opt} checked={formData.documentacion_adjuntada.includes(opt)} onChange={handleCheckboxChange} /> {opt}</label>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ padding: '10px 20px' }}>Guardar</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla Principal */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
        {mode === 'edit' && <div style={{ backgroundColor: '#e6fffa', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid green', borderRadius: '5px' }}>Seleccione un registro para modificar.</div>}
        {mode === 'delete' && <div style={{ backgroundColor: '#fff5f5', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid red', borderRadius: '5px' }}>Seleccione un registro para eliminar.</div>}
        
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '11px' }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th>APELLIDO Y NOMBRE</th><th>DNI</th><th>TIPO DE LICENCIA</th><th>INICIO</th><th>DÍAS</th><th>FIN</th>
              <th>ENVÍO MAIL</th><th>PRES. DOC.</th><th>CARGA SIME</th><th>DOC. ADJ.</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: (mode === 'edit' || mode === 'delete') ? 'pointer' : 'default' }}>
                <td>{item.apellido_nombre}</td>
                <td>{item.dni}</td>
                <td>{item.tipo_de_licencia}</td>
                <td>{formatDate(item.inicio_de_licencia)}</td>
                <td>{item.cantidad_dias}</td>
                <td>{formatDate(item.finalizacion_de_licencia)}</td>
                <td>{formatDate(item.fecha_envio_mail)}</td>
                <td>{formatDate(item.fecha_presentacion_documentacion)}</td>
                <td>{formatDate(item.fecha_carga_sime)}</td>
                <td>{Array.isArray(item.documentacion_adjuntada) ? item.documentacion_adjuntada.join(', ') : ''}</td>
              </tr>
            )) : (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Licencias;