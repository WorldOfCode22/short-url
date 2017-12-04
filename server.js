// server.js
// where your node app starts

// init project
var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var path = require('path');
var app = express();

router.get('/',(req,res)=>{
  res.sendFile('index.html', { root: path.join(__dirname + '/views') });
});

router.get('/short/:data',(req,res)=>{
  var numberExpression = /[0-9]/;
  if(numberExpression.test(req.params.data)){
    var short = req.params.data;
    short = Number.parseInt(short);
    var dburl = 'mongodb://'+process.env.DBUSER+':'+process.env.DBPASS+'@ds129796.mlab.com:29796/url-short';
    MongoClient.connect(dburl,(err, db)=>{
      if(err){
        res.send('Could not connect to database');
      }else{
       db.collection('url').findOne({short:short},(error,result)=>{
         if(error){
           res.send('Could not connect to collection');
         }else if(result != null){
           res.redirect(result.url);
         }else{
           res.send('Given Short Not Claimed');
         }
       }); 
      }
    });
  }else{
    res.send("Please Enter A Vaild Short URL")
  }
});

router.get('/url/:data(*)',(req,res)=>{
  if(testVaildUrl(req.params.data)){
    var url = req.params.data;
    var dburl = 'mongodb://'+process.env.DBUSER+':'+process.env.DBPASS+'@ds129796.mlab.com:29796/url-short';
  MongoClient.connect(dburl,(err, db)=> {
    if (err) {
      res.send('Unable to connect to the mongoDB server. Error:' + err);
    } else {
      db.collection('url').findOne({url: url},(err, result)=>{
        if(err){
          res.send('could not acess collection');
        }else{
          if(result === null){
            db.collection('url').count().then((count)=>{
                var insertObject = {url:url,short:count+1};
            db.collection('url').insertOne(insertObject,(err,result)=>{
              if(err){
                res.send('Could not insert data into database');
              }else{
                res.send({url:url,short:count+1});
              }
            });
            });
 
          }else{
            res.send({url:result.url,short:result.short});
          }
        }
      });

  }
  });
}
  else{
    res.send('Not Vaild URL');
  }
});

function testVaildUrl(str){
  var httpExpression = /^[h][t][t][p][:][/][/]/
  var httpsExpression = /^[h][t][t][p][s][:][/][/]/
  var dotExpression = /[.]/g; 
  if (dotExpression.test(str)){
    if ((httpExpression.test(str)) || (httpsExpression.test(str))){
      return true;
    } 
  }
  else return false;
}

app.use('/',router);
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
