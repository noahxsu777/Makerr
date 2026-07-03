// Punto de entrada serverless para Vercel: cualquier request bajo /api/*
// (crypto-payment, order-status, webhooks, tasas, etc.) cae acá por el
// nombre del archivo (catch-all "[...path]"), y se lo pasamos tal cual al
// mismo Express app que usa `npm run server` — Express sigue haciendo el
// ruteo interno con las rutas completas ("/api/create-crypto-session", …).
import app from "../server/index.js";

export default app;
