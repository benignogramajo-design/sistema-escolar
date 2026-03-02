import Home from "./pages.css/Home";
import NuestraInstitucion from "./pages.css/NuestraInstitucion";
import Administracion from "./pages.css/Administracion";
import Preceptoria from "./pages.css/Preceptoria";
import Gabinete from "./pages.css/Gabinete";
import Alumnos from "./pages.css/Alumnos";
import DocentesPortal from "./pages.css/DocentesPortal";
import Biblioteca from "./pages.css/Biblioteca";

// --- Submenús ---

// Nuestra Institución
import HistoriaInstitucional from "./pages.css/submenu/HistoriaInstitucional";
import OfertasAcademicas from "./pages.css/submenu/OfertasAcademicas";
import HorariosInstitucionales from "./pages.css/submenu/HorariosInstitucionales";
import Uniforme from "./pages.css/submenu/Uniforme";

// Administración - Personal Institucional
import Docentes from "./pages.css/submenu/Docentes"; // Página intermedia
import DocentesCodigos from "./pages.css/submenu/DocentesCodigos";
import DocentesEstructura from "./pages.css/submenu/DocentesEstructura";
import DocentesDatosLegajo from "./pages.css/submenu/DocentesDatosLegajo";
import DocentesLegajo from "./pages.css/submenu/DocentesLegajo";
import PersonalPorDia from "./pages.css/submenu/PersonalPorDia"; // RENOMBRADO
import NumeroDeBoletas from "./pages.css/submenu/NumeroDeBoletas";
import UsuariosPersonal from "./pages.css/submenu/UsuariosPersonal"; // Mapeado desde DocentesUsuarios
import DocentesHorarios from "./pages.css/submenu/DocentesHorarios";
import DocentesHorariosDia from "./pages.css/submenu/DocentesHorariosDia";
import DocentesHorariosImprimir from "./pages.css/submenu/DocentesHorariosImprimir";

// Administración - Registro y Constancias Docentes
import RegistroDocentesConstancias from "./pages.css/submenu/RegistroDocentesConstancias"; // Página intermedia
import RegistroDocentesActas from "./pages.css/submenu/RegistroDocentesActas";
import RegistroDocentesLicencias from "./pages.css/submenu/RegistroDocentesLicencias";
import RegistroDocentesRegimenLicencias from "./pages.css/submenu/RegistroDocentesRegimenLicencias";
import RegistroDocentesConstanciasServicios from "./pages.css/submenu/RegistroDocentesConstanciasServicios";
import RegistroDocentesConstanciasAfectaciones from "./pages.css/submenu/RegistroDocentesConstanciasAfectaciones";
import RegistroDocentesConstanciasPermanencia from "./pages.css/submenu/RegistroDocentesConstanciasPermanencia"; // RENOMBRADO
import RegistroDocentesConstanciaTrabajo from "./pages.css/submenu/RegistroDocentesConstanciaTrabajo";

// Administración - Registro y Constancia Alumnos
import RegistroAlumnosConstancias from "./pages.css/submenu/RegistroAlumnosConstancias"; // Página intermedia
import RegistroAlumnosFicha from "./pages.css/submenu/RegistroAlumnosFicha"; // RENOMBRADO
import RegistroAlumnosLibroMatriz from "./pages.css/submenu/RegistroAlumnosLibroMatriz";
import RegistroAlumnosBoletoEstudiantil from "./pages.css/submenu/RegistroAlumnosBoletoEstudiantil";
import RegistroAlumnosCausalVacante from "./pages.css/submenu/RegistroAlumnosCausalVacante";
import RegistroAlumnosActaExamen from "./pages.css/submenu/RegistroAlumnosActaExamen";
import RegistroAlumnosPermisosExamen from "./pages.css/submenu/RegistroAlumnosPermisosExamen";
import RegistroAlumnosCertificados from "./pages.css/submenu/RegistroAlumnosCertificados";

// Administración - Planillas y Estadísticas
import PlanillasEstadisticas from "./pages.css/submenu/PlanillasEstadisticas"; // Página intermedia
import PlanillasEstadisticaAlumnos from "./pages.css/submenu/PlanillasEstadisticaAlumnos";
import PlanillasAprobadosDesaprobados from "./pages.css/submenu/PlanillasAprobadosDesaprobados";
import PlanillasAprobadosDesaprobadosTotales from "./pages.css/submenu/PlanillasAprobadosDesaprobadosTotales";
import PlanillasRiesgoPedagogico from "./pages.css/submenu/PlanillasRiesgoPedagogico"; // RENOMBRADO
import PlanillasEstadisticaGeneral from "./pages.css/submenu/PlanillasEstadisticaGeneral";
import PlanillasCicloBasico from "./pages.css/submenu/PlanillasCicloBasico"; // RENOMBRADO
import PlanillasBachillerEconomia from "./pages.css/submenu/PlanillasBachillerEconomia";
import PlanillasBachillerInformatica from "./pages.css/submenu/PlanillasBachillerInformatica";
import PlanillasLibreta from "./pages.css/submenu/PlanillasLibreta";
import PlanillasRAC from "./pages.css/submenu/PlanillasRAC";
import PlanillasATACALAR from "./pages.css/submenu/PlanillasATACALAR"; // RENOMBRADO
import PlanillasMesasExamen from "./pages.css/submenu/PlanillasMesasExamen";
import PlanillasCompendios from "./pages.css/submenu/PlanillasCompendios"; // Página intermedia
import CompendiosHabilitar from "./pages.css/submenu/CompendiosHabilitar";
import CompendiosCargados from "./pages.css/submenu/CompendiosCargados";

// Administración - Noticias
import Noticias from "./pages.css/submenu/Noticias"; // Página intermedia
import MisNoticias from "./pages.css/submenu/MisNoticias";
import NuevaNoticia from "./pages.css/submenu/NuevaNoticia";

// Preceptoría
import PreceptoriaCargarDatos from "./pages.css/submenu/PreceptoriaCargarDatos";
import PreceptoriaAsistencia from "./pages.css/submenu/PreceptoriaAsistencia";
import PreceptoriaInformeAsistencia from "./pages.css/submenu/PreceptoriaInformeAsistencia";
import PreceptoriaCalificaciones from "./pages.css/submenu/PreceptoriaCalificaciones";
import PreceptoriaCompendiosBlanco from "./pages.css/submenu/PreceptoriaCompendiosBlanco"; // RENOMBRADO
import PreceptoriaCompendiosNotas from "./pages.css/submenu/PreceptoriaCompendiosNotas"; // RENOMBRADO
import PreceptoriaPlanilla from "./pages.css/submenu/PreceptoriaPlanilla";
import PreceptoriaSeguimientoBlanco from "./pages.css/submenu/PreceptoriaSeguimientoBlanco";
import PreceptoriaSeguimientoNotas from "./pages.css/submenu/PreceptoriaSeguimientoNotas";
import LegajoDeAlumno from "./pages.css/submenu/LegajoDeAlumno";
import PreceptoriaNotificacionesDerivaciones from "./pages.css/submenu/PreceptoriaNotificacionesDerivaciones";
import MesasDeExamen from "./pages.css/submenu/MesasDeExamen";

// Gabinete
import GabineteAlumnos from "./pages.css/submenu/GabineteAlumnos";
import GabineteDocentes from "./pages.css/submenu/GabineteDocentes";
import GabinetePlanificaciones from "./pages.css/submenu/GabinetePlanificaciones";
import GabineteNotificacionesDerivaciones from "./pages.css/submenu/GabineteNotificacionesDerivaciones";

// Alumnos
import MiLegajo from "./pages.css/submenu/MiLegajo";
import MisNotas from "./pages.css/submenu/MisNotas";
import MisConstanciasAlumno from "./pages.css/submenu/MisConstanciasAlumno";
import MisHorariosAlumno from "./pages.css/submenu/MisHorariosAlumno";
import FechasImportantes from "./pages.css/submenu/FechasImportantes";
import MisNotificacionesAlumno from "./pages.css/submenu/MisNotificacionesAlumno";

// Docentes (Portal)
import MisCursos from "./pages.css/submenu/MisCursos";
import MisHorariosDocente from "./pages.css/submenu/MisHorariosDocente";
import CargarNotas from "./pages.css/submenu/CargarNotas";
import FechasExamen from "./pages.css/submenu/FechasExamen";
import SeguimientoPorAlumno from "./pages.css/submenu/SeguimientoPorAlumno";
import SeguimientoPorCurso from "./pages.css/submenu/SeguimientoPorCurso";
import MisLicencias from "./pages.css/submenu/MisLicencias";
import MisConstancias from "./pages.css/submenu/MisConstancias";
import MisPlanificaciones from "./pages.css/submenu/MisPlanificaciones";
import SalidaEducativa from "./pages.css/submenu/SalidaEducativa";
import DocentesNotificacionesDerivaciones from "./pages.css/submenu/DocentesNotificacionesDerivaciones";

// Biblioteca
import BibliotecaLibros from "./pages.css/submenu/BibliotecaLibros";
import BibliotecaMovimientos from "./pages.css/submenu/BibliotecaMovimientos";

// Componente genérico para páginas intermedias faltantes
import SubModuloPage from "./pages.css/submenu/SubModuloPage";

export const pageMap = {
  // Principales
  Home: { component: Home },
  NuestraInstitucion: { component: NuestraInstitucion },
  Administracion: { component: Administracion },
  Preceptoria: { component: Preceptoria },
  Gabinete: { component: Gabinete },
  Alumnos: { component: Alumnos },
  DocentesPortal: { component: DocentesPortal },
  Biblioteca: { component: Biblioteca },

  // Submenús
  HistoriaInstitucional: { component: HistoriaInstitucional }, OfertasAcademicas: { component: OfertasAcademicas }, HorariosInstitucionales: { component: HorariosInstitucionales }, Uniforme: { component: Uniforme },
  Docentes: { component: Docentes }, DocentesCodigos: { component: DocentesCodigos }, DocentesEstructura: { component: DocentesEstructura }, DocentesDatosLegajo: { component: DocentesDatosLegajo }, DocentesLegajo: { component: DocentesLegajo }, PersonalPorDia: { component: PersonalPorDia }, NumeroDeBoletas: { component: NumeroDeBoletas }, DocentesUsuarios: { component: UsuariosPersonal }, DocentesHorarios: { component: DocentesHorarios }, DocentesHorariosDia: { component: DocentesHorariosDia }, DocentesHorariosImprimir: { component: DocentesHorariosImprimir },
  RegistroDocentesConstancias: { component: RegistroDocentesConstancias }, RegistroDocentesActas: { component: RegistroDocentesActas }, RegistroDocentesLicencias: { component: RegistroDocentesLicencias }, RegistroDocentesRegimenLicencias: { component: RegistroDocentesRegimenLicencias }, RegistroDocentesConstanciasServicios: { component: RegistroDocentesConstanciasServicios }, RegistroDocentesConstanciasAfectaciones: { component: RegistroDocentesConstanciasAfectaciones }, RegistroDocentesConstanciasPermanencia: { component: RegistroDocentesConstanciasPermanencia }, RegistroDocentesConstanciaTrabajo: { component: RegistroDocentesConstanciaTrabajo },
  RegistroAlumnosConstancias: { component: RegistroAlumnosConstancias }, RegistroAlumnosFicha: { component: RegistroAlumnosFicha }, RegistroAlumnosLibroMatriz: { component: RegistroAlumnosLibroMatriz }, RegistroAlumnosBoletoEstudiantil: { component: RegistroAlumnosBoletoEstudiantil }, RegistroAlumnosCausalVacante: { component: RegistroAlumnosCausalVacante }, RegistroAlumnosActaExamen: { component: RegistroAlumnosActaExamen }, RegistroAlumnosPermisosExamen: { component: RegistroAlumnosPermisosExamen }, RegistroAlumnosCertificados: { component: RegistroAlumnosCertificados },
  PlanillasEstadisticas: { component: PlanillasEstadisticas }, PlanillasEstadisticaAlumnos: { component: PlanillasEstadisticaAlumnos }, PlanillasAprobadosDesaprobados: { component: PlanillasAprobadosDesaprobados }, PlanillasAprobadosDesaprobadosTotales: { component: PlanillasAprobadosDesaprobadosTotales }, PlanillasRiesgoPedagogico: { component: PlanillasRiesgoPedagogico }, PlanillasEstadisticaGeneral: { component: PlanillasEstadisticaGeneral }, PlanillasCicloBasico: { component: PlanillasCicloBasico }, PlanillasBachillerEconomia: { component: PlanillasBachillerEconomia }, PlanillasBachillerInformatica: { component: PlanillasBachillerInformatica }, PlanillasLibreta: { component: PlanillasLibreta }, PlanillasRAC: { component: PlanillasRAC }, PlanillasATACALAR: { component: PlanillasATACALAR }, PlanillasMesasExamen: { component: PlanillasMesasExamen },
  PlanillasCompendios: { component: PlanillasCompendios }, CompendiosHabilitar: { component: CompendiosHabilitar }, CompendiosCargados: { component: CompendiosCargados },
  Noticias: { component: Noticias }, MisNoticias: { component: MisNoticias }, NuevaNoticia: { component: NuevaNoticia },
  
  PreceptoriaCargarDatos: { component: PreceptoriaCargarDatos }, PreceptoriaAsistencia: { component: PreceptoriaAsistencia }, PreceptoriaInformeAsistencia: { component: PreceptoriaInformeAsistencia }, PreceptoriaCalificaciones: { component: PreceptoriaCalificaciones }, PreceptoriaCompendiosBlanco: { component: PreceptoriaCompendiosBlanco }, PreceptoriaCompendiosNotas: { component: PreceptoriaCompendiosNotas }, PreceptoriaPlanilla: { component: PreceptoriaPlanilla }, PreceptoriaSeguimientoBlanco: { component: PreceptoriaSeguimientoBlanco }, PreceptoriaSeguimientoNotas: { component: PreceptoriaSeguimientoNotas }, LegajoDeAlumno: { component: LegajoDeAlumno }, PreceptoriaNotificacionesDerivaciones: { component: PreceptoriaNotificacionesDerivaciones, needsNavigate: true }, MesasDeExamen: { component: MesasDeExamen },
  
  GabineteAlumnos: { component: GabineteAlumnos }, GabineteDocentes: { component: GabineteDocentes }, GabinetePlanificaciones: { component: GabinetePlanificaciones }, GabineteNotificacionesDerivaciones: { component: GabineteNotificacionesDerivaciones, needsNavigate: true },
  
  MiLegajo: { component: MiLegajo }, MisNotas: { component: MisNotas }, MisConstanciasAlumno: { component: MisConstanciasAlumno }, MisHorariosAlumno: { component: MisHorariosAlumno }, FechasImportantes: { component: FechasImportantes }, MisNotificacionesAlumno: { component: MisNotificacionesAlumno },
  
  MisCursos: { component: MisCursos }, MisHorariosDocente: { component: MisHorariosDocente }, CargarNotas: { component: CargarNotas }, FechasExamen: { component: FechasExamen }, SeguimientoPorAlumno: { component: SeguimientoPorAlumno }, SeguimientoPorCurso: { component: SeguimientoPorCurso }, MisLicencias: { component: MisLicencias }, MisConstancias: { component: MisConstancias }, MisPlanificaciones: { component: MisPlanificaciones, needsNavigate: true }, SalidaEducativa: { component: SalidaEducativa, needsNavigate: true }, DocentesNotificacionesDerivaciones: { component: DocentesNotificacionesDerivaciones, needsNavigate: true },
  
  BibliotecaLibros: { component: BibliotecaLibros }, BibliotecaMovimientos: { component: BibliotecaMovimientos },

  // Sub-rutas de navegación interna (no en menú principal pero accesibles)
  // La siguiente línea probablemente causaba un error de build porque el import dinámico no es un componente válido de React.
  // Se ha comentado para solucionarlo, ya que la página no parece estar en uso.
  // PreceptoriaNotificaciones: { component: SubModuloPage },
};