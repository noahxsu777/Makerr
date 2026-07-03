export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readMinutes: number;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "por-que-cobramos-una-comision-fija",
    title: "Por qué cobramos una comisión fija (y no la escondemos en la tasa)",
    excerpt:
      "La mayoría de las remesadoras no cobran comisión... y suben el margen de la tasa de cambio hasta 8%. Te explicamos por qué preferimos hacerlo al revés.",
    category: "Transparencia",
    date: "2026-06-02",
    readMinutes: 4,
    content: [
      "Cuando una app dice \"0% de comisión\", casi siempre significa que el costo real está escondido en la tasa de cambio que te ofrecen. Es una práctica común en la industria: te muestran un envío \"gratis\" mientras te dan pesos, quetzales o soles por debajo del valor real del mercado. La diferencia se la queda la empresa.",
      "En Lukea decidimos hacerlo distinto: cobramos una comisión fija y visible ($2.99 USD para envíos de hasta $1,000, $15 USD hasta $2,500) y aplicamos un margen pequeño y consistente sobre la tasa de cambio en tiempo real. Ese margen se muestra en la calculadora antes de que confirmes nada — no hay letra pequeña.",
      "¿Por qué importa esto? Porque cuando el costo está escondido en la tasa, es casi imposible comparar entre remesadoras sin hacer cuentas. Cuando el costo es un número fijo que ves de entrada, comparar es instantáneo: ves cuánto pagas, ves cuánto llega, y decides con toda la información.",
      "Seguiremos ajustando estos números con el tiempo — de hecho el margen que aplicamos sobre la tasa ha bajado varias veces este año — pero el principio no cambia: si te cobramos algo, lo vas a ver.",
    ],
  },
  {
    slug: "guia-formas-de-entrega-2026",
    title: "Guía rápida: cuál forma de entrega elegir según lo que necesites",
    excerpt:
      "Billetera móvil, depósito bancario, efectivo, tarjeta, domicilio, recarga, servicios o cripto. Te explicamos cuándo conviene cada una.",
    category: "Guías",
    date: "2026-05-18",
    readMinutes: 5,
    content: [
      "Una de las preguntas que más nos hacen es: \"¿cuál forma de entrega es mejor?\" La respuesta corta es: depende de quién recibe el dinero y qué tan rápido lo necesita.",
      "Si tu familiar usa Nequi, Yape, DaviPlata o Mercado Pago todos los días, la billetera móvil es casi siempre la opción más rápida: el dinero suele estar disponible en minutos y no requiere que nadie salga de casa.",
      "El depósito bancario tradicional sigue siendo el más usado para montos grandes o para quienes prefieren tener el dinero en una cuenta de banco formal — llega el mismo día hábil en la mayoría de los casos.",
      "El retiro en efectivo es ideal cuando el destinatario no tiene cuenta bancaria o billetera digital, o simplemente prefiere el efectivo en mano. Con más de 55,000 puntos de pago en la región, casi siempre hay uno cerca.",
      "Las opciones más nuevas — recarga de tarjeta débito, entrega a domicilio, recarga de celular, pago de servicios y retiro cripto en USDC — existen para casos específicos: alguien que necesita saldo en su celular ya, o que prefiere resolver el recibo de luz directamente en vez de mandar efectivo.",
      "No hay una respuesta universal. Por eso dejamos las ocho opciones abiertas en cada envío, en vez de forzarte a una sola.",
    ],
  },
  {
    slug: "usdc-solana-remesas",
    title: "Por qué agregamos USDC por Solana como forma de pago",
    excerpt:
      "Las stablecoins están cambiando cómo se mueve el dinero entre países. Esto es lo que significa para alguien que envía remesas.",
    category: "Producto",
    date: "2026-04-30",
    readMinutes: 4,
    content: [
      "USDC es una stablecoin: cada token vale un dólar y está respaldado por reservas en efectivo y bonos del Tesoro de EE.UU. A diferencia de otras criptomonedas, no sube ni baja de valor — por diseño se mantiene estable frente al dólar.",
      "Eso la hace útil para algo muy concreto: mover valor entre personas sin pasar por el sistema bancario tradicional, con confirmaciones rápidas y costos de red bajos en Solana.",
      "Agregamos USDC como método de pago porque parte de nuestra comunidad ya lo usa para ahorrar o para recibir pagos del extranjero, y queríamos darles una forma de convertir esos fondos en remesas sin fricción adicional.",
      "Así funciona hoy: eliges USDC como forma de pago, te mostramos un código QR con el monto exacto (usando el estándar Solana Pay), envías desde tu wallet, subes una captura como comprobante, y tu envío queda en revisión mientras confirmamos la transacción en la red. No es instantáneo todavía — pero es el primer paso hacia pagos con stablecoins integrados de punta a punta.",
    ],
  },
  {
    slug: "como-verificamos-tu-cuenta-en-90-segundos",
    title: "Cómo verificamos tu cuenta en 90 segundos (y por qué es seguro)",
    excerpt:
      "Sin sucursales, sin papeleo, sin esperar días. Te contamos qué pasa detrás de cámaras cuando creas tu cuenta.",
    category: "Seguridad",
    date: "2026-04-11",
    readMinutes: 3,
    content: [
      "Crear una cuenta en Lukea toma menos de dos minutos porque diseñamos el proceso para pedir solo lo esencial: tu identificación y algunos datos básicos. Nada de citas, nada de sucursales.",
      "Detrás de ese formulario simple hay cifrado de nivel bancario (AES-256) protegiendo tu información en todo momento, y nunca guardamos los datos completos de tu tarjeta en nuestros servidores — eso lo maneja directamente Stripe, nuestro procesador de pagos, que cumple con los estándares más altos de seguridad de la industria (PCI DSS nivel 1).",
      "¿Por qué confiar en un proceso tan rápido? Porque rápido no significa menos seguro — significa que quitamos la fricción que no aporta seguridad real (como pedirte que llenes el mismo dato tres veces) y mantuvimos la que sí importa.",
    ],
  },
  {
    slug: "por-que-mas-paises-que-nadie",
    title: "22 países, 16 monedas: por qué apostamos por cobertura amplia",
    excerpt:
      "La mayoría de las remesadoras se enfocan en dos o tres países. Nosotros decidimos ir más amplio desde el día uno.",
    category: "Compañía",
    date: "2026-03-22",
    readMinutes: 3,
    content: [
      "Cuando empezamos a diseñar Lukea, la pregunta no era \"¿a qué país enviamos primero?\" sino \"¿por qué limitarnos a uno?\". La diáspora latina no vive enviando dinero a un solo lugar — muchas familias tienen parientes repartidos entre México, Colombia, Honduras y más.",
      "Por eso desde el lanzamiento cubrimos 22 países en Latinoamérica y Asia, con tasas en tiempo real para cada moneda y formas de entrega adaptadas a cada mercado — como el CCI en Perú o el tipo de cuenta y documento que piden los bancos en Colombia.",
      "Esto significa más trabajo de nuestro lado (cada país tiene sus propias reglas bancarias, sus propios operadores móviles, sus propios formatos de identificación), pero significa menos fricción para ti: una sola app, sin importar a cuántos países mandes dinero.",
    ],
  },
  {
    slug: "codigos-promocionales-como-funcionan",
    title: "Cómo funcionan nuestros códigos promocionales",
    excerpt:
      "Descuentos porcentuales, montos fijos, envío gratis en tu primer uso. Te explicamos la mecánica detrás de cada tipo de código.",
    category: "Guías",
    date: "2026-02-14",
    readMinutes: 2,
    content: [
      "Los códigos promocionales en Lukea se aplican siempre sobre el costo de envío, nunca sobre la tasa de cambio — así el descuento es predecible y fácil de entender.",
      "Hay dos tipos: descuentos porcentuales (por ejemplo, 10% del costo de envío) y descuentos de monto fijo (por ejemplo, $5 USD de descuento). Si el descuento es mayor al costo de envío, simplemente el costo llega a $0 — nunca te cobramos de más ni te debemos dinero.",
      "Puedes aplicar un código directo en la calculadora antes de confirmar tu envío, y lo verás reflejado de inmediato en el total a pagar, en el resumen del checkout y en tu factura final.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
