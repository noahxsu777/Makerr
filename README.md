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
- Tasas de cambio en tiempo real vía exchangerate.fun (con margen de Lukea del 2.5% aplicado) con respaldo automático si la API externa falla
- Checkout funcional con Stripe: tarjeta de crédito/débito o cuenta bancaria (ACH)
- Pago alternativo en cripto vía Paymento (checkout hospedado + confirmación por webhook firmado con HMAC y verificación activa)
- Transferencia bancaria manual para remitentes en Europa (IBAN/SWIFT), con comprobante y revisión manual
- Modo "Prueba" que simula un pago exitoso sin llamar a Stripe ni Paymento, para probar el flujo completo sin credenciales
- Dashboard de admin en `/rtx` (protegido con usuario/contraseña) con todas las solicitudes de envío y edición de sus datos
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
resta un margen de **2.5%** antes de devolverlo — esa diferencia es el margen
de Lukea, y el cliente nunca ve la tasa de mercado cruda. Las tasas se
cachean 10 minutos en el servidor para no golpear las APIs en cada request;
si las tres fuentes fallan pero ya había un valor cacheado, se sigue
sirviendo ese en vez de romper la calculadora.

Si `/api/rates` no está disponible — backend caído, `npm run dev` sin
`npm run server`, o un deploy donde `/api` no llega a ningún servidor — el
navegador ya no se rompe con un error de "no es JSON válido": en vez de eso,
`src/lib/rates.ts` intenta pedir la tasa **directo desde el navegador** a
exchangerate.fun y, si esa también falla, a open.er-api.com, aplicando el
mismo margen del 2.5% del lado del cliente. Solo si las dos rutas fallan cae a
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

## Configurar pago con cripto (Paymento)

En el paso de pago, además de Stripe, el usuario puede elegir "Cripto
(Paymento)": el backend (`POST /api/create-crypto-session`) crea una sesión
de pago vía [Paymento](https://paymento.io) (`POST /v1/payment/request`) y
redirige al usuario al checkout hospedado de Paymento
(`app.paymento.io/gateway?token=...`). Paymento solo da una `returnUrl`
única (no distingue éxito de cancelación en la redirección — su propia
documentación dice que el redirect es solo informativo), así que al volver
la app siempre entra en un paso "confirmando" y consulta
`GET /api/order-status/:orderId`, que a su vez llama a la API de verify de
Paymento (`POST /v1/payment/verify`) mientras el pedido siga pendiente.
Además, Paymento puede notificar antes por webhook (IPN) a
`POST /api/paymento-webhook`, firmado con HMAC-SHA256
(`X-HMAC-SHA256-SIGNATURE`, verificado con `PAYMENTO_IPN_SECRET`) — pero
como esa URL no puede alcanzar `localhost`, el polling contra verify es lo
que garantiza que esto funcione también en desarrollo.

El estado de cada pedido de cripto vive en la base de datos (ver
"Base de datos y dashboard de admin" más abajo) — hace falta `DATABASE_URL`
configurada para que este método funcione, ya que en Vercel un `Map` en
memoria no sería confiable entre invocaciones.

1. Copia el archivo de ejemplo si no lo has hecho: `cp .env.example .env`
2. Agrega tu clave de API de Paymento en `PAYMENTO_API_KEY` (nunca la
   expongas en el frontend — solo se usa desde `server/index.js`).
3. Agrega el secreto de firma de tus webhooks en `PAYMENTO_IPN_SECRET`
   (lo genera Paymento en su dashboard de merchant).
4. **Paso manual obligatorio:** en el dashboard de Paymento, configura la
   "IPN URL" apuntando a `https://<tu-dominio-en-producción>/api/paymento-webhook`
   — la API de creación de sesión no acepta esa URL por request, se
   configura una sola vez por cuenta de merchant.

Sin `PAYMENTO_API_KEY`, la pestaña de cripto muestra un aviso de "no
configurado" al intentar pagar.

## Configurar transferencia bancaria europea

Para remitentes en Europa sin tarjeta o cuenta de EE.UU. para pagar vía
Stripe, hay un método adicional: transferir por IBAN/SWIFT a la cuenta
receptora de Lukea y subir un comprobante. A diferencia de Paymento, esto
no tiene confirmación automática — queda "pendiente de revisión" manual, y
el comprobante se guarda en `server/uploads/` (no se sube a git). La cuenta
receptora está fija en `src/lib/euBankTransfer.ts`.

## Base de datos y dashboard de admin (/rtx)

Cada solicitud de envío (Stripe, cripto, transferencia europea o modo
prueba) se guarda en una tabla `shipments` de Postgres, y se puede ver y
editar desde `/rtx` — un dashboard protegido con autenticación HTTP básica
(usuario/contraseña por variable de entorno; el navegador muestra su
cuadro nativo de login, no hay pantalla propia). Nunca se sube a git ni se
expone al frontend público.

1. En tu proyecto de Vercel, ve a **Storage → Connect Database** y crea/conecta
   una base de datos Postgres (Neon). Vercel inyecta `DATABASE_URL`
   automáticamente — no hace falta copiarla a mano en producción.
2. Para desarrollo local, copia esa misma cadena de conexión a tu `.env`
   como `DATABASE_URL`.
3. Define `ADMIN_USERNAME` y `ADMIN_PASSWORD` en tu `.env` (y en las
   variables de entorno de tu hosting) — son las credenciales que vas a
   usar para entrar a `/rtx`. Usa una contraseña fuerte; sin
   `ADMIN_PASSWORD`, `/api/admin/*` queda deshabilitado por completo.
4. La tabla se crea sola (`CREATE TABLE IF NOT EXISTS`) la primera vez que
   algún endpoint necesita escribir o leer — no hace falta correr una
   migración a mano.

Guardar en la base de datos es "mejor esfuerzo": si `DATABASE_URL` no está
configurada o Postgres falla momentáneamente, el pago real (Stripe,
Paymento, etc.) sigue funcionando igual — simplemente ese envío no
aparecería en `/rtx`. La única excepción es el pago en cripto, que sí
necesita la base de datos para rastrear el estado del pedido (ver arriba).

Para que los pagos con Stripe también actualicen su estado en el
dashboard (de "pending" a "paid"/"failed"), configura un webhook en tu
[dashboard de Stripe](https://dashboard.stripe.com/test/webhooks) apuntando
a `https://<tu-dominio>/api/stripe-webhook`, escuchando
`payment_intent.succeeded` y `payment_intent.payment_failed`, y copia el
"Signing secret" a `STRIPE_WEBHOOK_SECRET`.

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
