//app.js


const express = require('express');
const cors = require('cors');
const auditRoutes = require('./routes/auditRoutes.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json({ limit: '1mb' })); 

app.use(cors({
    origin: process.env.FRONTEND_URL, // URL de tu frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/service/audit', auditRoutes);
app.get('/healthz', (_, res) => res.sendStatus(200));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});