const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models/index.js');
const Match = db.Match;
db.sequelize.sync();
const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    Match.findAll({
        where: {
            status: 'ENDED'
        }
    }).then(matches => {
        res.json(matches);
    });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
