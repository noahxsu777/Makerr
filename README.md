# MandaMás

Landing page + checkout funcional de una remesadora digital inspirada en el
concepto de Felix Pago, con un diseño más animado y más opciones de entrega.
Construida con React, TypeScript, Tailwind CSS v4, Framer Motion y un backend
Express que crea cargos reales con Stripe (tarjeta o cuenta bancaria vía ACH).

## Highlights

- Hero animado con blobs flotantes y una tarjeta de envío interactiva
- Marquee infinito con 16 países de destino
- Calculadora de envío en vivo con números animados y forma de entrega elegible
- Checkout funcional con Stripe: tarjeta de crédito/débito o cuenta bancaria (ACH)
- Sección "Cómo funciona" con revelado por scroll
- Grid de 8 formas de entrega (banco, wallets, efectivo, tarjeta, domicilio, recarga, servicios, cripto)
- Carrusel de testimonios auto-rotativo
- Sección de descarga de app con mockup de teléfono animado
- FAQ en acordeón
- Totalmente responsive, con menú móvil animado

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

## Desarrollo

```bash
npm install
npm run dev:all   # servidor de desarrollo (frontend en :5173) + API de Stripe (:8787)
npm run build     # build de producción
npm run lint      # oxlint
```

También puedes correr cada proceso por separado con `npm run dev` (frontend)
y `npm run server` (API de Stripe).
