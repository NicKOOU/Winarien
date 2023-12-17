const express = require('express');
const { Op } = require('sequelize');
const { Log } = require('./models');

const app = express();
const PORT = 3005;

app.use(express.json());

/**
 * @swagger
 * /match/{matchId}/events:
 *   get:
 *     summary: Get all events for a specific match
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         description: ID of the match
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 type: 'SCORE UPDATE'
 *                 text: 'Match updated: Match 1 - Status: NOT STARTED - Home Score: 1 - Away Score: 0'
 */
app.get('/match/:matchId/events', async (req, res) => {
    try {
        const matchId = req.params.matchId;

        const matchEvents = await Log.findAll({
            where: {
                text: {
                    [Op.like]: `%Match ${matchId}%`,
                },
            },
        });

        res.json(matchEvents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Match Events API',
            version: '1.0.0',
            description: 'API for retrieving match events',
        },
    },
    apis: ['./replayEventsService.js'],
};

const specs = swaggerJsdoc(options);

app.use('/', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
