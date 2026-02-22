import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PERSONAL INSTITUCIONAL.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets.css/logos/Logo.png";

const DocentesDatosLegajo = ({ goBack, goHome }) => {
  const initialFormState = {
    apellido: "",
    nombre: "",
    dni: "",
    legajo: "",
    fecha_nacimiento: "",
    edad: "",
    localidad: "",
    domicilio: "",
    celular: "",
    mail: "",
    titulos: [""],
    cargos: [],
    estado: "ACTIVO",
    motivo_inactivo: "",
    documentacion_inactivo: "",
    institucion_destino: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [listaDocentes, setListaDocentes] = useState([]);
  const [mode, setMode] = useState("view"); // 'view', 'create', 'edit', 'delete'
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({
    apellidoNombre: "",
    localidad: "",
    titulos: "",
    estado: "",
    otros: ""
  });

  const cargosList = [
    "DIRECTOR/A", "SECRETARIO", "AYUDANTE DE SECRETARIA", "PRECEPTOR",
    "ASESOR PED.", "DOCENTE", "BIBLIOTECARIO/A",
    "AYUDANTE CLASES PRACTICAS (TECN/INFORM)", "AYUDANTE CLASES PRACTICAS (FISICA)",
    "PERSONAL AUXILIAR (CAT. 18)", "PERSONAL AUXILIAR (CAT. 15)"
  ];

  const fetchDocentes = async () => {
    try {
      const { data, error } = await supabase
        .from('datos_de_legajo_docentes')
        .select('*')
        .order('apellido', { ascending: true });
      if (error) throw error;
      setListaDocentes(data || []);
    } catch (error) {
      console.error("Error al cargar docentes:", error.message);
      alert("Error al cargar la lista de docentes: " + error.message);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  // Calcular edad automáticamente
  useEffect(() => {
    if (formData.fecha_nacimiento) {
      const birthDate = new Date(formData.fecha_nacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, edad: age >= 0 ? age : "" }));
    } else {
      setFormData(prev => ({ ...prev, edad: "" }));
    }
  }, [formData.fecha_nacimiento]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTituloChange = (index, value) => {
    const newTitulos = [...formData.titulos];
    newTitulos[index] = value;
    // Si escribimos en el último campo, agregamos uno nuevo
    if (index === newTitulos.length - 1 && value !== "") {
      newTitulos.push("");
    }
    setFormData(prev => ({ ...prev, titulos: newTitulos }));
  };

  const handleCargoChange = (e) => {
    const { value, checked } = e.target;
    let newCargos = [...formData.cargos];
    if (checked) {
      newCargos.push(value);
    } else {
      newCargos = newCargos.filter(c => c !== value);
    }
    setFormData(prev => ({ ...prev, cargos: newCargos }));
  };

  const handleRowClick = async (doc) => {
    if (mode === "edit") {
      setSelectedId(doc.id);
      
      // Función auxiliar para asegurar que listas (titulos/cargos) se lean bien si vienen como texto JSON
      const parseList = (item) => {
        if (Array.isArray(item)) return item;
        if (typeof item === 'string') {
          try { return JSON.parse(item); } catch (e) { return []; }
        }
        return [];
      };

      const safeTitulos = parseList(doc.titulos);
      const safeCargos = parseList(doc.cargos);

      setFormData({
        apellido: doc.apellido || "",
        nombre: doc.nombre || "",
        dni: doc.dni || "",
        legajo: doc.legajo || "",
        fecha_nacimiento: doc.fecha_nacimiento || "",
        edad: doc.edad || "",
        localidad: doc.localidad || "",
        domicilio: doc.domicilio || "",
        celular: doc.celular || "",
        mail: doc.mail || "",
        titulos: safeTitulos.length > 0 ? safeTitulos : [""],
        cargos: safeCargos,
        estado: doc.estado || "ACTIVO",
        motivo_inactivo: doc.motivo_inactivo || "",
        documentacion_inactivo: doc.documentacion_inactivo || "",
        institucion_destino: doc.institucion_destino || ""
      });
    } else if (mode === "delete") {
      if (window.confirm(`¿Está seguro de eliminar a ${doc.apellido}, ${doc.nombre}?`)) {
        try {
          const { error } = await supabase.from('datos_de_legajo_docentes').delete().eq('id', doc.id);
          if (error) throw error;
          fetchDocentes();
          alert("Registro eliminado correctamente.");
        } catch (error) {
          alert("Error al eliminar: " + error.message);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      titulos: formData.titulos.filter(t => t.trim() !== "")
    };
    
    try {
      if (mode === "create") {
        const { error } = await supabase
          .from('datos_de_legajo_docentes')
          .insert([dataToSave]);
        if (error) throw error;
      } else if (mode === "edit" && selectedId) {
        const { error } = await supabase
          .from('datos_de_legajo_docentes')
          .update(dataToSave)
          .eq('id', selectedId);
        if (error) throw error;
      }
      
      alert("Datos guardados correctamente.");
      setFormData(initialFormState);
      setMode("view");
      setSelectedId(null);
      fetchDocentes();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const handlePrint = () => {
    const fullLogoUrl = new URL(logo, window.location.href).href;
    
    const rowsHtml = listaDocentes.map(doc => `
      <tr>
        <td style="border: 1px solid #000; padding: 5px;">${doc.apellido}, ${doc.nombre}</td>
        <td style="border: 1px solid #000; padding: 5px;">${doc.dni}</td>
        <td style="border: 1px solid #000; padding: 5px;">${doc.legajo || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">${doc.fecha_nacimiento || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">${doc.edad || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">${doc.localidad || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">${doc.domicilio || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">${doc.celular || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">${doc.mail || ''}</td>
        <td style="border: 1px solid #000; padding: 5px;">${formatArrayData(doc.titulos)}</td>
        <td style="border: 1px solid #000; padding: 5px;">${doc.estado || ''}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Listado de Docentes</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
          th { background-color: #f2f2f2; border: 1px solid #000; padding: 5px; }
          td { border: 1px solid #000; padding: 5px; }
          .header-container { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .logo { width: 60px; height: auto; margin-right: 20px; }
          .school-info h1 { font-size: 16px; margin: 0; }
          .school-info p { font-size: 12px; margin: 2px 0; }
          @media print {
            .no-print { display: none !important; }
            @page { size: landscape; }
          }
          .preview-controls {
            position: fixed; bottom: 0; left: 0; width: 100%;
            background: #333; padding: 15px; text-align: center;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
          }
          .btn { padding: 10px 20px; margin: 0 10px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; }
          .btn-print { background-color: yellow; color: black; }
          .btn-save { background-color: #fff; color: #333; }
          .btn-close { background-color: red; color: white; }
        </style>
      </head>
      <body>
        <div class="header-container">
          <img src="${fullLogoUrl}" class="logo" alt="Logo" />
          <div class="school-info">
            <h1>Escuela Secundaria Gobernador Garmendia</h1>
            <p>CUE: 9001717/00 - Av. de la Soja S/N° - Gobernador Garmendia - Burruyacu</p>
            <p>escuelasecgarmendia@gmail.com</p>
          </div>
        </div>
        <h2 style="text-align: center;">LISTADO DE DOCENTES</h2>
        <table>
          <thead>
            <tr>
              <th>Apellido y Nombre</th><th>DNI</th><th>Legajo</th><th>F. Nacimiento</th><th>Edad</th>
              <th>Localidad</th><th>Domicilio</th><th>Celular</th><th>Mail</th><th>Títulos</th><th>Estado</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="preview-controls no-print">
          <button class="btn btn-save" onclick="window.print()">GUARDAR COMO PDF</button>
          <button class="btn btn-print" onclick="window.print()">IMPRIMIR</button>
          <button class="btn btn-close" onclick="window.close()">CERRAR</button>
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

  const formatArrayData = (data) => {
    if (Array.isArray(data)) return data.join(", ");
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed.join(", ");
      } catch (e) {}
    }
    return data;
  };

  // Lógica de filtrado
  const filteredDocentes = listaDocentes.filter((doc) => {
    const fullName = `${doc.apellido || ""} ${doc.nombre || ""}`.toLowerCase();
    const matchName = fullName.includes(filters.apellidoNombre.toLowerCase());

    const matchLocalidad = (doc.localidad || "").toLowerCase().includes(filters.localidad.toLowerCase());

    let titulosStr = "";
    if (Array.isArray(doc.titulos)) titulosStr = doc.titulos.join(" ");
    else if (typeof doc.titulos === 'string') titulosStr = doc.titulos;
    const matchTitulos = titulosStr.toLowerCase().includes(filters.titulos.toLowerCase());

    const matchEstado = filters.estado === "" || (doc.estado || "") === filters.estado;

    const otherData = `${doc.dni || ""} ${doc.legajo || ""} ${doc.domicilio || ""} ${doc.celular || ""} ${doc.mail || ""}`.toLowerCase();
    const matchOtros = otherData.includes(filters.otros.toLowerCase());

    return matchName && matchLocalidad && matchTitulos && matchEstado && matchOtros;
  });

  const uniqueEstados = [...new Set(listaDocentes.map(d => d.estado).filter(Boolean))];

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>DATOS DE LEGAJO DOCENTE</h2>
      
      {/* Botones de Acción */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
        <button onClick={() => { setMode("create"); setFormData(initialFormState); setSelectedId(null); }} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>NUEVO</button>
        <button onClick={() => { setMode("edit"); setSelectedId(null); }} style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>MODIFICAR</button>
        <button onClick={() => { setMode("delete"); setSelectedId(null); }} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>ELIMINAR</button>
        <button onClick={handlePrint} style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>IMPRIMIR</button>
      </div>

      <div className="contenido-submenu" style={{ maxWidth: "95%" }}>
        
        {/* Filtros */}
        <div style={{ backgroundColor: "rgba(255,255,255,0.9)", padding: "15px", borderRadius: "8px", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", justifyContent: "center" }}>
          <input 
            type="text" 
            placeholder="Apellido y Nombre" 
            value={filters.apellidoNombre} 
            onChange={(e) => setFilters({...filters, apellidoNombre: e.target.value})} 
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input 
            type="text" 
            placeholder="Localidad" 
            value={filters.localidad} 
            onChange={(e) => setFilters({...filters, localidad: e.target.value})} 
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input 
            type="text" 
            placeholder="Títulos" 
            value={filters.titulos} 
            onChange={(e) => setFilters({...filters, titulos: e.target.value})} 
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <select 
            value={filters.estado} 
            onChange={(e) => setFilters({...filters, estado: e.target.value})} 
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "150px" }}
          >
            <option value="">Todos los Estados</option>
            {uniqueEstados.map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Otros Datos" 
            value={filters.otros} 
            onChange={(e) => setFilters({...filters, otros: e.target.value})} 
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "200px" }}
          />
        </div>
        
        {/* Mensajes de ayuda para modos */}
        {mode === "edit" && !selectedId && <div style={{ backgroundColor: '#e6fffa', padding: '10px', textAlign: 'center', marginBottom: '20px', border: '1px solid green', borderRadius: '5px' }}>Seleccione un docente de la lista para modificar sus datos.</div>}
        {mode === "delete" && <div style={{ backgroundColor: '#fff5f5', padding: '10px', textAlign: 'center', marginBottom: '20px', border: '1px solid red', borderRadius: '5px' }}>Seleccione un docente de la lista para eliminarlo.</div>}

        {/* Formulario (Solo visible en create o edit con selección) */}
        {(mode === "create" || (mode === "edit" && selectedId)) && (
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px", borderBottom: "2px solid #ccc", paddingBottom: "20px" }}>
          
          {/* Datos Personales */}
          <div style={{ gridColumn: "1 / -1", borderBottom: "2px solid #ddd", paddingBottom: "5px" }}>
            <h3>Datos Personales</h3>
          </div>
          
          <label style={{ display: "flex", flexDirection: "column" }}>
            Apellido:
            <input type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </label>
          
          <label style={{ display: "flex", flexDirection: "column" }}>
            Nombre:
            <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            N° de DNI:
            <input type="number" name="dni" value={formData.dni} onChange={handleInputChange} required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            N° Legajo:
            <input type="text" name="legajo" value={formData.legajo} onChange={handleInputChange} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Fecha de Nacimiento:
            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Edad:
            <input type="text" name="edad" value={formData.edad} readOnly style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f0f0f0" }} />
          </label>

          {/* Contacto */}
          <div style={{ gridColumn: "1 / -1", borderBottom: "2px solid #ddd", paddingBottom: "5px", marginTop: "10px" }}>
            <h3>Contacto y Domicilio</h3>
          </div>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Localidad:
            <input type="text" name="localidad" value={formData.localidad} onChange={handleInputChange} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Domicilio:
            <input type="text" name="domicilio" value={formData.domicilio} onChange={handleInputChange} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Celular:
            <input type="tel" name="celular" value={formData.celular} onChange={handleInputChange} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Mail:
            <input type="email" name="mail" value={formData.mail} onChange={handleInputChange} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </label>

          {/* Títulos */}
          <div style={{ gridColumn: "1 / -1", borderBottom: "2px solid #ddd", paddingBottom: "5px", marginTop: "10px" }}>
            <h3>Títulos</h3>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            {formData.titulos.map((titulo, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <input 
                  type="text" 
                  placeholder={`Título ${index + 1}`}
                  value={titulo} 
                  onChange={(e) => handleTituloChange(index, e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
            ))}
          </div>

          {/* Cargos */}
          <div style={{ gridColumn: "1 / -1", borderBottom: "2px solid #ddd", paddingBottom: "5px", marginTop: "10px" }}>
            <h3>Cargos</h3>
          </div>
          <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "10px" }}>
            {cargosList.map(cargo => (
              <label key={cargo} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                <input 
                  type="checkbox" 
                  value={cargo} 
                  checked={formData.cargos.includes(cargo)} 
                  onChange={handleCargoChange} 
                />
                {cargo}
              </label>
            ))}
          </div>

          {/* Estado */}
          <div style={{ gridColumn: "1 / -1", borderBottom: "2px solid #ddd", paddingBottom: "5px", marginTop: "10px" }}>
            <h3>Estado</h3>
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", fontWeight: "bold" }}>
              <input 
                type="radio" 
                name="estado" 
                value="ACTIVO" 
                checked={formData.estado === "ACTIVO"} 
                onChange={handleInputChange} 
              />
              ACTIVO
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", fontWeight: "bold" }}>
              <input 
                type="radio" 
                name="estado" 
                value="NO ACTIVO" 
                checked={formData.estado === "NO ACTIVO"} 
                onChange={handleInputChange} 
              />
              NO ACTIVO
            </label>
          </div>

          {formData.estado === "NO ACTIVO" && (
            <div style={{ gridColumn: "1 / -1", padding: "15px", backgroundColor: "#fff0f0", borderRadius: "8px", border: "1px solid #ffcccc", marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <label style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
                Motivo:
                <input type="text" name="motivo_inactivo" value={formData.motivo_inactivo} onChange={handleInputChange} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column" }}>
                Dcto./Disposición/Expte:
                <input type="text" name="documentacion_inactivo" value={formData.documentacion_inactivo} onChange={handleInputChange} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column" }}>
                Institución donde cumple función:
                <input type="text" name="institucion_destino" value={formData.institucion_destino} onChange={handleInputChange} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
              </label>
            </div>
          )}

          <div style={{ gridColumn: "1 / -1", marginTop: "20px", textAlign: "center", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button type="submit" style={{ padding: "12px 40px", backgroundColor: "blue", color: "white", border: "none", borderRadius: "5px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
              GUARDAR DATOS
            </button>
            <button type="button" onClick={() => { setMode("view"); setSelectedId(null); }} style={{ padding: "12px 40px", backgroundColor: "gray", color: "white", border: "none", borderRadius: "5px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
              CANCELAR
            </button>
          </div>
        </form>
        )}

        {/* Tabla de Datos Cargados */}
        <div style={{ marginTop: "40px", overflowX: "auto" }}>
          <h3 style={{ textAlign: "center", marginBottom: "15px", borderBottom: "2px solid #ddd", paddingBottom: "5px" }}>
            LISTADO DE DOCENTES
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.95)" }}>
            <thead>
              <tr style={{ backgroundColor: "#333", color: "white" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>Apellido y Nombre</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>DNI</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>Legajo</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>F. Nacimiento</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>Edad</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>Localidad</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>Domicilio</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>Celular</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>Mail</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>Títulos</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", fontSize: "12px" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocentes.length > 0 ? filteredDocentes.map((doc, index) => (
                <tr 
                  key={doc.id || index} 
                  onClick={() => handleRowClick(doc)}
                  style={{ 
                    backgroundColor: (mode === "edit" || mode === "delete") ? "#fffbe6" : (index % 2 === 0 ? "#f9f9f9" : "white"),
                    cursor: (mode === "edit" || mode === "delete") ? "pointer" : "default",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => { if(mode !== "view") e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
                  onMouseLeave={(e) => { if(mode !== "view") e.currentTarget.style.backgroundColor = (mode === "edit" || mode === "delete") ? "#fffbe6" : (index % 2 === 0 ? "#f9f9f9" : "white"); }}
                >
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{doc.apellido}, {doc.nombre}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{doc.dni}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{doc.legajo}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{doc.fecha_nacimiento}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{doc.edad}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{doc.localidad}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{doc.domicilio}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{doc.celular}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{doc.mail}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{formatArrayData(doc.titulos)}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: "12px" }}>{doc.estado}</td>
                </tr>
              )) : (
                <tr><td colSpan="11" style={{ padding: "15px", textAlign: "center" }}>No hay datos cargados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocentesDatosLegajo;
