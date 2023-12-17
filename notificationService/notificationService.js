const db = require('./models/index.js');
const { Log, FavoriteMatch, LogRecipient, User } = db;
const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: 'redis',
        port: 6379
    }
});

const UserClientTest = redis.createClient({
    socket: {
        host: 'redis',
        port: 6379
    }
});

UserClientTest.connect().then(() => {
    console.log('Connected to Redis!');
});

client.connect().then(() => {
    console.log('Connected to Redis!');
});

const clientPublisher = redis.createClient({
    socket: {
        host: 'redis',
        port: 6379
    }
});

clientPublisher.connect().then(() => {
    console.log('Connected to Redis!');
});

Log.belongsToMany(User, {
    through: 'LogRecipients',
});

db.sequelize.sync().then(() => {
    console.log('Database connected');
}).catch((error) => {
    console.error('Error connecting to the database:', error);
});

client.subscribe('match-logs', async (message, channel) => {
    try {
        const logData = JSON.parse(message);

        const { type, matchId, text } = logData;

        const logText = `Notification sent: ${type} - Match: ${matchId} - Text: ${text}`;

        const favoriteMatchesUp = await FavoriteMatch.findAll({ where: { matchId } });

        const log = await Log.create({
            type: type,
            text: logText,
            recipients: favoriteMatchesUp.map(favoriteMatch => favoriteMatch.userId),
        });

        if (type === 'START' || type === 'END' || type === 'SCORE UPDATE' || type === 'PREMATCH') {
            const favoriteMatches = await FavoriteMatch.findAll({ where: { matchId } });
            const users = favoriteMatches.map(favoriteMatch => favoriteMatch.userId);
            for (const user of users) {
                clientPublisher.publish('notifications', JSON.stringify({ type, recipients: [user], text }));
            }
        }

        console.log(logText);
    } catch (error) {
        console.error('Error processing Redis message:', error);
    }
});

UserClientTest.subscribe('notifications', async (message, channel) => {
    console.log(`Message reçu de ${channel}: ${message}`);
});