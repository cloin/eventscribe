const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3331;

app.use(cors()); 
app.use(bodyParser.json());

// store payloads in-memory
const payloads = [];

app.post('/webhook', (req, res) => {
  const payload = req.body;
  const timestamp = new Date().toLocaleString();
  payloads.push({ payload, timestamp });
  console.log(`Received payload at ${timestamp}: ${JSON.stringify(payload)}`);
  res.status(200).send('OK');
});

app.get('/payloads', (req, res) => {
  res.json(payloads);
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

