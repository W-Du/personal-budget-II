const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const db = require('./queries');
const tr = require('./transactions');

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
    
app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
});

//envelopes
app.get('/envelopes', db.getAllEnvelopes);
app.get('/envelopes/:id', db.getEnvelopeById);
app.post('/envelopes', db.createEnvelope);
app.put('/envelopes/:id', db.updateEnvelope);
app.delete('/envelopes/:id', db.deleteEnvelope);

//transactions
app.get('/transactions', tr.getAllTransactions);
app.get('/transactions/:envid', tr.getTransacByEnvId);
app.post('/transactions/:envid', tr.createTransac);
app.delete('/transactions/:transacid', tr.deleteTransac);
    
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
}) 