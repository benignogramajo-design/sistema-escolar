import React, { useState, useEffect } from "react";
import NavBar from "../../components.css/NavBar";
import "../../styles/pages.css";
import fondo from "../../assets/fondos/Fondo DOCENTES1.jpg";
import { supabase } from "../../components.css/supabaseClient";

const MisHorariosDocente = ({ goBack, goHome, user }) => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const horariosMananaLabels = [
    "1° de 07:30 a 08:10", "2° de 08:10 a 08:50", "3° de 08:55 a 09:35", "4° de 09:35 a 10:15",
    "5° de 10:20 a 11:00", "6° de 11:00 a 11:40", "7° de 11:40 a 12:20", "8° de 12:20 a 13:00"
  ];
  const horariosTardeLabels = [
    "1° de 13:10 a 13:50", "2° de 13:50 a 14:30", "3° de 14:35 a 15:15", "4° de 15:15 a 15:55",
    "5° de 16:00 a 16:40", "6° de 16:40 a 17:20", "7° de 17:20 a 18:00", "8° de 18:00 a 18:40"
  ];

  useEffect(() => {
    const fetchHorarios = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: estData, error } = await supabase
          .from('estructura_horario')
          .select('*');

        if (error && error.code !== 'PGRST116') throw error;

        const nombreCompleto = `${user.apellido}, ${user.nombre}`;

        // Procesar datos (parsear JSONs si vienen como string) y filtrar por docente
        const userAssignments = (estData || []).map(item => {
             const safeParse = (val, fb) => {
                if (typeof val === 'string') {
                  try { return JSON.parse(val); } catch (e) { return fb; }
                }
                return val || fb;
             };
             return {
                 ...item,
                 horarios: safeParse(item.horarios, []),
                 docente_titular: safeParse(item.docente_titular, {}),
                 docente_interino: safeParse(item.docente_interino, {}),
                 docentes_suplentes: safeParse(item.docentes_suplentes, [])
             };
        }).filter(item => {
          const isTitular = item.docente_titular?.nombre === nombreCompleto;
          const isInterino = item.docente_interino?.nombre === nombreCompleto;
          const isSuplente = Array.isArray(item.docentes_suplentes) && item.docentes_suplentes.some(s => s.nombre === nombreCompleto);
          return isTitular || isInterino || isSuplente;
        });

        // Normalizar turno
        const normalizedAssignments = userAssignments.map(asig => {
            let turnoNormalizado = asig.turno || "";
            const upper = turnoNormalizado.toUpperCase();
            if (upper.includes("MAÑANA") && upper.includes("TARDE")) turnoNormalizado = "Mañana y Tarde";
            else if (upper.includes("MAÑANA")) turnoNormalizado = "Mañana";
            else if (upper.includes("TARDE")) turnoNormalizado = "Tarde";
            return { ...asig, turno: turnoNormalizado };
        });

        setAssignments(normalizedAssignments);
      } catch (error) {
        console.error("Error fetching horarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, [user]);

  const buildScheduleGrid = (allAssignments, turnoLabels, turno) => {
    const filtered = allAssignments.filter(a => a.turno?.includes(turno) || a.turno === "Mañana y Tarde");

    const grid = turnoLabels.map(label => {
      const row = { hora: label };
      diasSemana.forEach(dia => row[dia] = "---");
      return row;
    });

    const getRange = text => {
      if (!text) return null;
      const parseTime = timeStr => {
        if (!timeStr) return NaN;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + (minutes || 0);
      };
      const match = text.match(/(\d{1,2}:\d{2})\s*(?:a|-)\s*(\d{1,2}:\d{2})/);
      if (match && match[1] && match[2]) {
        return { start: parseTime(match[1]), end: parseTime(match[2]) };
      }
      return null;
    };

    filtered.forEach(asig => {
      if (Array.isArray(asig.horarios)) {
        asig.horarios.forEach(h => {
          const diaIndex = diasSemana.indexOf(h.dia);
          if (diaIndex === -1) return;

          if (asig.cargo === 'DOCENTE' && Array.isArray(h.horas)) {
            h.horas.forEach(horaStr => {
              const rowIndex = turnoLabels.findIndex(l => l === horaStr);
              if (rowIndex === -1) return;

              const plaza = (h.plazas && h.plazas[horaStr]) ? h.plazas[horaStr] : '';
              let content = `${asig.curso || ''}${asig.division || ''} - ${asig.asignatura}`;
              if (plaza) content += ` - ${plaza}`;
              
              if (grid[rowIndex][h.dia] !== "---") grid[rowIndex][h.dia] += " / " + content;
              else grid[rowIndex][h.dia] = content;
            });
          } else if (asig.cargo !== 'DOCENTE' && h.horario_texto) {
             const nonDocenteRange = getRange(h.horario_texto);
             if (!nonDocenteRange) return;

             turnoLabels.forEach((label, rowIndex) => {
               const labelRange = getRange(label);
               if (!labelRange) return;

               if (Math.max(labelRange.start, nonDocenteRange.start) < Math.min(labelRange.end, nonDocenteRange.end)) {
                 const plaza = h.plaza || '';
                 let content = `${asig.cargo}`;
                 if (plaza) content += ` - ${plaza}`;

                 if (grid[rowIndex][h.dia] !== "---") grid[rowIndex][h.dia] += " / " + content;
                 else grid[rowIndex][h.dia] = content;
               }
             });
          }
        });
      }
    });
    return grid;
  };

  const renderTable = (titulo, grid) => (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ textAlign: 'center', backgroundColor: '#eee', padding: '5px', border: '1px solid #999', borderBottom: 'none', margin: 0 }}>{titulo}</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', backgroundColor: 'white', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #999', padding: '4px' }}>HORARIO</th>
            {diasSemana.map(d => <th key={d} style={{ border: '1px solid #999', padding: '4px' }}>{d.toUpperCase()}</th>)}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #999', padding: '4px', fontWeight: 'bold' }}>{row.hora}</td>
              {diasSemana.map(d => <td key={d} style={{ border: '1px solid #999', padding: '4px', textAlign: 'center' }}>{row[d]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="pagina-submenu" style={{ backgroundImage: `url(${fondo})` }}>
      <NavBar goBack={goBack} goHome={goHome} />
      <h2>MIS HORARIOS</h2>
      <div className="contenido-submenu" style={{ width: "95%", maxWidth: "100%" }}>
        {!user ? (
          <p>Por favor, inicie sesión para ver sus horarios.</p>
        ) : loading ? (
          <p>Cargando horarios...</p>
        ) : assignments.length === 0 ? (
          <p>No se encontraron horarios asignados para {user.apellido}, {user.nombre}.</p>
        ) : (
          <>
            {renderTable("HORARIOS - TURNO MAÑANA", buildScheduleGrid(assignments, horariosMananaLabels, "Mañana"))}
            {renderTable("HORARIOS - TURNO TARDE", buildScheduleGrid(assignments, horariosTardeLabels, "Tarde"))}
          </>
        )}
      </div>
    </div>
  );
};
export default MisHorariosDocente;