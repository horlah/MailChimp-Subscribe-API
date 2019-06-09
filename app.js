const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// allow cross origin
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Signup Route
app.get('/subscribe-news-letter', (req, res) => {
  const { firstName, email } = req.query;

  // Make sure fields are filled
  if (!firstName || !email) {
    res.status(422).send({status: false, message: 'Please enter the required field data'});
    return;
  }

  // Construct req data
  const data = {
    members: [
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName
        }
      }
    ]
  };

  const postData = JSON.stringify(data);

  const options = {
    url: `https://us20.api.mailchimp.com/3.0/lists/${process.env.LIST_ID}`,
    method: 'POST',
    headers: {
      Authorization: `auth ${process.env.API_KEY}`
    },
    body: postData
  };

  request(options, (err, response) => {
    if (err) {
      res.send({status: false, message: 'Unable to subscribe you to the news letter, please try again'});
    } else {
      if (response.statusCode === 200) {
        res.send({status: true, message: 'You have successfully subscribed to Pills Of Code news letter, thank you!'});
      } else {
        res.send({status: false, message: 'Unable to subscribe you to the news letter, please try again'});
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on ${PORT}`));
