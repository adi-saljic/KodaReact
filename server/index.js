const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();



app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));



var homeRouter = require('./routes/home');
var raseRouter = require('./routes/rase');
var shopRouter = require('./routes/shop');
var dogViewRouter = require('./routes/dogView');

app.use('/',homeRouter);
app.use('/rase', raseRouter);
app.use('/shop',shopRouter);
app.use('/dog',dogViewRouter);


app.listen(3001, () => {
    console.log(`Server is running on port 3001.`);
  });