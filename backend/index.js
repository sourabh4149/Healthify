import express from 'express'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import cors from 'cors'
import patientRouter from './routes/patientRoutes.js'
import healthrecordRouter from './routes/healthrecordRoutes.js'
import documentRoutes from './routes/documentRoutes.js';

const app = express();
const port = 4000;
connectDB();



app.use(cors());
app.use(express.json());



app.use('/api/patient', patientRouter);
app.use('/api/health', healthrecordRouter);
app.use('/api/documents', documentRoutes);


app.get('/',(req,res)=>{
    res.send('Hello World')
})

app.listen(port,()=>console.log('app is listening'))