import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import executeBriefHandler from './api/execute-brief';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.options('*', cors()); 
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK - Service is Active');
});

// Main Route: Execute Press Brief
app.post('/api/execute-brief', executeBriefHandler);

const PORT = process.env.PORT || 8080;
// Hard-coded 0.0.0.0 to ensure visibility to Google Cloud Run load balancer
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[SUCCESS] AVPG Server listening on 0.0.0.0:${PORT}`);
});

export default server; // Re-exporting for process management if needed
