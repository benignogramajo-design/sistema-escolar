// src/navigationMap.js

// Main pages
import Home from "./pages.css/Home";
import Administracion from "./pages.css/Administracion";
import NuestraInstitucion from "./pages.css/NuestraInstitucion";
import DocentesPortal from "./pages.css/DocentesPortal";
import Alumnos from "./pages.css/Alumnos";
import Preceptoria from "./pages.css/Preceptoria";
import PersonalInstitucional from "./pages.css/PersonalInstitucional";
import Biblioteca from "./pages.css/Biblioteca";
import RegistroDocentesConstancias from "./pages.css/submenu/RegistroDocentesConstancias";
import RegistroAlumnosConstancias from "./pages.css/submenu/RegistroAlumnosConstancias";
import PlanillasEstadisticas from "./pages.css/submenu/PlanillasEstadisticas";
import Gabinete from "./pages.css/Gabinete";

// Sub-páginas de Nuestra Institución
import HistoriaInstitucional from "./pages.css/submenu/HistoriaInstitucional";
import OfertasAcademicas from "./pages.css/submenu/OfertasAcademicas";
import HorariosInstitucionales from "./pages.css/submenu/HorariosInstitucionales";
import Uniforme from "./pages.css/submenu/Uniforme";

// Sub-páginas del portal Docentes
import MisCursos from "./pages.css/submenu/MisCursos";
import MisHorariosDocente from "./pages.css/submenu/MisHorariosDocente";
import CargarNotas from "./pages.css/submenu/CargarNotas";
import FechasExamen from "./pages.css/submenu/FechasExamen";
import MisLicencias from "./pages.css/submenu/MisLicencias";
import MisConstancias from "./pages.css/submenu/MisConstancias";
import SeguimientoPorAlumno from "./pages.css/submenu/SeguimientoPorAlumno";
import SeguimientoPorCurso from "./pages.css/submenu/SeguimientoPorCurso";
import MisPlanificaciones from "./pages.css/submenu/MisPlanificaciones";
import VerPlanificaciones from "./pages.css/submenu/VerPlanificaciones";
import NuevaPlanificacion from "./pages.css/submenu/NuevaPlanificacion";
import SalidaEducativa from "./pages.css/submenu/SalidaEducativa";
import NuevaSalidaEducativa from "./pages.css/submenu/NuevaSalidaEducativa";
import VerSalidasEducativas from "./pages.css/submenu/VerSalidasEducativas";

// Sub-páginas del portal Alumnos
import MiLegajo from "./pages.css/submenu/MiLegajo";
import MisNotas from "./pages.css/submenu/MisNotas";
import MisConstanciasAlumno from "./pages.css/submenu/MisConstanciasAlumno";
import MisHorariosAlumno from "./pages.css/submenu/MisHorariosAlumno";
import FechasImportantes from "./pages.css/submenu/FechasImportantes";
import MisNotificacionesAlumno from "./pages.css/submenu/MisNotificacionesAlumno";

// Sub pages Preceptoria
import PreceptoriaCargarDatos from "./pages.css/submenu/PreceptoriaCargarDatos";
import PreceptoriaAsistencia from "./pages.css/submenu/PreceptoriaAsistencia";
import LegajoDeAlumno from "./pages.css/submenu/LegajoDeAlumno";
import PreceptoriaInformeAsistencia from "./pages.css/submenu/PreceptoriaInformeAsistencia";
import PreceptoriaCalificaciones from "./pages.css/submenu/PreceptoriaCalificaciones";
import PreceptoriaPendiosBlanco from "./pages.css/submenu/PreceptoriaPendiosBlanco";
import PreceptoriaPendiosNotas from "./pages.css/submenu/PreceptoriaPendiosNotas";
import PreceptoriaPlanilla from "./pages.css/submenu/PreceptoriaPlanilla";
import PreceptoriaSeguimientoBlanco from "./pages.css/submenu/PreceptoriaSeguimientoBlanco";
import PreceptoriaSeguimientoNotas from "./pages.css/submenu/PreceptoriaSeguimientoNotas";
import PreceptoriaNotificacionesDerivaciones from "./pages.css/submenu/PreceptoriaNotificacionesDerivaciones";
import PreceptoriaNotificaciones from "./pages.css/submenu/PreceptoriaNotificaciones";
import PreceptoriaDerivaciones from "./pages.css/submenu/PreceptoriaDerivaciones";

// Sub pages Docentes
import DocentesCodigos from "./pages.css/submenu/DocentesCodigos";
import DocentesEstructura from "./pages.css/submenu/DocentesEstructura";
import DocentesHorarios from "./pages.css/submenu/DocentesHorarios";
import DocentesHorariosDia from "./pages.css/submenu/DocentesHorariosDia";
import DocentesHorariosImprimir from "./pages.css/submenu/DocentesHorariosImprimir";
import DocentesDatosLegajo from "./pages.css/submenu/DocentesDatosLegajo";
import DocentesLegajo from "./pages.css/submenu/DocentesLegajo";
import DocentesUsuarios from "./pages.css/submenu/DocentesUsuarios";
import UsuariosPersonal from "./pages.css/submenu/UsuariosPersonal";
import UsuariosAlumnos from "./pages.css/submenu/UsuariosAlumnos";

// Sub pages Biblioteca
import BibliotecaLibros from "./pages.css/submenu/BibliotecaLibros";
import BibliotecaMovimientos from "./pages.css/submenu/BibliotecaMovimientos";

// Sub pages RegistroDocentes
import RegistroDocentesActas from "./pages.css/submenu/RegistroDocentesActas";
import RegistroDocentesLicencias from "./pages.css/submenu/RegistroDocentesLicencias";
import RegistroDocentesRegimenLicencias from "./pages.css/submenu/RegistroDocentesRegimenLicencias";
import RegistroDocentesConstanciasServicios from "./pages.css/submenu/RegistroDocentesConstanciasServicios";
import RegistroDocentesConstanciasAfectaciones from "./pages.css/submenu/RegistroDocentesConstanciasAfectaciones";
import RegistroDocentesConstanciasPermamencia from "./pages.css/submenu/RegistroDocentesConstanciasPermamencia";
import RegistroDocentesConstanciaTrabajo from "./pages.css/submenu/RegistroDocentesConstanciaTrabajo";

// Sub pages RegistroAlumnos
import RegistroAlumnosFilcha from "./pages.css/submenu/RegistroAlumnosFilcha";
import RegistroAlumnosLibroMatriz from "./pages.css/submenu/RegistroAlumnosLibroMatriz";
import RegistroAlumnosBoletoEstudiantil from "./pages.css/submenu/RegistroAlumnosBoletoEstudiantil";
import RegistroAlumnosCausalVacante from "./pages.css/submenu/RegistroAlumnosCausalVacante";
import RegistroAlumnosActaExamen from "./pages.css/submenu/RegistroAlumnosActaExamen";
import RegistroAlumnosPermisosExamen from "./pages.css/submenu/RegistroAlumnosPermisosExamen";
import RegistroAlumnosCertificados from "./pages.css/submenu/RegistroAlumnosCertificados";

// Sub pages PlanillasEstadisticas
import PlanillasEstadisticaAlumnos from "./pages.css/submenu/PlanillasEstadisticaAlumnos";
import PlanillasAprobadosDesaprobados from "./pages.css/submenu/PlanillasAprobadosDesaprobados";
import PlanillasAprobadosDesaprobadosTotales from "./pages.css/submenu/PlanillasAprobadosDesaprobadosTotales";
import PlanillasRiegoPedagogico from "./pages.css/submenu/PlanillasRiegoPedagogico";
import PlanillasEstadisticaGeneral from "./pages.css/submenu/PlanillasEstadisticaGeneral";
import PlanillasClicloBasico from "./pages.css/submenu/PlanillasClicloBasico";
import PlanillasBachillerEconomia from "./pages.css/submenu/PlanillasBachillerEconomia";
import PlanillasBachillerInformatica from "./pages.css/submenu/PlanillasBachillerInformatica";
import PlanillasLibreta from "./pages.css/submenu/PlanillasLibreta";
import PlanillasRAC from "./pages.css/submenu/PlanillasRAC";
import PlanillasATACAAR from "./pages.css/submenu/PlanillasATACAAR";

// Sub pages Gabinete
import GabineteAlumnos from "./pages.css/submenu/GabineteAlumnos";
import GabineteDocentes from "./pages.css/submenu/GabineteDocentes";
import GabinetePlanificaciones from "./pages.css/submenu/GabinetePlanificaciones";
import GabineteNotificaciones from "./pages.css/submenu/GabineteNotificaciones";
import GabineteDerivaciones from "./pages.css/submenu/GabineteDerivaciones";

// --- PÁGINAS NUEVAS ---

// Sub-páginas de Administración -> Noticias
import Noticias from "./pages.css/submenu/Noticias";
import MisNoticias from "./pages.css/submenu/MisNoticias";
import NuevaNoticia from "./pages.css/submenu/NuevaNoticia";

// Sub-página de Preceptoría -> Notificaciones
import PreceptoriaRecibidosEnviados from "./pages.css/submenu/PreceptoriaRecibidosEnviados";

// Sub-páginas de Gabinete -> Notificaciones
import GabineteNotificacionesDerivaciones from "./pages.css/submenu/GabineteNotificacionesDerivaciones";
import GabineteRecibidosEnviados from "./pages.css/submenu/GabineteRecibidosEnviados";

// Sub-páginas de Docentes -> Notificaciones
import DocentesNotificacionesDerivaciones from "./pages.css/submenu/DocentesNotificacionesDerivaciones";
import DocentesNotificaciones from "./pages.css/submenu/DocentesNotificaciones";
import DocentesDerivaciones from "./pages.css/submenu/DocentesDerivaciones";
import DocentesRecibidosEnviados from "./pages.css/submenu/DocentesRecibidosEnviados";



export const pageMap = {
  Home: { component: Home, needsNavigate: true },
  Administracion: { component: Administracion, needsNavigate: true },
  NuestraInstitucion: { component: NuestraInstitucion, needsNavigate: true },
  DocentesPortal: { component: DocentesPortal, needsNavigate: true },
  Alumnos: { component: Alumnos, needsNavigate: true },
  Preceptoria: { component: Preceptoria, needsNavigate: true },
  Docentes: { component: PersonalInstitucional, needsNavigate: true },
  Biblioteca: { component: Biblioteca, needsNavigate: true },
  RegistroDocentesConstancias: { component: RegistroDocentesConstancias, needsNavigate: true },
  RegistroAlumnosConstancias: { component: RegistroAlumnosConstancias, needsNavigate: true },
  PlanillasEstadisticas: { component: PlanillasEstadisticas, needsNavigate: true },
  Gabinete: { component: Gabinete, needsNavigate: true },

  // Mapeo de sub-páginas de Nuestra Institución
  HistoriaInstitucional: { component: HistoriaInstitucional },
  OfertasAcademicas: { component: OfertasAcademicas },
  HorariosInstitucionales: { component: HorariosInstitucionales },
  Uniforme: { component: Uniforme },

  // Mapeo de sub-páginas del portal Docentes
  MisCursos: { component: MisCursos },
  MisHorariosDocente: { component: MisHorariosDocente },
  CargarNotas: { component: CargarNotas },
  FechasExamen: { component: FechasExamen },
  MisLicencias: { component: MisLicencias },
  MisConstancias: { component: MisConstancias },
  SeguimientoPorAlumno: { component: SeguimientoPorAlumno },
  SeguimientoPorCurso: { component: SeguimientoPorCurso },
  MisPlanificaciones: { component: MisPlanificaciones, needsNavigate: true },
  VerPlanificaciones: { component: VerPlanificaciones },
  NuevaPlanificacion: { component: NuevaPlanificacion },
  SalidaEducativa: { component: SalidaEducativa, needsNavigate: true },
  NuevaSalidaEducativa: { component: NuevaSalidaEducativa },
  VerSalidasEducativas: { component: VerSalidasEducativas },

  // Mapeo de sub-páginas del portal Alumnos
  MiLegajo: { component: MiLegajo },
  MisNotas: { component: MisNotas },
  MisConstanciasAlumno: { component: MisConstanciasAlumno },
  MisHorariosAlumno: { component: MisHorariosAlumno },
  FechasImportantes: { component: FechasImportantes },
  MisNotificacionesAlumno: { component: MisNotificacionesAlumno },

  PreceptoriaCargarDatos: { component: PreceptoriaCargarDatos },
  PreceptoriaAsistencia: { component: PreceptoriaAsistencia },
  LegajoDeAlumno: { component: LegajoDeAlumno },
  PreceptoriaInformeAsistencia: { component: PreceptoriaInformeAsistencia },
  PreceptoriaCalificaciones: { component: PreceptoriaCalificaciones },
  PreceptoriaPendiosBlanco: { component: PreceptoriaPendiosBlanco },
  PreceptoriaPendiosNotas: { component: PreceptoriaPendiosNotas },
  PreceptoriaPlanilla: { component: PreceptoriaPlanilla },
  PreceptoriaSeguimientoBlanco: { component: PreceptoriaSeguimientoBlanco },
  PreceptoriaSeguimientoNotas: { component: PreceptoriaSeguimientoNotas },
  PreceptoriaNotificacionesDerivaciones: { component: PreceptoriaNotificacionesDerivaciones, needsNavigate: true },
  PreceptoriaNotificaciones: { component: PreceptoriaNotificaciones },
  PreceptoriaDerivaciones: { component: PreceptoriaDerivaciones },
  DocentesCodigos: { component: DocentesCodigos },
  DocentesEstructura: { component: DocentesEstructura },
  DocentesHorarios: { component: DocentesHorarios },
  DocentesHorariosDia: { component: DocentesHorariosDia },
  DocentesHorariosImprimir: { component: DocentesHorariosImprimir },
  DocentesDatosLegajo: { component: DocentesDatosLegajo },
  DocentesLegajo: { component: DocentesLegajo },
  BibliotecaLibros: { component: BibliotecaLibros },
  BibliotecaMovimientos: { component: BibliotecaMovimientos },
  RegistroDocentesActas: { component: RegistroDocentesActas },
  RegistroDocentesLicencias: { component: RegistroDocentesLicencias },
  RegistroDocentesRegimenLicencias: { component: RegistroDocentesRegimenLicencias },
  RegistroDocentesConstanciasServicios: { component: RegistroDocentesConstanciasServicios },
  RegistroDocentesConstanciasAfectaciones: { component: RegistroDocentesConstanciasAfectaciones },
  RegistroDocentesConstanciasPermamencia: { component: RegistroDocentesConstanciasPermamencia },
  RegistroDocentesConstanciaTrabajo: { component: RegistroDocentesConstanciaTrabajo },
  RegistroAlumnosFilcha: { component: RegistroAlumnosFilcha },
  RegistroAlumnosLibroMatriz: { component: RegistroAlumnosLibroMatriz },
  RegistroAlumnosBoletoEstudiantil: { component: RegistroAlumnosBoletoEstudiantil },
  RegistroAlumnosCausalVacante: { component: RegistroAlumnosCausalVacante },
  RegistroAlumnosActaExamen: { component: RegistroAlumnosActaExamen },
  RegistroAlumnosPermisosExamen: { component: RegistroAlumnosPermisosExamen },
  RegistroAlumnosCertificados: { component: RegistroAlumnosCertificados },
  PlanillasEstadisticaAlumnos: { component: PlanillasEstadisticaAlumnos },
  PlanillasAprobadosDesaprobados: { component: PlanillasAprobadosDesaprobados },
  PlanillasAprobadosDesaprobadosTotales: { component: PlanillasAprobadosDesaprobadosTotales },
  PlanillasRiegoPedagogico: { component: PlanillasRiegoPedagogico },
  PlanillasEstadisticaGeneral: { component: PlanillasEstadisticaGeneral },
  PlanillasClicloBasico: { component: PlanillasClicloBasico },
  PlanillasBachillerEconomia: { component: PlanillasBachillerEconomia },
  PlanillasBachillerInformatica: { component: PlanillasBachillerInformatica },
  PlanillasLibreta: { component: PlanillasLibreta },
  PlanillasRAC: { component: PlanillasRAC },
  PlanillasATACAAR: { component: PlanillasATACAAR },
  GabineteAlumnos: { component: GabineteAlumnos },
  GabineteDocentes: { component: GabineteDocentes },
  GabinetePlanificaciones: { component: GabinetePlanificaciones },
  GabineteNotificaciones: { component: GabineteNotificaciones },
  GabineteDerivaciones: { component: GabineteDerivaciones },

  // --- MAPEO DE PÁGINAS NUEVAS ---

  // Administración
  Noticias: { component: Noticias, needsNavigate: true },
  MisNoticias: { component: MisNoticias },
  NuevaNoticia: { component: NuevaNoticia },

  // Preceptoría
  PreceptoriaRecibidosEnviados: { component: PreceptoriaRecibidosEnviados },

  // Gabinete
  GabineteNotificacionesDerivaciones: { component: GabineteNotificacionesDerivaciones, needsNavigate: true },
  GabineteRecibidosEnviados: { component: GabineteRecibidosEnviados },

  // Docentes
  DocentesNotificacionesDerivaciones: { component: DocentesNotificacionesDerivaciones, needsNavigate: true },
  DocentesNotificaciones: { component: DocentesNotificaciones },
  DocentesDerivaciones: { component: DocentesDerivaciones },
  DocentesRecibidosEnviados: { component: DocentesRecibidosEnviados },

  // Usuarios en Personal Institucional
  DocentesUsuarios: { component: DocentesUsuarios, needsNavigate: true },
  UsuariosPersonal: { component: UsuariosPersonal },
  UsuariosAlumnos: { component: UsuariosAlumnos },
};