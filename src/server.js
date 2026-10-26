require('dotenv').config();
const createApp = require('./app');
const repo = require('./repo/mysql');
const port = process.env.PORT || 3000;
createApp(repo).listen(port, () => console.log(`CovidWatch running at http://localhost:${port}`));
