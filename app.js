var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerApp', ['customers']);
var ObjectId = mongojs.ObjectId;

var app = express();

// var logger = function(req, res, next) {
//     console.log("Logging.......");
//     next();
// }

// app.use(logger);

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// set static path
app.use(express.static(path.join(__dirname, 'public')));

// global vars
app.use(function(req, res, next){
    res.locals.errors = null;
    next();
});

// Express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
    
    while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
    }
    return {
        param: formParam,
        msg: msg,
        value: value
    };
    }
}));


app.get('/', function(req, res) {
    db.customers.find(function(err, docs) {
        console.log(docs)
        res.render('index.ejs', {
            title:"List of Customers",
            customers: docs
        });
    });
    
});

app.post('/customers/add', function(req, res) {

    req.checkBody('name', 'name is required').notEmpty();
    req.checkBody('age', 'age is required').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        res.render('index.ejs', {
            title:"Dumb etwin",
            customers: customers, 
            errors: errors
        });
    } else{
        var newUser = {
            name: req.body.name,
            age: req.body.age
        }
    db.customers.insert(newUser, function(err, result) {
        if(err) {
            console.log(err);
        }
        else{
            res.redirect('/')
        }
    });
    }
    
});

app.delete('/customers/delete/:id', function(req, res) {
    db.customers.remove({_id: ObjectId(req.params.id)}, function(err, result) {
        if(err){
            console.log(err);
        }
        res.redirect('/');
    });
});

app.listen(3004, function() {
    console.log("Server started on port 3004....");
})