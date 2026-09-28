const app = require('./app');
require('dotenv').config();
require('./config/db')

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});