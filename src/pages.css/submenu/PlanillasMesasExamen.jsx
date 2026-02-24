import React, { useEffect, useState } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets.css/fondos/Fondo PLANILLAS1.jpg";
import { supabase } from "../../components.css/supabaseClient";
import logo from "../../assets.css/logos/Logo.png";

const PlanillasMesasExamen = ({ goBack, goHome }) => {
  const [mesas, setMesas] = useState([]);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("view"); // 'view', 'create', 'edit', 'delete'
  const [selectedId, setSelectedId] = useState(null);

  // Estado del formulario
  const initialFormState = {
    fecha: "",
    curso: "",
    division: "",
    condicion: "REGULAR",
    asignatura: "",
    inscriptos: 0,
    presentes: 0,
    ausentes: 0,
    aprobados: 0,
    desaprobados: 0
  };
  const [formData, setFormData] = useState(initialFormState);

  // Filtros
  const [filters, setFilters] = useState({
    asignatura: "",
    condicion: "",
    mes: "",
    anio: "",
    fecha: ""
  });

  useEffect(() => {
    fetchMesas();
    fetchAsignaturas();
  }, []);

  const fetchMesas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mesas_de_examen')
        .select('*')
        .order('fecha', { ascending: false });
      if (error) throw error;
      setMesas(data || []);
    } catch (error) {
      console.error("Error cargando mesas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAsignaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('codigos')
        .select('asignatura')
        .neq('asignatura', null);
      
      if (!error && data) {
        const unique = [...new Set(data.map(item => item.asignatura))].sort();
        setAsignaturasDisponibles(unique);
      }
    } catch (error) {
      console.error("Error cargando asignaturas:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      if (["inscriptos", "presentes", "aprobados"].includes(name)) {
        const inscriptos = parseInt(newData.inscriptos) || 0;
        const presentes = parseInt(newData.presentes) || 0;
        const aprobados = parseInt(newData.aprobados) || 0;

        newData.ausentes = Math.max(0, inscriptos - presentes);
        newData.desaprobados = Math.max(0, presentes - aprobados);
      }
      return newData;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        const { error } = await supabase.from('mesas_de_examen').insert([formData]);
        if (error) throw error;
      } else if (mode === "edit" && selectedId) {
        const { error } = await supabase.from('mesas_de_examen').update(formData).eq('id', selectedId);
        if (error) throw error;
      }
      await fetchMesas();
      setMode("view");
      setFormData(initialFormState);
      setSelectedId(null);
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      try {
        const { error } = await supabase.from('mesas_de_examen').delete().eq('id', selectedId);
        if (error) throw error;
        await fetchMesas();
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
      setFormData(item);
    }
  };

  // Filtrado
  const filteredData = mesas.filter(item => {
    const itemDate = new Date(item.fecha);
    const itemMes = (itemDate.getMonth() + 1).toString();
    const itemAnio = itemDate.getFullYear().toString();

    return (
      (!filters.asignatura || (item.asignatura && item.asignatura.toLowerCase().includes(filters.asignatura.toLowerCase()))) &&
      (!filters.condicion || item.condicion === filters.condicion) &&
      (!filters.mes || itemMes === filters.mes) &&
      (!filters.anio || itemAnio === filters.anio) &&
      (!filters.fecha || item.fecha === filters.fecha)
    );
  });

  // Totales
  const totals = filteredData.reduce((acc, curr) => ({
    inscriptos: acc.inscriptos + (curr.inscriptos || 0),
    presentes: acc.presentes + (curr.presentes || 0),
    ausentes: acc.ausentes + (curr.ausentes || 0),
    aprobados: acc.aprobados + (curr.aprobados || 0),
    desaprobados: acc.desaprobados + (curr.desaprobados || 0),
  }), { inscriptos: 0, presentes: 0, ausentes: 0, aprobados: 0, desaprobados: 0 });

  const handlePrint = () => {
    const fullLogoUrl = new URL(logo, window.location.href).href;
    
    const rowsHtml = filteredData.map(item => `
      <tr>
        <td>${item.fecha}</td>
        <td>${item.curso}</td>
        <td>${item.division}</td>
        <td>${item.condicion}</td>
        <td>${item.asignatura}</td>
        <td style="text-align: center;">${item.inscriptos}</td>
        <td style="text-align: center;">${item.presentes}</td>
        <td style="text-align: center;">${item.ausentes}</td>
        <td style="text-align: center;">${item.aprobados}</td>
        <td style="text-align: center;">${item.desaprobados}</td>
      </tr>
    `).join('');

    const totalsHtml = `
      <tr style="font-weight: bold; background-color: #e0e0e0;">
        <td colspan="5" style="text-align: right;">TOTALES:</td>
        <td style="text-align: center;">${totals.inscriptos}</td>
        <td style="text-align: center;">${totals.presentes}</td>
        <td style="text-align: center;">${totals.ausentes}</td>
        <td style="text-align: center;">${totals.aprobados}</td>
        <td style="text-align: center;">${totals.desaprobados}</td>
      </tr>
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mesas de Examen</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background-color: #f2f2f2; }
          .header-container { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .logo { width: 60px; height: auto; margin-right: 20px; }
          .school-info h1 { font-size: 16px; margin: 0; }
          .school-info p { font-size: 12px; margin: 2px 0; }
          @media print {
            .no-print { display: none !important; }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
          }
          .controls { position: fixed; bottom: 0; left: 0; width: 100%; background: #333; padding: 15px; text-align: center; }
          .btn { padding: 10px 20px; margin: 0 10px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; color: white; }
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
                    <p>CUE: 9001717/00 - Av. de la Soja S/N°</p>
                    <p>MESAS DE EXAMEN</p>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th>FECHA</th><th>CURSO</th><th>DIV</th><th>CONDICIÓN</th><th>ASIGNATURA</th>
              <th>INSC.</th><th>PRES.</th><th>AUS.</th><th>APROB.</th><th>DESAP.</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            ${totalsHtml}
          </tbody>
        </table>
        <div class="controls no-print">
          <button class="btn" style="background-color: blue;" onclick="window.print()">GUARDAR COMO PDF</button>
          <button class="btn" style="background-color: green;" onclick="window.print()">IMPRIMIR</button>
          <button class="btn" style="background-color: red;" onclick="window.close()">CANCELAR</button>
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

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>MESAS DE EXAMEN</h2>

      {/* Botones de Acción */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
        <button 
          onClick={() => { setMode("create"); setFormData(initialFormState); setSelectedId(null); }} 
          style={{ backgroundColor: 'blue', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          NUEVO
        </button>
        <button 
          onClick={() => { setMode("edit"); setSelectedId(null); }} 
          style={{ backgroundColor: 'green', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          MODIFICAR
        </button>
        <button 
          onClick={() => { setMode("delete"); setSelectedId(null); }} 
          style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          ELIMINAR
        </button>
        <button 
          onClick={handlePrint} 
          style={{ backgroundColor: 'yellow', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          IMPRIMIR
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        <input 
          placeholder="Asignatura" 
          value={filters.asignatura} 
          onChange={e => setFilters({...filters, asignatura: e.target.value})} 
          style={{ padding: '5px' }} 
        />
        <select value={filters.condicion} onChange={e => setFilters({...filters, condicion: e.target.value})} style={{ padding: '5px' }}>
          <option value="">Todas las Condiciones</option>
          <option value="REGULAR">REGULAR</option>
          <option value="PREVIO">PREVIO</option>
          <option value="COMPLETAR CARRERA">COMPLETAR CARRERA</option>
        </select>
        <select value={filters.mes} onChange={e => setFilters({...filters, mes: e.target.value})} style={{ padding: '5px' }}>
          <option value="">Mes</option>
          {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input 
          placeholder="Año" 
          value={filters.anio} 
          onChange={e => setFilters({...filters, anio: e.target.value})} 
          style={{ padding: '5px', width: '80px' }} 
        />
        <input 
          type="date"
          value={filters.fecha}
          onChange={e => setFilters({...filters, fecha: e.target.value})}
          style={{ padding: '5px' }}
        />
      </div>

      {/* Formulario Modal */}
      {(mode === "create" || (mode === "edit" && selectedId)) && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '0 auto 20px', maxWidth: '800px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>{mode === "create" ? "Nueva Mesa" : "Modificar Mesa"}</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            <label>Fecha: <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }} /></label>
            <label>Curso: <input name="curso" value={formData.curso} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }} /></label>
            <label>División: <input name="division" value={formData.division} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }} /></label>
            
            <label>Condición:
              <select name="condicion" value={formData.condicion} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }}>
                <option value="REGULAR">REGULAR</option>
                <option value="PREVIO">PREVIO</option>
                <option value="COMPLETAR CARRERA">COMPLETAR CARRERA</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>Asignatura:
              {formData.condicion === "REGULAR" ? (
                <select name="asignatura" value={formData.asignatura} onChange={handleInputChange} required style={{ width: '100%', padding: '5px' }}>
                  <option value="">Seleccione Asignatura...</option>
                  {asignaturasDisponibles.map(asig => <option key={asig} value={asig}>{asig}</option>)}
                </select>
              ) : (
                <input name="asignatura" value={formData.asignatura} onChange={handleInputChange} placeholder="Ingrese nombre de asignatura" required style={{ width: '100%', padding: '5px' }} />
              )}
            </label>

            <label>Inscriptos: <input type="number" name="inscriptos" value={formData.inscriptos} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
            <label>Presentes: <input type="number" name="presentes" value={formData.presentes} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
            
            <label>Ausentes (Calc): <input type="number" value={formData.ausentes} readOnly style={{ width: '100%', padding: '5px', backgroundColor: '#eee' }} /></label>
            <label>Aprobados: <input type="number" name="aprobados" value={formData.aprobados} onChange={handleInputChange} style={{ width: '100%', padding: '5px' }} /></label>
            <label>Desaprobados (Calc): <input type="number" value={formData.desaprobados} readOnly style={{ width: '100%', padding: '5px', backgroundColor: '#eee' }} /></label>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
              <button type="submit" style={{ padding: '10px 30px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Guardar</button>
              <button type="button" onClick={() => { setMode("view"); setSelectedId(null); }} style={{ padding: '10px 30px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Datos */}
      <div className="contenido-submenu" style={{ width: "98%", maxWidth: "100%" }}>
        {mode === "edit" && !selectedId && <div style={{ backgroundColor: '#e6fffa', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid green', borderRadius: '5px' }}>Seleccione un registro de la lista para modificarlo.</div>}
        {mode === "delete" && !selectedId && <div style={{ backgroundColor: '#fff5f5', padding: '10px', textAlign: 'center', marginBottom: '10px', border: '1px solid red', borderRadius: '5px' }}>Seleccione un registro de la lista para eliminarlo.</div>}
        {mode === "delete" && selectedId && (
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
             <button onClick={handleDelete} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>CONFIRMAR ELIMINACIÓN</button>
             <button onClick={() => { setMode("view"); setSelectedId(null); }} style={{ padding: '10px 20px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', marginLeft: '10px', cursor: 'pointer' }}>CANCELAR</button>
          </div>
        )}
        
        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando datos...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "rgba(255,255,255,0.9)" }}>
            <thead>
              <tr style={{ backgroundColor: "#333", color: "white" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>FECHA DE EXAMEN</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>CURSO</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>DIVISIÓN</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>CONDICIÓN</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>ASIGNATURA</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>INSCRIPTOS</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>PRESENTES</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>AUSENTES</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>APROBADOS</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>DESAPROBADOS</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                <>
                  {filteredData.map((item) => (
                    <tr 
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      style={{ 
                        cursor: (mode === "edit" || mode === "delete") ? "pointer" : "default",
                        backgroundColor: (mode === "edit" || mode === "delete") && selectedId === item.id ? "#fffbe6" : "transparent"
                      }}
                    >
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.fecha}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.curso}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.division}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.condicion}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.asignatura}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.inscriptos}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.presentes}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.ausentes}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.aprobados}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{item.desaprobados}</td>
                    </tr>
                  ))}
                  {/* Fila de Totales */}
                  <tr style={{ backgroundColor: "#e0e0e0", fontWeight: "bold" }}>
                    <td colSpan="5" style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>TOTALES:</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{totals.inscriptos}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{totals.presentes}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{totals.ausentes}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{totals.aprobados}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{totals.desaprobados}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan="10" style={{ padding: "20px", textAlign: "center", border: "1px solid #ddd" }}>
                    No se encontraron registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PlanillasMesasExamen;