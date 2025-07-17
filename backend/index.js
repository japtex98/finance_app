const express = require('express');
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
