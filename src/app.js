const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (Example)
app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
