import cors from 'cors';
import express from 'express';

export function crearApp() {
  const app = express();
  app.use(cors({ origin: ['http://localhost:4200', 'http://127.0.0.1:4200'] }));
  app.use(express.json());

  app.get('/api/salud', (_req, res) => {
    res.json({ estado: 'ok', sistema: 'banco-academico' });
  });

  return app;
}
