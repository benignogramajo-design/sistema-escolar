import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";

const RegistroDocentesRegimenLicencias = ({ goBack, goHome }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ capitulo: "", articulo: "", inciso: "", texto: "" });
  
  // Estados para selección y modal
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [showPrint, setShowPrint] = useState(false);

  // Estado del formulario
  const initialForm = {
    capitulo: "", capitulo_nombre: "",
    articulo: "", articulo_nombre: "",
    inciso: "", inciso_nombre: "",
    contenido: [""] // Cambiado a array para múltiples párrafos
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('regimen_licencias')
        .select('*')
        .order('id', { ascending: true }); // Orden básico por ID, idealmente sería por orden lógico
      
      if (error) throw error;

      // Parse 'contenido' which might be a JSON string, a plain string, or an array
      const parsedData = (result || []).map(item => {
        let parsedContenido = item.contenido;
        if (typeof parsedContenido === 'string') {
          try {
            // Try to parse it as JSON
            parsedContenido = JSON.parse(parsedContenido);
          } catch (e) {
            // If it fails, it's just a plain string. Keep it as is for now.
          }
        }
        
        // Now, ensure the final result is an array.
        if (!Array.isArray(parsedContenido)) {
          parsedContenido = parsedContenido ? [String(parsedContenido)] : [];
        }

        return { ...item, contenido: parsedContenido };
      });

      setData(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Filtrado ---
  const filteredData = data.filter(item => {
    const matchCap = !filters.capitulo || (item.capitulo || "").toLowerCase().includes(filters.capitulo.toLowerCase());
    const matchArt = !filters.articulo || (item.articulo || "").toLowerCase().includes(filters.articulo.toLowerCase());
    const matchInc = !filters.inciso || (item.inciso || "").toLowerCase().includes(filters.inciso.toLowerCase());
    
    const searchText = filters.texto.toLowerCase();
    const matchText = !filters.texto || 
      (item.capitulo || "").toLowerCase().includes(searchText) ||
      (item.capitulo_nombre || "").toLowerCase().includes(searchText) ||
      (item.articulo || "").toLowerCase().includes(searchText) ||
      (item.articulo_nombre || "").toLowerCase().includes(searchText) ||
      (item.inciso || "").toLowerCase().includes(searchText) ||
      (item.inciso_nombre || "").toLowerCase().includes(searchText) ||
      (Array.isArray(item.contenido) && item.contenido.some(p => p.toLowerCase().includes(searchText)));

    return matchCap && matchArt && matchInc && matchText;
  });

  // --- Manejadores CRUD ---
  const handleNew = () => {
    setModalMode("create");
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleModify = () => {
    if (!selectedId) {
      alert("Por favor, seleccione un registro para modificar.");
      return;
    }
    const item = data.find(d => d.id === selectedId);
    if (item) {
      setModalMode("edit");
      // Asegurarse de que contenido sea un array con un campo vacío al final
      const contenidoArray = Array.isArray(item.contenido) 
        ? [...item.contenido, ""] 
        : (item.contenido ? [item.contenido, ""] : [""]);
      setFormData({...item, contenido: contenidoArray});
      setShowModal(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      alert("Por favor, seleccione un registro para eliminar.");
      return;
    }
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      const { error } = await supabase.from('regimen_licencias').delete().eq('id', selectedId);
      if (error) alert("Error al eliminar: " + error.message);
      else {
        setSelectedId(null);
        fetchData();
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Extraer id y created_at para no enviarlos en el payload si no es necesario o para limpiar
      const { id, created_at, ...payload } = formData;

      // Limpiar contenidos vacíos antes de guardar
      const cleanPayload = {
        ...payload,
        contenido: payload.contenido.filter(p => p.trim() !== '')
      };

      if (modalMode === "create") {
        const { error } = await supabase.from('regimen_licencias').insert([cleanPayload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('regimen_licencias').update(cleanPayload).eq('id', selectedId);
        if (error) throw error;
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContenidoChange = (index, value) => {
    const newContenidos = [...formData.contenido];
    newContenidos[index] = value;

    // Si se escribe en el último campo y no está vacío, agregar uno nuevo
    if (index === newContenidos.length - 1 && value.trim() !== "") {
      newContenidos.push("");
    }

    setFormData(prev => ({ ...prev, contenido: newContenidos }));
  };

  // --- Lógica de Tabla (RowSpan real y Ordenamiento) ---
  
  // 1. Ordenar los datos filtrados para que la agrupación funcione correctamente
  const sortedData = [...filteredData].sort((a, b) => {
    // Comparación alfanumérica para que "10" vaya después de "2"
    const compare = (valA, valB) => (valA || "").localeCompare(valB || "", undefined, { numeric: true, sensitivity: 'base' });
    
    if (a.capitulo !== b.capitulo) return compare(a.capitulo, b.capitulo);
    if (a.articulo !== b.articulo) return compare(a.articulo, b.articulo);
    return compare(a.inciso, b.inciso);
  });

  // 2. Calcular RowSpan
  const processedTableData = [];
  for (let i = 0; i < sortedData.length; i++) {
    const item = sortedData[i];
    let capSpan = 1;
    let artSpan = 1;

    // Calcular Span de Capítulo
    if (i === 0 || item.capitulo !== sortedData[i-1].capitulo) {
      for (let j = i + 1; j < sortedData.length; j++) {
        if (sortedData[j].capitulo === item.capitulo) capSpan++;
        else break;
      }
    } else {
      capSpan = 0; // Ocultar celda
    }

    // Calcular Span de Artículo (dentro del mismo capítulo)
    if (i === 0 || item.articulo !== sortedData[i-1].articulo || item.capitulo !== sortedData[i-1].capitulo) {
      for (let j = i + 1; j < sortedData.length; j++) {
        if (sortedData[j].articulo === item.articulo && sortedData[j].capitulo === item.capitulo) artSpan++;
        else break;
      }
    } else {
      artSpan = 0; // Ocultar celda
    }

    processedTableData.push({ ...item, capSpan, artSpan });
  }

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>RÉGIMEN DE LICENCIAS</h2>
      
      {/* --- Filtros --- */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        <input placeholder="CAPITULO" value={filters.capitulo} onChange={e => setFilters({...filters, capitulo: e.target.value})} style={{ padding: '5px' }} />
        <input placeholder="ARTICULO" value={filters.articulo} onChange={e => setFilters({...filters, articulo: e.target.value})} style={{ padding: '5px' }} />
        <input placeholder="INCISO" value={filters.inciso} onChange={e => setFilters({...filters, inciso: e.target.value})} style={{ padding: '5px' }} />
        <input placeholder="TEXTO (Buscar...)" value={filters.texto} onChange={e => setFilters({...filters, texto: e.target.value})} style={{ padding: '5px', width: '200px' }} />
      </div>

      {/* --- Botones de Acción --- */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
        <button onClick={handleNew} style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>NUEVO</button>
        <button onClick={handleModify} style={{ backgroundColor: 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>MODIFICAR</button>
        <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>ELIMINAR</button>
        <button onClick={() => setShowPrint(true)} style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>IMPRIMIR</button>
      </div>

      {/* --- Tabla --- */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%", overflowX: 'auto' }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)", fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>CAPITULO</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>ARTICULO</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>INCISO</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>CONTENIDO</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
            ) : processedTableData.length > 0 ? (
              processedTableData.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => setSelectedId(item.id)}
                  style={{ 
                    cursor: 'pointer', 
                    backgroundColor: selectedId === item.id ? '#fffbe6' : 'transparent',
                    borderBottom: '1px solid #ddd'
                  }}
                >
                  {/* Celda Capitulo */}
                  {item.capSpan > 0 && (
                    <td rowSpan={item.capSpan} style={{ padding: "8px", border: "1px solid #ddd", verticalAlign: 'top', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.5)' }}>
                      <>
                        <div>{item.capitulo}</div>
                        {item.capitulo_nombre && <div style={{ fontSize: '10px', fontStyle: 'italic' }}>{item.capitulo_nombre}</div>}
                      </>
                    </td>
                  )}
                  
                  {/* Celda Articulo */}
                  {item.artSpan > 0 && (
                    <td rowSpan={item.artSpan} style={{ padding: "8px", border: "1px solid #ddd", verticalAlign: 'top', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.3)' }}>
                      <>
                        <div>{item.articulo}</div>
                        {item.articulo_nombre && <div style={{ fontSize: '10px', fontStyle: 'italic' }}>{item.articulo_nombre}</div>}
                      </>
                    </td>
                  )}

                  {/* Celda Inciso */}
                  <td style={{ padding: "8px", border: "1px solid #ddd", verticalAlign: 'top' }}>
                    <div>{item.inciso}</div>
                    {item.inciso_nombre && <div style={{ fontSize: '10px', fontStyle: 'italic' }}>{item.inciso_nombre}</div>}
                  </td>

                  {/* Celda Contenido */}
                  <td style={{ padding: "8px", border: "1px solid #ddd", verticalAlign: 'top' }}>
                    {Array.isArray(item.contenido)
                      ? item.contenido.map((p, i) => <p key={i} style={{ margin: '0 0 5px 0', padding: 0 }}>{p}</p>)
                      : item.contenido
                    }
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No hay registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal Formulario --- */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ textAlign: 'center' }}>{modalMode === 'create' ? 'Nuevo Registro' : 'Modificar Registro'}</h3>
            <form onSubmit={handleSave}>
              
              {/* Sección Capitulo */}
              <div style={{ marginBottom: '15px', border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
                <label style={{ fontWeight: 'bold' }}>CAPITULO:</label>
                <input 
                  name="capitulo" 
                  value={formData.capitulo} 
                  onChange={handleInputChange} 
                  placeholder="Ej: I"
                  style={{ width: '100%', padding: '5px', marginBottom: '5px' }} 
                />
                {formData.capitulo && (
                  <input 
                    name="capitulo_nombre" 
                    value={formData.capitulo_nombre} 
                    onChange={handleInputChange} 
                    placeholder="Nombre del Capítulo (Opcional)"
                    style={{ width: '100%', padding: '5px' }} 
                  />
                )}
              </div>

              {/* Sección Articulo */}
              <div style={{ marginBottom: '15px', border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
                <label style={{ fontWeight: 'bold' }}>ARTICULO:</label>
                <input 
                  name="articulo" 
                  value={formData.articulo} 
                  onChange={handleInputChange} 
                  placeholder="Ej: 1"
                  style={{ width: '100%', padding: '5px', marginBottom: '5px' }} 
                />
                {formData.articulo && (
                  <input 
                    name="articulo_nombre" 
                    value={formData.articulo_nombre} 
                    onChange={handleInputChange} 
                    placeholder="Nombre del Artículo (Opcional)"
                    style={{ width: '100%', padding: '5px' }} 
                  />
                )}
              </div>

              {/* Sección Inciso */}
              <div style={{ marginBottom: '15px', border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
                <label style={{ fontWeight: 'bold' }}>INCISO:</label>
                <input 
                  name="inciso" 
                  value={formData.inciso} 
                  onChange={handleInputChange} 
                  placeholder="Ej: a"
                  style={{ width: '100%', padding: '5px', marginBottom: '5px' }} 
                />
                {formData.inciso && (
                  <input 
                    name="inciso_nombre" 
                    value={formData.inciso_nombre} 
                    onChange={handleInputChange} 
                    placeholder="Nombre del Inciso (Opcional)"
                    style={{ width: '100%', padding: '5px' }} 
                  />
                )}
              </div>

              {/* Sección Contenido */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>CONTENIDO:</label>
                {formData.contenido.map((texto, index) => (
                  <textarea 
                    key={index}
                    value={texto} 
                    onChange={(e) => handleContenidoChange(index, e.target.value)} 
                    rows="3"
                    style={{ width: '100%', padding: '5px', marginTop: '5px' }}
                    placeholder={`Párrafo ${index + 1}`}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>GUARDAR</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Vista Previa Impresión --- */}
      {showPrint && (
        <div className="print-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'white', zIndex: 2000, overflowY: 'auto' }}>
          <div className="print-container" style={{ padding: '40px', maxWidth: '210mm', margin: '0 auto' }}>
            
            {/* Encabezado */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontFamily: 'Arial', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>REGIMEN DE LICENCIAS – 505 y MODIFICATORIAS</h1>
            </div>

            {/* Contenido Jerárquico */}
            <div>
              {(() => {
                let lastP_Cap = null;
                let lastP_Art = null;

                return sortedData.map((item, index) => {
                  const showCap = item.capitulo !== lastP_Cap;
                  const showArt = showCap || item.articulo !== lastP_Art;
                  
                  lastP_Cap = item.capitulo;
                  lastP_Art = item.articulo;

                  return (
                    <div key={index} style={{ marginBottom: '15px', fontFamily: 'Arial', textAlign: 'justify' }}>
                      
                      {/* Título Capítulo */}
                      {showCap && item.capitulo && (
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>
                          CAPÍTULO N° {item.capitulo} {item.capitulo_nombre ? `- ${item.capitulo_nombre}` : ''}
                        </div>
                      )}

                      {/* Subtítulo 1 Artículo */}
                      {showArt && item.articulo && (
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '10px', marginBottom: '5px' }}>
                          Articulo N° {item.articulo} {item.articulo_nombre ? `- ${item.articulo_nombre}` : ''}
                        </div>
                      )}

                      {/* Subtítulo 2 Inciso y Contenido */}
                      <div style={{ paddingLeft: item.inciso ? '20px' : '0' }}>
                        {item.inciso && (
                          <span style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '5px' }}>
                            {item.inciso} {item.inciso_nombre ? `- ${item.inciso_nombre}` : ''}
                          </span>
                        )}
                        <div style={{ fontSize: '12px', display: 'inline' }}>
                          {Array.isArray(item.contenido)
                            ? item.contenido.map((p, i) => <p key={i} style={{margin: '0 0 10px 0'}}>{p}</p>)
                            : <p style={{margin: 0, display: 'inline'}}>{item.contenido}</p>
                          }
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

          </div>

          {/* Controles Flotantes */}
          <div className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#333', padding: '15px', textAlign: 'center' }}>
            <button onClick={() => window.print()} style={{ padding: '10px 20px', margin: '0 10px', backgroundColor: '#ffc107', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>IMPRIMIR</button>
            <button onClick={() => setShowPrint(false)} style={{ padding: '10px 20px', margin: '0 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>CERRAR</button>
          </div>

          <style>{`
            @media print {
              .no-print { display: none !important; }
              body * { visibility: hidden; }
              .print-overlay, .print-overlay * { visibility: visible; }
              .print-overlay { position: absolute; top: 0; left: 0; width: 100%; }
              body { background-color: white; }
              .print-container { padding: 0; margin: 0; width: 100%; max-width: none; }
              @page { size: A4; margin: 20mm; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default RegistroDocentesRegimenLicencias;
