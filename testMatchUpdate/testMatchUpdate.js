const express = require('express');
const { Op } = require('sequelize');
const { Match } = require('./models');
const redis = require('redis');

const app = express();
const PORT = 3006;

app.use(express.json());

const client = redis.createClient({
    socket: {
        host: 'redis',
        port: 6379
    }
});

client.connect().then(() => {
    console.log('Connected to Redis!');
});

function checkSatuts(newStatus, match) {
    if (newStatus === 'PREMATCH' && match.status === 'NOT STARTED') {
        return true;
    }
    if (newStatus === 'LIVE' && match.status === 'PREMATCH') {
        return true;
    }
    if (newStatus === 'ENDED' && match.status === 'LIVE') {
        return true;
    }
    return false;
}

/**
 * @swagger
 * /updateMatchStatus:
 *   post:
 *     summary: Update match status, status can be NOT STARTED, PREMATCH, LIVE, ENDED
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matchId:
 *                 type: integer
 *               newStatus:
 *                 type: string
 *             required:
 *               - matchId
 *               - newStatus
 *     responses:
 *       200:
 *         description: Match status updated successfully
 *       500:
 *         description: Internal Server Error
 */
app.post('/updateMatchStatus', async (req, res) => {
    try {
        const { matchId, newStatus } = req.body;

        const match = await Match.findByPk(matchId);

        if (!match) {
            console.error('Match not found with ID:', matchId);
            return;
        }

        if (checkSatuts(newStatus, match)) {

            client.publish('match-updates', JSON.stringify({ "matchId": matchId, "newStatus": newStatus }));

            res.json({ message: 'Match status sent successfully to match-updates channel' });
        }
        else {
            res.json({ message: 'status must respect the order' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /updateMatchScores:
 *   post:
 *     summary: Update match scores
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matchId:
 *                 type: integer
 *               homeScore:
 *                 type: integer
 *               awayScore:
 *                 type: integer
 *             required:
 *               - matchId
 *               - homeScore
 *               - awayScore
 *     responses:
 *       200:
 *         description: Match scores updated successfully
 *       500:
 *         description: Internal Server Error
 */
app.post('/updateMatchScores', async (req, res) => {
    try {
        const { matchId, homeScore, awayScore } = req.body;

        const match = await Match.findByPk(matchId);

        if (!match) {
            console.error('Match not found with ID:', matchId);
            return;
        }

        if (match.status !== 'LIVE') {
            res.json({ message: 'Match must be live' });
            return;
        }

        client.publish('match-updates', JSON.stringify({ "matchId": matchId, "homeScore": homeScore, "awayScore": awayScore }));

        res.json({ message: 'Match scores sent successfully to match-updates channel' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get all matches
 *     responses:
 *       200:
 *         description: List of matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   competitorId1:
 *                     type: integer
 *                   competitorId2:
 *                     type: integer
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *                   homeScore:
 *                     type: integer
 *                   awayScore:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
app.get('/matches', (req, res) => {
    Match.findAll().then(matches => {
        res.json(matches);
    }).catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});


const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Match Events API',
            version: '1.0.0',
            description: 'API to update match status and scores',
        },
    },
    apis: ['./testMatchUpdate.js'],
};

const specs = swaggerJsdoc(options);

app.use('/', swaggerUi.serve, swaggerUi.setup(specs));


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
