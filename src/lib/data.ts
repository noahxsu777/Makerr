export const countries = [
  { name: "México", flag: "🇲🇽", rate: 18.42 },
  { name: "Guatemala", flag: "🇬🇹", rate: 7.79 },
  { name: "Colombia", flag: "🇨🇴", rate: 4128 },
  { name: "El Salvador", flag: "🇸🇻", rate: 1 },
  { name: "Honduras", flag: "🇭🇳", rate: 24.71 },
  { name: "República Dominicana", flag: "🇩🇴", rate: 60.15 },
  { name: "Ecuador", flag: "🇪🇨", rate: 1 },
  { name: "Perú", flag: "🇵🇪", rate: 3.71 },
  { name: "Nicaragua", flag: "🇳🇮", rate: 36.6 },
  { name: "Bolivia", flag: "🇧🇴", rate: 6.91 },
  { name: "Venezuela", flag: "🇻🇪", rate: 39.8 },
  { name: "Brasil", flag: "🇧🇷", rate: 5.44 },
  { name: "Argentina", flag: "🇦🇷", rate: 913.2 },
  { name: "Filipinas", flag: "🇵🇭", rate: 56.9 },
  { name: "India", flag: "🇮🇳", rate: 83.5 },
  { name: "Vietnam", flag: "🇻🇳", rate: 25410 },
] as const;

export const deliveryOptions = [
  {
    icon: "Landmark",
    title: "Depósito bancario",
    desc: "Directo a cualquier cuenta en más de 1,200 bancos y cooperativas.",
    accent: "lime",
  },
  {
    icon: "Wallet",
    title: "Billetera móvil",
    desc: "Nequi, Yape, Mercado Pago, DaviPlata y más de 30 wallets locales.",
    accent: "emerald",
  },
  {
    icon: "Store",
    title: "Retiro en efectivo",
    desc: "Más de 55,000 puntos de pago en toda Latinoamérica y Asia.",
    accent: "moss",
  },
  {
    icon: "CreditCard",
    title: "Recarga de tarjeta débito",
    desc: "Fondos disponibles en segundos en tarjetas Visa y Mastercard.",
    accent: "mint",
  },
  {
    icon: "Home",
    title: "Entrega a domicilio",
    desc: "Efectivo llevado a la puerta en zonas seleccionadas de 9 países.",
    accent: "lime",
  },
  {
    icon: "Smartphone",
    title: "Recarga de celular",
    desc: "Tiempo aire y datos para más de 180 operadores al instante.",
    accent: "emerald",
  },
  {
    icon: "Receipt",
    title: "Pago de servicios",
    desc: "Luz, agua, gas e internet pagados directo desde la app.",
    accent: "moss",
  },
  {
    icon: "Bitcoin",
    title: "Retiro cripto",
    desc: "Convierte a USDC y retira a tu wallet favorita sin comisión extra.",
    accent: "mint",
  },
] as const;

export const steps = [
  {
    n: "01",
    title: "Crea tu cuenta en 90 segundos",
    desc: "Solo tu identificación. Verificación instantánea, sin papeleo ni sucursales.",
  },
  {
    n: "02",
    title: "Elige monto, país y forma de entrega",
    desc: "Compara la tasa en vivo y escoge entre 8 formas distintas de recibir el dinero.",
  },
  {
    n: "03",
    title: "Paga con tarjeta, banco o Apple Pay",
    desc: "Sin cargos ocultos. El total que ves es el total que pagas.",
  },
  {
    n: "04",
    title: "Tu gente recibe en minutos",
    desc: "Notificación en tiempo real apenas el dinero está disponible.",
  },
] as const;

export const testimonials = [
  {
    name: "Rosa M.",
    role: "Envía a Puebla, México",
    quote:
      "Cambié de app tres veces buscando mejor tasa. Aquí no solo gano más pesos, mi mamá recibe el dinero en Oxxo en 4 minutos.",
    avatar: "🧑🏽‍🦱",
  },
  {
    name: "Douglas R.",
    role: "Envía a San Pedro Sula, Honduras",
    quote:
      "Lo que más me gusta son las opciones: unas semanas mando a la cuenta de banco, otras directo al celular de mi hermano.",
    avatar: "🧔🏽",
  },
  {
    name: "Yuliana P.",
    role: "Envía a Medellín, Colombia",
    quote:
      "La calculadora te muestra todo antes de pagar. Nada de sorpresas. Y las notificaciones son instantáneas, se siente segura.",
    avatar: "👩🏽",
  },
  {
    name: "Kevin T.",
    role: "Envía a Manila, Filipinas",
    quote:
      "Empecé a usarla por las reseñas y me quedé por el diseño, se siente como una app de banco de verdad, no una remesadora cualquiera.",
    avatar: "🧑🏻",
  },
] as const;

export const faqs = [
  {
    q: "¿Cuánto cuesta enviar dinero?",
    a: "La mayoría de los envíos a cuentas bancarias o billeteras móviles no tienen comisión de envío; solo pagas el margen incluido en la tasa de cambio, que siempre se muestra por adelantado antes de confirmar.",
  },
  {
    q: "¿Qué tan rápido llega el dinero?",
    a: "Depósitos a billeteras móviles y recargas de celular suelen llegar en menos de 5 minutos. Depósitos bancarios tradicionales pueden tardar hasta el mismo día hábil.",
  },
  {
    q: "¿A cuántos países puedo enviar?",
    a: "Actualmente cubrimos 22 países en Latinoamérica y Asia, con más de 8 formas de entrega distintas según el país de destino.",
  },
  {
    q: "¿Es seguro dar mis datos bancarios?",
    a: "Sí. Usamos cifrado de nivel bancario (AES-256) y nunca almacenamos tu información de tarjeta en nuestros servidores. Cada transacción está protegida y monitoreada 24/7.",
  },
  {
    q: "¿Puedo cancelar un envío?",
    a: "Puedes cancelar sin costo dentro de los primeros 30 minutos, siempre que el destinatario aún no haya retirado los fondos.",
  },
  {
    q: "¿Necesito la app para enviar dinero?",
    a: "No. Puedes usar la web completa desde tu computadora o celular. La app solo añade notificaciones push y guarda tus destinatarios frecuentes.",
  },
] as const;

export const stats = [
  { label: "Familias conectadas", value: 480_000, suffix: "+" },
  { label: "Países de destino", value: 22, suffix: "" },
  { label: "Formas de entrega", value: 8, suffix: "" },
  { label: "Calificación en tiendas", value: 4.9, suffix: "/5" },
] as const;
