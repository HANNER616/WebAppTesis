//app.js


const express = require('express');
const cors = require('cors');
const auditRoutes = require('./routes/auditRoutes.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // URL de tu frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/service/audit', auditRoutes);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});