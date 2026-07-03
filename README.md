# Lukea

Landing page + checkout funcional de una remesadora digital inspirada en el
concepto de Felix Pago, con un diseño más animado y más opciones de entrega.
Made in the US, hecho para latinos. Construida con React, TypeScript,
Tailwind CSS v4, Framer Motion y un backend Express que crea cargos reales
con Stripe (tarjeta o cuenta bancaria vía ACH).

## Highlights

- Hero animado con blobs flotantes y una tarjeta de envío interactiva
- Marquee infinito con 16 países de destino
- Calculadora de envío en vivo con números animados y forma de entrega elegible
- Códigos promocionales (`LUKEA10`, `BIENVENIDO`, `AHORRA5`) con descuento animado sobre el costo de envío
- Tasas de cambio en tiempo real vía exchangerate.fun (con margen de Lukea del 5% aplicado) con respaldo automático si la API externa falla
- Checkout funcional con Stripe: tarjeta de crédito/débito o cuenta bancaria (ACH)
- Pago alternativo en USDC por la red Solana, con QR (Solana Pay) y verificación manual por captura de pantalla
- Modo "Prueba" que simula un pago exitoso sin llamar a Stripe ni Solana, para probar el flujo completo sin credenciales
- Factura simulada (número consecutivo, detalle completo) que se genera y se muestra dentro de la app al completar cualquier método de pago — sin PDF, todo en línea
- Formulario de destinatario con campos específicos por país (CCI en Perú, tipo de documento/cuenta en Colombia, CLABE en México)
- Sección "Cómo funciona" con revelado por scroll
- Grid de 8 formas de entrega (banco, wallets, efectivo, tarjeta, domicilio, recarga, servicios, cripto)
- Carrusel de testimonios auto-rotativo
- Sección de descarga de app con mockup de teléfono animado
- FAQ en acordeón
- Totalmente responsive, con menú móvil animado

## Tasas de cambio en vivo

El backend (`GET /api/rates`) consulta [exchangerate.fun](https://www.exchangerate.fun/docs/)
(`api.exchangerate.fun/latest`, gratis, sin API key) como fuente principal, y
si falla intenta con dos fuentes públicas más de respaldo. A todo el mundo le
resta un margen de **5%** antes de devolverlo — esa diferencia es el margen
de Lukea, y el cliente nunca ve la tasa de mercado cruda. Las tasas se
cachean 10 minutos en el servidor para no golpear las APIs en cada request;
si las tres fuentes fallan pero ya había un valor cacheado, se sigue
sirviendo ese en vez de romper la calculadora.

Si `/api/rates` no está disponible — backend caído, `npm run dev` sin
`npm run server`, o un deploy donde `/api` no llega a ningún servidor — el
navegador ya no se rompe con un error de "no es JSON válido": en vez de eso,
`src/lib/rates.ts` intenta pedir la tasa **directo desde el navegador** a
exchangerate.fun y, si esa también falla, a open.er-api.com, aplicando el
mismo margen del 5% del lado del cliente. Solo si las dos rutas fallan cae a
las tasas de respaldo fijas y lo indica con "Tasa de respaldo" (con el motivo
exacto debajo).

**Si siempre ves "Tasa de respaldo" y nunca "Tasa en vivo":** revisa el
mensaje pequeño debajo del aviso — dice exactamente qué intentó y por qué
falló. Si dice que el backend no respondió JSON, corre `npm run dev:all` (o
`npm run server` en otra terminal); si dice "Failed to fetch" en las fuentes
directas, es que tu red/navegador está bloqueando esos dominios.

Para producción, corre `npm run build` y luego `npm run server`: el mismo
proceso de Express sirve el frontend compilado (`dist/`) *y* las rutas
`/api/*` en un solo puerto, así que no hace falta configurar un proxy aparte.

## Configurar Stripe

El envío de dinero usa [Stripe](https://stripe.com) para cobrar con tarjeta o
cuenta bancaria (ACH Direct Debit). Necesitas una cuenta de Stripe (el modo de
prueba es gratis):

1. Copia el archivo de ejemplo: `cp .env.example .env`
2. En tu [dashboard de Stripe](https://dashboard.stripe.com/test/apikeys), copia:
   - La **Secret key** (`sk_test_...`) → pégala en `STRIPE_SECRET_KEY`
   - La **Publishable key** (`pk_test_...`) → pégala en `VITE_STRIPE_PUBLISHABLE_KEY`
3. Activa el método de pago "US bank account (ACH)" en
   [Payment methods](https://dashboard.stripe.com/test/settings/payment_methods)
   si quieres probar el cobro por cuenta bancaria, además de tarjeta.

Sin estas claves, el botón de pago sigue funcionando pero muestra un aviso de
"Stripe no está configurado" en vez de procesar el cobro.

Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura y CVC.

## Configurar pago con USDC (Solana)

En el paso de pago, además de Stripe, el usuario puede elegir "USDC (Solana)":
se le muestra un QR (con el formato [Solana Pay](https://docs.solanapay.com/),
así la wallet abre ya con el monto exacto en USDC prellenado), la dirección
para copiar manualmente, y un campo para subir una captura de pantalla como
comprobante. No hay verificación on-chain automática — el pago queda
"pendiente de revisión" y el comprobante se guarda en `server/uploads/`
(no se sube a git) para que lo revises a mano.

1. Copia el archivo de ejemplo si no lo has hecho: `cp .env.example .env`
2. Agrega la wallet de Solana que va a recibir los fondos en
   `VITE_SOLANA_USDC_ADDRESS` (es una dirección pública, no un secreto — la
   misma que se muestra en el QR).

Sin esa variable, la pestaña de USDC muestra un aviso de "no configurado" en
vez de un QR roto.

## Desarrollo

```bash
npm install
npm run dev:all   # servidor de desarrollo (frontend en :5173) + API (:8787)
npm run build     # build de producción
npm run lint      # oxlint
```

También puedes correr cada proceso por separado con `npm run dev` (frontend)
y `npm run server` (API de Stripe + tasas de cambio) — pero si solo corres
`npm run dev`, la calculadora no tendrá backend con quien hablar y siempre
mostrará las tasas de respaldo.

Para "producción" local (un solo proceso, un solo puerto):

```bash
npm run build
npm run server   # sirve dist/ y /api/* juntos en http://localhost:8787
```
