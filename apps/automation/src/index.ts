import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import executeBriefHandler from './api/execute-brief';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Main Route: Execute Press Brief
app.post('/api/execute-brief', executeBriefHandler);

const PORT = process.env.PORT || 8080;
// Hard-coded 0.0.0.0 to ensure visibility to Google Cloud Run load balancer
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[SUCCESS] AVPG Automation Service active on 0.0.0.0:${PORT}`);
});
