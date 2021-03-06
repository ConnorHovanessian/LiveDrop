const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./data');
const Comment = require('./comment');

const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

// this is our MongoDB database
const dbRoute = 'mongodb+srv://connor:1234qwer@cluster0-uapqo.mongodb.net/test?retryWrites=true&w=majority';
// connects our back end with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));
// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev', {
  skip: function (req, res) { return res.statusCode == 304 }
}))

// fetches all available data in our database
router.get('/getData', (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data});
  });
});

// fetches all available data in our database that is close to given position
// data stores all the thread objects
router.get('/getDataWithLocation', (req, res) => {
  //console.log('req.query: ' + (JSON.stringify(req.query)));
  Data.find({ 
    //Use unary + since the lat,long are stored as strings
    latitude: { $gte: req.query.latitude-10, $lte :  10 + + req.query.latitude },
    longitude: { $gte: req.query.longitude-10, $lte :  10 + + req.query.longitude }
  }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data});
    }
  );
});

// overwrites existing data in our database
router.post('/updateData', (req, res) => {
  const { id, update } = req.body;
  Data.findByIdAndUpdate(id, update, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// removes existing data in our database
router.delete('/deleteData', (req, res) => {
  const { id } = req.body;
  Data.findByIdAndRemove(id, (err) => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// adds new data to our database
router.post('/putData', (req, res) => {
  let data = new Data();
  const { id, title, message, lat, lon} = req.body;

  if ((!id && id !== 0) || !message || !lat || !lon) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }

  data.title = title;
  data.message = message;
  data.id = id;
  data.latitude = lat;
  data.longitude = lon;
  data.render = false;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

//Add a comment to a given parent id
router.post('/putComment', (req, res) => {
  const { message, parentID } = req.body;

  Data.update(
    { "_id": parentID },
    { $push: { "children": message } } 
   ).then(function (err) {
    if (err) return res.send(err);
    return res.json({ success: true });    
  });

});

// append /api for our http requests
app.use('/api', router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));