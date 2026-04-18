import express from 'express'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import cors from 'cors'
import patientRouter from './routes/patientRoutes.js'
import healthrecordRouter from './routes/healthrecordRoutes.js'
import documentRoutes from './routes/documentRoutes.js';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/patient', patientRouter);
app.use('/api/health', healthrecordRouter);
app.use('/api/documents', documentRoutes);

app.get('/', (req, res) => {
  res.send('Hello World')
});

// Only listen locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(4000, () => console.log('app is listening on port 4000'));
}

export default app;  // ← Vercel needs this