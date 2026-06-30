import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.routes';
import { llmRoutes } from './routes/llm.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5028;

// Middleware
app.use(cors({
  origin: 'http://localhost:5029',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/llm', llmRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

export default app;
