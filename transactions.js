const Pool = require('pg').Pool
const pool = new Pool({
    user: 'me',
    host: 'localhost',
    database: 'api',
    password: '1209',
    port: 5432,
})

const { checkNewBudget } = require('./functions.js')

const getAllTransactions = (request, response) => {
    pool.query('SELECT * FROM transactions ORDER BY transac_id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getTransacByEnvId = (request, response) => {
    const envelope_id = parseInt(request.params.envid)
    
    pool.query('SELECT * FROM transactions WHERE envelope_id = $1', [envelope_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
};

const createTransac = async (request, response) => {
    const { amount, recipient } = request.body;
    const date = new Date();
    const envelope_id = parseInt(request.params.envid);

    try{
        const data = await pool.query('SELECT * FROM envelops WHERE id = $1', [envelope_id]);
        const currentRemain = data.rows[0].remain;
        const newRemain = Number(currentRemain) - Number(amount);
        if (newRemain < 0) {
            response.status(404).send('amount exceeded')
        }
        else {

        pool.query('INSERT INTO transactions (amount, recipient, envelope_id, date) VALUES ($1, $2, $3, $4) RETURNING *', 
        [amount, recipient, envelope_id, date], (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`Transaction added with ID: ${results.rows[0].transac_id}`)
        })

        pool.query('UPDATE envelops SET remain = $1 WHERE id = $2', 
        [newRemain, envelope_id], (error, results) => {
            if (error) {throw error}
            //response.send(`Envelope updated with new remain: ${newRemain}`);
        })
    }

    } catch (e) { console.error(`An error occured: ${e}`); }
    
};


const deleteTransac = async (request, response) => {
    const id = parseInt(request.params.transacid);

    try {
        const data = await pool.query('SELECT * FROM transactions WHERE transac_id = $1', [id]);
        const amountToAdd = Number(data.rows[0].amount);
        const envId = parseInt(data.rows[0].envelope_id);

        pool.query('DELETE FROM transactions WHERE transac_id= $1', [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Transaction deleted with ID: ${id}`)
        })
    
        pool.query('UPDATE envelops SET remain = remain + $1 WHERE id = $2', 
        [amountToAdd, envId], (error, results) => {
            if (error) {throw error}
        })
    } catch (e) { console.error(`An error occured: ${e}`); }
};


module.exports = {
    getAllTransactions, 
    getTransacByEnvId,
    createTransac,
    deleteTransac };