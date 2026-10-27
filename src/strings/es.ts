// Spanish (U.S.) strings. Must mirror en.ts exactly; the Strings type enforces it.
// Uses formal "usted", as U.S. election offices do. Have a native speaker review before each release.
// footer.attribution stays in English on purpose: Google requires its exact wording if used.
import type { Strings } from "./en";

export const es: Strings = {
  locale: "es-US",
  lang: "es",
  appName: "Guía del Votante",
  tagline: "Todo lo que necesita para votar, a partir de una sola dirección.",
  skipToContent: "Saltar al contenido principal",

  language: {
    switchLabel: "English",
    switchLang: "en",
    switchAria: "View this page in English",
  },

  address: {
    label: "Su dirección residencial",
    hint: "Use la dirección donde está inscrito para votar. Incluya la ciudad y el estado, o el código postal.",
    placeholder: "123 Main St, Springfield, IL 62701",
    submit: "Buscar mi boleta",
    loading: "Buscando su elección…",
    useLocation: "Usar mi ubicación",
    locating: "Buscando su dirección…",
    locationError: "No pudimos obtener su ubicación. Por favor, escriba su dirección.",
    locationNote:
      "Su ubicación se envía a OpenStreetMap solo para completar el campo de dirección. No se guarda.",
    privacyNote: "Nunca guardamos su dirección. Solo queda en el enlace de esta página y en su navegador.",
    change: "Cambiar dirección",
  },

  pickElection: {
    title: "¿Qué elección?",
    intro: "Hay más de una elección disponible para esta dirección. Elija una para ver sus detalles.",
    choose: "Ver esta elección",
  },

  status: {
    noStreetSegmentFound:
      "Encontramos su dirección, pero los funcionarios electorales todavía no han publicado la información para votar en ella.",
    addressUnparseable:
      "No pudimos entender esa dirección. Escriba la dirección completa con ciudad y estado, por ejemplo “123 Main St, Springfield, IL”.",
    electionOver: "Esa elección ya terminó, así que su información ya no está disponible.",
    electionUnknown: "No hay una próxima elección con información publicada para esta dirección.",
    multipleStreetSegmentsFound:
      "Esa dirección coincide con más de un lugar. Agregue el número de apartamento, el código postal o el nombre completo de la calle.",
    noAddressParameter: "Por favor, escriba su dirección residencial.",
    badRequest: "Algo en la solicitud no salió bien. Por favor, inténtelo de nuevo.",
    rateLimited: "Mucha gente está buscando su boleta en este momento. Por favor, inténtelo de nuevo en un minuto.",
    upstreamUnavailable:
      "El servicio de datos electorales no responde en este momento. Mientras tanto, su oficina electoral puede ayudarle.",
    aiUnavailable: "El resumen en lenguaje sencillo no está disponible ahora. El texto oficial está abajo.",
    unknown: "Algo salió mal. Por favor, inténtelo de nuevo.",
  },

  fallback: {
    title: "Obtenga ayuda de una fuente oficial",
    stateLookup: "Encuentre su oficina electoral estatal o local",
    voteGov: "Vote.gov: información oficial para votar en EE. UU.",
  },

  noElection: {
    title: "No hay una próxima elección para esta dirección",
    intro:
      "Los detalles de la elección aparecen aquí cuando los funcionarios los publican, normalmente unas semanas antes del día de la elección.",
    listTitle: "Elecciones con información disponible ahora",
    listEmpty: "No hay elecciones en la lista en este momento.",
    districtsTitle: "Sus distritos",
  },

  districts: {
    title: "Sus distritos",
    intro: "Todos los distritos políticos que incluyen su dirección.",
    showId: "Mostrar ID de OCD",
    hideId: "Ocultar ID de OCD",
    loading: "Cargando distritos…",
    representedBy: "Quién ocupa este cargo ahora",
    noOfficeholders: "No hay funcionarios actuales en la lista para este distrito.",
    officeholdersLoading: "Cargando funcionarios…",
    officeholdersSource: "Datos de funcionarios: BallotReady",
    lookupTitle: "Encuentre quién le representa",
    lookupUsaGov: "USA.gov: encuentre a sus funcionarios electos",
    lookupOpenStates: "Open States: encuentre a sus legisladores estatales",
    yearRound: "La información de distritos funciona todo el año, aunque no haya elección.",
  },

  tabs: {
    label: "Secciones",
    vote: "Dónde votar",
    ballot: "Mi boleta",
    plan: "Mi plan",
    office: "Oficina electoral",
    districts: "Distritos",
  },

  results: {
    electionDay: (date: string) => `Día de la elección: ${date}`,
    checkBack:
      "Los funcionarios suelen actualizar los detalles en los últimos días. Vuelva a revisar antes de votar.",
    lastUpdated: (time: string) => `Datos actualizados por última vez: ${time}`,
    official: "Oficial",
    unofficial: "No marcado como oficial",
    sourceLabel: (names: string) => `Fuente: ${names}`,
  },

  vote: {
    title: "¿Dónde voto?",
    filters: "Mostrar",
    types: {
      election: "Día de la elección",
      early: "Votación anticipada",
      dropoff: "Buzón de boletas",
    },
    mapLabel: "Mapa de lugares de votación",
    mapNote: "Los lugares sin coordenadas aparecen en la lista de abajo, pero no en el mapa.",
    none: "Todavía no se han publicado lugares de este tipo para su dirección.",
    directions: "Cómo llegar",
    hours: "Horario",
    showAllHours: (n: number) => `Ver los ${n} días`,
    showFewerHours: "Ver menos días",
    dates: (start: string, end: string) => `Abierto del ${start} al ${end}`,
    distance: (miles: string) => `a ${miles} millas`,
    sortedByDistance: "Ordenados por distancia desde su ubicación.",
    sortHint: "Consejo: use “Usar mi ubicación” arriba para ordenar por distancia.",
    sortedFromPolling: "Ordenados por distancia desde su lugar de votación asignado.",
    mailOnlyTitle: "En su zona se vota por correo",
    mailOnlyBody:
      "Su boleta le llega por correo. Llénela, firme el sobre y devuélvala en un buzón de boletas, en un lugar de votación o por correo con matasellos a más tardar el día de la elección. Consulte las reglas de su estado para conocer las fechas límite exactas.",
    count: (n: number) => `${n} ${n === 1 ? "lugar" : "lugares"}`,
    showMore: (n: number) => `Ver ${n} ${n === 1 ? "lugar más" : "lugares más"}`,
  },

  ballot: {
    title: "Su boleta de muestra",
    intro:
      "Las contiendas y medidas aparecen en el mismo orden que en su boleta. Los candidatos aparecen exactamente como en la boleta.",
    marksNote:
      "Lo que marque se guarda solo en este navegador. Consulte las reglas locales antes de llevar notas al lugar de votación.",
    print: "Imprimir o guardar como PDF",
    clearMarks: "Borrar mis marcas",
    voteFor: (n: string) => `Vote por ${n}`,
    groups: {
      federal: "Federal",
      state: "Estatal",
      county: "Condado",
      city: "Ciudad",
      school: "Junta escolar",
      special: "Distrito especial",
      other: "En su boleta",
    },
    untitled: "Contienda sin título (consulte su boleta oficial)",
    noContests: "Todavía no se han publicado contiendas ni medidas para su dirección.",
    measure: "Medida electoral",
    readMeasure: "Leer sobre esta medida",
    research: "Información de candidatos",
    tooMany: (n: string) => `Marcó más de ${n}. En la boleta real, eso podría anular su voto en esta contienda.`,
    yes: "Sí",
    no: "No",
  },

  measure: {
    officialTitle: "Información oficial",
    subtitle: "Subtítulo",
    threshold: "Lo que necesita para aprobarse",
    abstain: "Si no vota en esta medida",
    pro: "Declaración oficial a favor",
    con: "Declaración oficial en contra",
    fullText: "Texto oficial completo",
    showFullText: "Mostrar el texto oficial completo",
    hideFullText: "Ocultar el texto oficial completo",
    moreInfo: "Más información de los funcionarios",
    aiTitle: "Resumen en lenguaje sencillo",
    aiLabel: "Resumen generado por IA; puede contener errores",
    aiLoading: "Escribiendo un resumen en lenguaje sencillo…",
    aiNoText:
      "Los funcionarios todavía no han publicado el texto de esta medida en nuestra fuente de datos, así que no hay resumen. Consulte su guía oficial para votantes.",
    q: {
      whatItDoes: "¿Qué hace?",
      ifPasses: "¿Qué cambia si se aprueba?",
      ifFails: "¿Qué sigue igual si no se aprueba?",
      whoIsAffected: "¿A quién afecta?",
    },
    report: "Reportar un problema con este resumen",
    back: "Volver a mi boleta",
  },

  candidate: {
    intro:
      "Los datos provienen de los funcionarios electorales. Lo que un candidato no haya proporcionado se omite; nunca lo adivinamos.",
    party: "Partido",
    website: "Sitio web de campaña",
    phone: "Teléfono",
    email: "Correo electrónico",
    social: "Redes sociales",
    searchNews: "Buscar noticias",
    newsNote:
      "Abre una búsqueda en la web con el nombre del candidato y el cargo. No elegimos ni ordenamos los resultados.",
    noParty: "Sin partido indicado",
    noDetails: "Los funcionarios no han publicado datos de contacto de este candidato.",
    photoAlt: (name: string) => `Foto de ${name}`,
    back: "Volver a mi boleta",
    channels: {
      Facebook: "Facebook",
      Twitter: "X (Twitter)",
      YouTube: "YouTube",
      Instagram: "Instagram",
      LinkedIn: "LinkedIn",
      GooglePlus: "Google+",
    },
  },

  plan: {
    title: "Mi plan para votar",
    intro: "Haga un plan, agréguelo a su calendario y compártalo. Su plan se guarda solo en este navegador.",
    method: "¿Cómo va a votar?",
    methods: {
      election: "El día de la elección",
      early: "Por anticipado, en persona",
      mail: "Por correo o en un buzón de boletas",
    },
    location: "¿Dónde?",
    chooseLocation: "Elija un lugar",
    noLocations: "Todavía no se han publicado lugares de este tipo. Aun así, puede guardar una fecha y una hora.",
    mailByPost: "La enviaré por correo",
    date: "Día",
    from: "Desde",
    to: "Hasta",
    save: "Guardar mi plan",
    edit: "Editar el plan",
    saved: "Plan guardado en este navegador.",
    myPlan: "Mi plan",
    empty: "Todavía no ha hecho un plan.",
    addCalendar: "Agregar al calendario (.ics)",
    googleCalendar: "Agregar a Google Calendar",
    share: "Compartir mi plan",
    copied: "Plan copiado. Péguelo en un mensaje para compartirlo.",
    remove: "Borrar el plan",
    reminderNote: "El calendario le recordará un día antes y dos horas antes.",
    eventTitle: (election: string) => `Votar: ${election}`,
    summary: (method: string, where: string, when: string) => `${method}${where ? ` en ${where}` : ""}, ${when}`,
    invalidTime: "La hora de fin debe ser después de la hora de inicio.",
    pastDate: "Elija un día entre hoy y el día de la elección.",
  },

  office: {
    title: "Su oficina electoral",
    state: "Oficina electoral estatal",
    local: "Oficina electoral local",
    hours: "Horario",
    physical: "Dirección de la oficina",
    mailing: "Dirección postal",
    officials: "Contactos",
    call: "Llamar al",
    emailAction: "Escribir a",
    links: {
      electionRegistrationUrl: "Inscribirse para votar",
      electionRegistrationConfirmationUrl: "Verificar mi inscripción",
      absenteeVotingInfoUrl: "Voto en ausencia",
      ballotInfoUrl: "Información de la boleta",
      electionRulesUrl: "Reglas electorales",
      votingLocationFinderUrl: "Buscar mi lugar de votación",
      electionInfoUrl: "Información electoral",
    },
    none: "Todavía no se han publicado los datos de contacto de su oficina electoral.",
  },

  notice: {
    label: "Aviso de los funcionarios electorales",
    more: "Más detalles",
  },

  footer: {
    attribution: "Voting information powered by the Civic Information API",
    nonpartisan: "Gratis e imparcial. No apoyamos a candidatos ni posturas.",
    notOfficial:
      "Esta aplicación le ayuda a prepararse para votar. La inscripción y el voto se hacen solo a través de los sistemas oficiales del estado y del condado.",
    privacy: "Privacidad",
  },

  privacy: {
    title: "Privacidad",
    back: "Volver",
    body: [
      "No tenemos cuentas de usuario y no guardamos su dirección. Solo queda en el enlace de esta página y en su propio navegador.",
      "Su plan para votar y las opciones que marque en su boleta de muestra se guardan solo en este navegador (localStorage). Si borra los datos del navegador, se eliminan.",
      "No hacemos análisis con las direcciones y no usamos rastreadores de terceros.",
      "Para buscar su elección, nuestro servidor envía su dirección a la Civic Information API de Google. Nuestro servidor nunca la registra.",
      "Si toca “Usar mi ubicación”, su navegador envía sus coordenadas a OpenStreetMap para encontrar su dirección. No las guardamos.",
      "Las imágenes del mapa vienen de OpenStreetMap. Las fotos de los candidatos, cuando aparecen, se cargan desde la dirección que dieron los funcionarios.",
      "Los resúmenes de las medidas los genera Claude, de Anthropic, a partir del texto oficial de cada medida. Su dirección no se envía a Anthropic.",
      "Cuando se muestran los funcionarios actuales, nuestro servidor envía solo los ID de sus distritos (no su dirección) a nuestro socio de datos, BallotReady.",
    ],
  },

  common: {
    loading: "Cargando…",
    retry: "Intentar de nuevo",
    close: "Cerrar",
    opensNewTab: "(se abre en una pestaña nueva)",
  },
};
