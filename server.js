// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5002;

// Import routing logic
const routes = require('./app');

app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use('/api', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
