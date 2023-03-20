const Pool = require('pg').Pool
const pool = new Pool({
    user: 'me',
    host: 'localhost',
    database: 'api',
    password: '1209',
    port: 5432,
})

const { checkNewBudget } = require('./functions.js')


const getAllEnvelopes = (request, response) => {
    pool.query('SELECT * FROM envelopes ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}


const getEnvelopeById = (request, response) => {
    const id = parseInt(request.params.id)
    
    pool.query('SELECT * FROM envelopes WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
};


const createEnvelope = (request, response) => {
    const { title, budget } = request.body;
    
    pool.query('INSERT INTO envelopes (title, budget, remain) VALUES ($1, $2, $3) RETURNING *', [title, budget, budget], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Envelope added with ID: ${results.rows[0].id}`)
    })
};


const updateEnvelope = async (request, response) => {
    const id = parseInt(request.params.id)
    const { title, budget } = request.body;
    
    try {
        const customerData = await pool.query('SELECT * FROM envelopes WHERE id = $1', [id]);
        //res.status(200).json(customerData.rows);
        const currentBudget = customerData.rows[0].budget;
        const remain = customerData.rows[0].remain;
        
        const newRemain = checkNewBudget(currentBudget, budget, remain);
        if(!newRemain) {
            console.log(currentBudget);
            console.log(typeof(currentBudget));
        }
        
        pool.query(
            'UPDATE envelopes SET title = $1, budget = $2, remain = $3 WHERE id = $4',
            [title, budget, newRemain, id],
            (error, results) => {
                if (error) {
                    throw error
                }
                response.status(200).send(`Envelope modified with ID: ${id}`);
            }
            )
            
        } catch (e) { console.error(`An error occured: ${e}`); }
        
    }
    
    
    const deleteEnvelope = (request, response) => {
        const id = parseInt(request.params.id)
        
        pool.query('DELETE FROM envelopes WHERE id = $1', [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Envelope deleted with ID: ${id}`)
        })
    };
    
    
    async function getQueryResult(id) {
        const result = await pool.query(
            'SELECT * FROM envelopes WHERE id = $1', [id]
            );
            //if (!result || !result.rows || !result.rows.length) return [];
            return result.rows;
        }
        
        module.exports = {
            getAllEnvelopes,
            getEnvelopeById,
            createEnvelope,
            updateEnvelope,
            deleteEnvelope,
        };
        