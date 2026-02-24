// src/menuConfig.js

// Importamos los iconos aquí para que sea la única fuente de verdad
// --- Iconos Existentes ---
import iconPreceptoria from "./assets.css/iconos/Icono PRECEPTORIA1.jpg";
import iconBiblioteca from "./assets.css/iconos/Icono BIBLIOTECA1.jpg";

// --- Iconos para Módulos de Administración ---
import iconPersonalInstitucional from "./assets.css/iconos/Icono DOCENTES1.jpg";
import iconRegistroDocentes from "./assets.css/iconos/Icono REGISTRO DOCENTES1.jpg";
import iconRegistroAlumnos from "./assets.css/iconos/Icono REGISTRO ALUMNOS1.jpg";
import iconPlanillas from "./assets.css/iconos/Icono PLANILLAS1.jpg";
import iconNoticias from "./assets.css/iconos/ICONO NOTICIAS.jpg";

// --- Iconos Nuevos ---
import iconInstitucion from "./assets.css/iconos/Icono INSTITUCION.jpg";
import iconAdministracion from "./assets.css/iconos/Icono ADMINISTRACIÓN.jpg";
import iconDocentes from "./assets.css/iconos/Icono DOCENTES.jpg";
import iconAlumnos from "./assets.css/iconos/Icono ALUMNOS.jpg";
import iconGabinete from "./assets.css/iconos/Icono GABINETE.jpg";

export const menuConfig = [
  {
    title: "NUESTRA INSTITUCIÓN",
    action: "NuestraInstitucion",
    color: "blue",
    icono: iconInstitucion,
    subItems: [
      { name: "HISTORIA INSTITUCIONAL", action: "HistoriaInstitucional" },
      { name: "OFERTAS ACADÉMICAS", action: "OfertasAcademicas" },
      { name: "HORARIOS", action: "HorariosInstitucionales" },
      { name: "UNIFORME", action: "Uniforme" },
    ],
  },
  {
    title: "ADMINISTRACIÓN",
    action: "Administracion",
    color: "red",
    icono: iconAdministracion,
    // "subModules" es una propiedad nueva para el menú lateral anidado
    subModules: [
      {
        title: "PERSONAL INSTITUCIONAL",
        action: "Docentes", // La acción original se mantiene
        color: "blue", // Color para la página de Administración
        icono: iconDocentes,
        subItems: [
          { name: "CÓDIGOS", action: "DocentesCodigos" },
          { name: "ESTRUCTURA", action: "DocentesEstructura" },
          { name: "DATOS DE LEGAJO", action: "DocentesDatosLegajo" },
          { name: "LEGAJO PERSONAL", action: "DocentesLegajo" },
          { name: "PERSONAL POR DIA", action: "PersonalPorDia" },
          { name: "N° DE BOLETAS", action: "NumeroDeBoletas" },
          { name: "USUARIOS", action: "DocentesUsuarios" },
          { name: "HORARIOS 2023", action: "DocentesHorarios" },
          { name: "HORARIOS POR DÍA", action: "DocentesHorariosDia" },
          { name: "HORARIOS PARA IMPRIMIR", action: "DocentesHorariosImprimir" },
        ],
      },
      {
        title: "REGISTRO Y CONSTANCIAS DE DOCENTES",
        action: "RegistroDocentesConstancias",
        color: "orange",
        icono: iconRegistroDocentes,
        subItems: [
          { name: "REGISTRO DE ACTAS", action: "RegistroDocentesActas" },
          { name: "REGISTRO DE LICENCIAS", action: "RegistroDocentesLicencias" },
          { name: "RÉGIMEN DE LICENCIAS", action: "RegistroDocentesRegimenLicencias" },
          { name: "CONSTANCIAS DE SERVICIOS", action: "RegistroDocentesConstanciasServicios" },
          { name: "CONSTANCIAS DE AFECTACIONES", action: "RegistroDocentesConstanciasAfectaciones" },
          { name: "CONSTANCIAS DE PERMANENCIA", action: "RegistroDocentesConstanciasPermamencia" },
          { name: "CONSTANCIA DE TRABAJO", action: "RegistroDocentesConstanciaTrabajo" },
        ],
      },
      {
        title: "REGISTRO Y CONSTANCIA DE ALUMNOS",
        action: "RegistroAlumnosConstancias",
        color: "red",
        icono: iconRegistroAlumnos,
        subItems: [
          { name: "FICHA DEL ALUMNO", action: "RegistroAlumnosFilcha" },
          { name: "LIBRO MATRIZ", action: "RegistroAlumnosLibroMatriz" },
          { name: "BOLETO ESTUDIANTIL", action: "RegistroAlumnosBoletoEstudiantil" },
          { name: "CAUSAL DE VACANTE", action: "RegistroAlumnosCausalVacante" },
          { name: "ACTA DE EXAMEN", action: "RegistroAlumnosActaExamen" },
          { name: "PERMISOS DE EXAMEN", action: "RegistroAlumnosPermisosExamen" },
          { name: "CERTIFICADOS", action: "RegistroAlumnosCertificados" },
        ],
      },
      {
        title: "PLANILLAS Y ESTADÍSTICAS",
        action: "PlanillasEstadisticas",
        color: "purple",
        icono: iconPlanillas,
        subItems: [
          { name: "ESTADÍSTICA DE ALUMNOS", action: "PlanillasEstadisticaAlumnos" },
          { name: "APROBADOS Y DESAPROBADOS POR CURSO, DIVISIÓN Y MATERIA", action: "PlanillasAprobadosDesaprobados" },
          { name: "APROBADOS Y DESAPROBADOS (TOTALES)", action: "PlanillasAprobadosDesaprobadosTotales" },
          { name: "RIESGO PEDAGÓGICO", action: "PlanillasRiegoPedagogico" },
          { name: "ESTADÍSTICA GENERAL", action: "PlanillasEstadisticaGeneral" },
          { name: "CICLO BÁSICO", action: "PlanillasClicloBasico" },
          { name: "BACHILLER EN ECONOMÍA", action: "PlanillasBachillerEconomia" },
          { name: "BACHILLER EN INFORMÁTICA", action: "PlanillasBachillerInformatica" },
          { name: "LIBRETA", action: "PlanillasLibreta" },
          { name: "RAC", action: "PlanillasRAC" },
          { name: "ATACALAR", action: "PlanillasATACAAR" },
          {
            name: "COMPENDIOS",
            action: "PlanillasCompendios",
            subItems: [
              { name: "HABILITAR", action: "CompendiosHabilitar" },
              { name: "CARGADOS", action: "CompendiosCargados" },
            ],
          },
        ],
      },
      {
        title: "NOTICIAS",
        action: "Noticias",
        color: "gray",
        icono: iconNoticias,
        subItems: [
          { name: "MIS NOTICIAS", action: "MisNoticias" },
          { name: "NUEVA NOTICIA", action: "NuevaNoticia" },
        ],
      },
    ],
  },
  {
    title: "PRECEPTORÍA",
    action: "Preceptoria",
    color: "green",
    icono: iconPreceptoria,
    subItems: [
      { name: "CARGAR DATOS DE ALUMNOS", action: "PreceptoriaCargarDatos" },
      { name: "CARGAR ASISTENCIA DIARIA", action: "PreceptoriaAsistencia" },
      { name: "INFORME DE ASISTENCIA MENSUAL", action: "PreceptoriaInformeAsistencia" },
      { name: "CARGAR CALIFICACIONES DE ALUMNOS", action: "PreceptoriaCalificaciones" },
      { name: "COMPENDIOS EN BLANCO", action: "PreceptoriaPendiosBlanco" },
      { name: "COMPENDIOS CON NOTAS", action: "PreceptoriaPendiosNotas" },
      { name: "PLANILLA DE PRECEPTORES", action: "PreceptoriaPlanilla" },
      { name: "PLANILLAS DE SEGUIMIENTO EN BLANCO", action: "PreceptoriaSeguimientoBlanco" },
      { name: "PLANILLAS DE SEGUIMIENTO CON NOTAS", action: "PreceptoriaSeguimientoNotas" },
      { name: "LEGAJO DE ALUMNO", action: "LegajoDeAlumno" },
      { name: "NOTIFICACIONES / DERIVACIONES", action: "PreceptoriaNotificacionesDerivaciones" },
    ],
  },
  {
    title: "GABINETE",
    action: "Gabinete",
    color: "fuchsia",
    icono: iconGabinete,
    subItems: [
      { name: "ALUMNOS", action: "GabineteAlumnos" },
      { name: "DOCENTES", action: "GabineteDocentes" },
      { name: "PLANIFICACIONES", action: "GabinetePlanificaciones" },
      { name: "NOTIFICACIONES / DERIVACIONES", action: "GabineteNotificacionesDerivaciones" },
    ],
  },
  {
    title: "ALUMNOS",
    action: "Alumnos",
    color: "skyblue",
    icono: iconAlumnos,
    subItems: [
      { name: "MI LEGAJO", action: "MiLegajo" },
      { name: "MIS NOTAS", action: "MisNotas" },
      { name: "MIS CONSTANCIAS", action: "MisConstanciasAlumno" },
      { name: "MIS HORARIOS", action: "MisHorariosAlumno" },
      { name: "FECHAS IMPORTANTES", action: "FechasImportantes" },
      { name: "MIS NOTIFICACIONES", action: "MisNotificacionesAlumno" },
    ],
  },
  {
    title: "DOCENTES",
    action: "DocentesPortal",
    color: "goldenrod",
    icono: iconPersonalInstitucional,
    subItems: [
      { name: "MIS CURSOS", action: "MisCursos" },
      { name: "MIS HORARIOS", action: "MisHorariosDocente" },
      { name: "CARGAR NOTAS", action: "CargarNotas" },
      { name: "FECHAS DE EXAMEN", action: "FechasExamen" },
      { name: "SEGUIMIENTO POR ALUMNO", action: "SeguimientoPorAlumno" },
      { name: "SEGUIMIENTO POR CURSO", action: "SeguimientoPorCurso" },
      { name: "MIS LICENCIAS", action: "MisLicencias" },
      { name: "MIS CONSTANCIAS", action: "MisConstancias" },
      { name: "MIS PLANIFICACIONES", action: "MisPlanificaciones" },
      { name: "SALIDA EDUCATIVA", action: "SalidaEducativa" },
      { name: "NOTIFICACIONES / DERIVACIONES", action: "DocentesNotificacionesDerivaciones" },
    ],
  },
  {
    title: "BIBLIOTECA",
    action: "Biblioteca",
    color: "brown",
    icono: iconBiblioteca,
    subItems: [
      { name: "LIBROS", action: "BibliotecaLibros" },
      { name: "MOVIMIENTOS", action: "BibliotecaMovimientos" },
    ],
  },
];