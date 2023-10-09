const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


var raseRouter = require('./routes/rase');
var homeRouter = require('./routes/home');
var shopRouter = require('./routes/shop');
var dogViewRouter = require('./routes/dogView');

app.use('/',homeRouter);
app.use('/rase', raseRouter);
app.use('/shop',shopRouter);
app.use('/dog',dogViewRouter);


app.listen(3001, () => {
    console.log(`Server is running on port 3001.`);
  });