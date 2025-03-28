// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5004;

// Import routing logic
const routes = require('./app');

app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use('/api', routes);

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
