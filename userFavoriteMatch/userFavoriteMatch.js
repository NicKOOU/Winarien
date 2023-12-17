const express = require('express');
const bodyParser = require('body-parser');

const db = require('./models/index.js');
const { Match, User, FavoriteMatch } = db;

const app = express();
const PORT = 3003;


FavoriteMatch.belongsTo(Match, {
    as: 'match',
    foreignKey: 'matchId',
});

FavoriteMatch.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
});

db.sequelize.sync();


app.use(bodyParser.json());

/**
 * @swagger
 * /favoriteMatches/{userId}:
 *   get:
 *     summary: Get favorite matches for a user
 *     tags: [Favorite Matches]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A list of favorite matches for the user
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 userId: 1
 *                 matchId: 4
 *                 createdAt: "2023-12-17T14:21:50.000Z"
 *                 updatedAt: "2023-12-17T14:21:50.000Z"
 */
app.get('/favoriteMatches/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findByPk(userId, {
            include: {
                model: FavoriteMatch,
                as: 'favorites',
                include: 'match',
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.favorites);
    } catch (error) {
        console.error('Error getting favorite matches:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /favoriteMatches/{userId}:
 *   post:
 *     summary: Add a match to the user's favorites
 *     tags: [Favorite Matches]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matchId:
 *                 type: integer
 *                 description: ID of the match to be added
 *     responses:
 *       '201':
 *         description: The added favorite match
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               userId: 1
 *               matchId: 4
 *               createdAt: "2023-12-17T14:21:50.000Z"
 *               updatedAt: "2023-12-17T14:21:50.000Z"
 */
app.post('/favoriteMatches/:userId', async (req, res) => {
    const { userId } = req.params;
    const { matchId } = req.body;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const match = await Match.findByPk(matchId);

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        const [favoriteMatch, created] = await FavoriteMatch.findOrCreate({
            where: {
                userId: user.id,
                matchId: match.id,
            },
        });

        if (created) {
            res.json(favoriteMatch);
        } else {
            res.status(400).json({ message: 'Match already in favorites' });
        }
    } catch (error) {
        console.error('Error adding favorite match:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /favoriteMatches/{userId}/{matchId}:
 *   delete:
 *     summary: Remove a match from the user's favorites
 *     tags: [Favorite Matches]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: integer
 *       - in: path
 *         name: matchId
 *         required: true
 *         description: ID of the match to be removed
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Success message
 *         content:
 *           application/json:
 *             example:
 *               message: "Favorite match deleted successfully"
 */
app.delete('/favoriteMatches/:userId/:matchId', async (req, res) => {
    const { userId, matchId } = req.params;

    try {
        const favoriteMatch = await FavoriteMatch.findOne({
            where: {
                userId,
                matchId,
            },
        });

        if (!favoriteMatch) {
            return res.status(404).json({ message: 'Favorite match not found' });
        }

        await favoriteMatch.destroy();
        res.json({ message: 'Favorite match deleted successfully' });
    } catch (error) {
        console.error('Error deleting favorite match:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the user
 *     responses:
 *       '201':
 *         description: The created user
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               firstName: John
 *               createdAt: "2023-12-17T14:21:50.000Z"
 *               updatedAt: "2023-12-17T14:21:50.000Z"
 */
app.post('/users', async (req, res) => {
    try {
        const { firstName } = req.body;
        const newUser = await User.create({ firstName });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to be deleted
 *         schema:
 *           type: integer
 *     responses:
 *       '204':
 *         description: No content
 */
app.delete('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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
            description: 'API to manage favorite matches and users',
        },
    },
    apis: ['./userFavoriteMatch.js'],
};

const specs = swaggerJsdoc(options);

app.use('/', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
