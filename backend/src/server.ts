console.log('Iniciando server.ts...');
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import faucetRoutes from './routes/faucet';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Permitir requests desde el frontend
app.use(express.json()); // Parsear JSON en requests

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'Faucet Backend API funcionando! 🚀',
    version: '1.0.0'
  });
});

// Rutas de autenticación y faucet
app.use('/auth', authRoutes);

app.use('/faucet', faucetRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});