/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/**
* The home page is directed to index.jade
*/
app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});

/**
* Redirects the Project description page.
* Has detailed explanation of the assignment.
*/
app.get('/About', function(req, res){
  res.render('about', {
    title: 'Readme'
  });
});


/**
* repo URL is sent as the get variable and the res contains an array of values corresponging to 
* 1) Total open issues
* 2) Open issues created less than 24 hours
* 3) Open issues in last week except the current day
* 4) Open issues created a week ago
*/
app.get('/getissues', function(req, res){  
  var repo = req.query.repo;
  var github = require('octonode'); // Git API Library
  var client = github.client();
  var ghsearch = client.search(); // Git Search API
  var total, withinaday, withinaweeknottoday, beforeaweek, withinaweek;

  var moment = require('moment'); // Moment.js for Date Manipulation
  var lastday  = moment().subtract(12,'hours').format("YYYY-MM-DDThh:mm:ss");
  var lastweek = moment().subtract(7,'days').format("YYYY-MM-DDThh:mm:ss");

  var events = require('events'); //To create a new EventEmitter 'calculated'
  var eventEmitter = new events.EventEmitter();
  var counter=0;
  var result={};

  var passbackListerner = function()
  {
    if(counter==3) //Implies that all necessary values are calculated using ghsearch (No remaining callback queue)
    {      
      total = total;
      withinaday = withinaday;
      withinaweeknottoday = withinaweeknottoday;
      beforeaweek = (total - withinaweek);
      //After all calculations renders issue.jade with datas
      res.render('issue', {
        title: 'Issues',
        datas:[total, withinaday, withinaweeknottoday, beforeaweek]
      });         
    }
  }

  /**
  * 'calculated' - new event
  * passbackListerner - callback function
  */
  eventEmitter.on('calculated', passbackListerner);

  //Total open issues - without any date criteria
  ghsearch.issues(
  {
    q: 'state:open+repo:'+repo,
    sort: 'created',
    order: 'asc'
  }, 
  function(err,result){
    if(typeof result == 'undefined')
    {
        res.render('error',{
          title: 'Error',
        });
        return;
    }
    total = Number(result.total_count);
    counter++;
    eventEmitter.emit('calculated');
  });

  //Open issues in last 24 hours
  ghsearch.issues(
  {
    q: 'state:open+repo:'+repo+'+created:>='+lastday,
    sort: 'created',
    order: 'asc'
  }, 
  function(err,result){
    if(typeof result == 'undefined')
    {
      res.render('error',{
          title: 'Error',
        });  
      return;
    }
    withinaday = Number(result.total_count);
    counter++;
    eventEmitter.emit('calculated');
  });

  //Open Issues in the last 7 days(a week)
  ghsearch.issues(
  {
    q: 'state:open+repo:'+repo+'+created:>='+lastweek,
    sort: 'created',
    order: 'asc'
  }, 
  function(err,result){
    if(typeof result == 'undefined')
    {
       res.render('error',{
          title: 'Error',
        });
       return;
    }
    withinaweek = Number(result.total_count);
    withinaweeknottoday = withinaweek - withinaday;
    counter++;  
    eventEmitter.emit('calculated');
  });
  
});

app.get('/contact', function(req, res){
  res.render('contact', {
    title: 'Contact'
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});