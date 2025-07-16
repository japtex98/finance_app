const express = require('express');
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
