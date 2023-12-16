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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
