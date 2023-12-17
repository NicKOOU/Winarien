const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models/index.js');
const Match = db.Match;
const { Op } = require("sequelize");

db.sequelize.sync().then(() => {
    console.log('Database connected');
}).catch((error) => {
    console.error('Error connecting to the database:', error);
});

const app = express();
app.use(bodyParser.json());



/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get not ended matches
 *     responses:
 *       '200':
 *         description: A list of not ended matches
 *         content:
 *           application/json:
 *             example:
 *               - id: 4
 *                 title: "Match D"
 *                 competitorId1: 7
 *                 competitorId2: 8
 *                 startDate: "2023-04-01T08:00:00.000Z"
 *                 endDate: "2023-04-01T10:00:00.000Z"
 *                 homeScore: 2
 *                 awayScore: 1
 *                 status: "NOT STARTED"
 *                 createdAt: "2023-12-17T14:21:50.000Z"
 *                 updatedAt: "2023-12-17T14:21:50.000Z"
*/
app.get('/matches', (req, res) => {
    Match.findAll({
        where: {
            status: {
                [Op.ne]: 'ENDED'
            }
        }
    }).then(matches => {
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
            title: 'Matches API',
            version: '1.0.0',
            description: 'API for retrieving matches',
        },
    },
    apis: ["./getAllMatch.js"],
};

const specs = swaggerJsdoc(options);

app.use('/', swaggerUi.serve, swaggerUi.setup(specs));
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
