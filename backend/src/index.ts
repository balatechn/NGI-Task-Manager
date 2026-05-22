import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/tasks', tasksRoutes);

app.listen(PORT, () => console.log(`Task Manager API running on :${PORT}`));
