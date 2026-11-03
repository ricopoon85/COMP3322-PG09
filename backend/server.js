const app = require('./app');
require('dotenv').config();
const ensureBetaSchema = require('./config/betaSchema');

const PORT = process.env.PORT || 3000;

ensureBetaSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`running ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to initialize Beta schema:', error);
    process.exitCode = 1;
  });
