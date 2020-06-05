
const mongoose = require("mongoose");

const express = require('express');
const session = require('express-session')
const Question = require("./QuestionModel");
const User = require("./UserModel");
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
	uri: 'mongodb://localhost:27017/tokens',
	collection: 'sessions'
	
});

const app = express();

app.use(session({ secret: 'This is my secret LUL.', store : store}));

app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.json());

//Render home page
app.get('/', function(req, res, next) {
	if(req.session.loggedin){
		res.render("pages/index", {user: req.session, loggedin: req.session.loggedin});
	}else{
		res.render("pages/index");
	}
	return;
});

//Returns a page with a new quiz of 10 random questions
app.get("/quiz", function(req, res, next){
	Question.getRandomQuestions(function(err, results){
		if(err) throw err;
		if(req.session.loggedin){
			res.status(200).render("pages/quiz", {questions: results, user: req.session, loggedin: req.session.loggedin});
		}else{
			res.status(200).render("pages/quiz", {questions: results, user: req.session, loggedin: req.session.loggedin});

		}
		return;
	});
})

//The quiz page posts the results here
//Extracts the JSON containing quiz IDs/answers
//Calculates the correct answers and replies
app.post("/quiz", function(req, res, next){
	let ids = [];
	try{
		//Try to build an array of ObjectIds
		for(id in req.body){
			ids.push(new mongoose.Types.ObjectId(id));
		}
		
		//Find all questions with Ids in the array
		Question.findIDArray(ids, function(err, results){
			if(err)throw err; //will be caught by catch below
			
			//Count up the correct answers
			let correct = 0;
			for(let i = 0; i < results.length; i++){
				if(req.body[results[i]._id] === results[i].correct_answer){
					correct++;
				}
			}
			//If the user is logged in record it
			if(req.session.loggedin){
				User.find({'username': req.session.username}, function(err, results){
					
					results[0]["total_score"] += correct;
					results[0]["total_quizzes"]++;
					
					results[0].save(function(err){
						if(err){	
							res.status(400).send();
						}
					});
					
					console.log(results[0]);
					//Send response if logged in
					res.json({url: "/users/"+results[0]["_id"], correct: correct});
					return;
				});

			}else{
			
				//Send response if not logged in
				res.json({url: "/", correct: correct});
			
				return;
			}
		});
	}catch(err){
		//If any error is thrown (casting Ids or reading database), send 500 status
		console.log(err);
		res.status(500).send("Error processing quiz data.");
		return;
	}
	
});
//Renders an html list of all non-private users
app.get("/users", function(req, res, next){
	//Check if someone is logged in
	if(req.session.loggedin){
		User.find({'$or' : [{'privacy': false}, {'username' : req.session.username}]}, function(err, results){
			res.render("pages/users", {user: req.session, users: results, loggedin: req.session.loggedin});
		});			
		
	}else{
		User.find({'privacy': false}, function(err, results){
			res.render("pages/users", {users: results});		
		});				
	}

});
//Renders an html page of a single user
app.get("/users/:userID", function(req, res, next){
	//Find a specific user, and if that user is the one logged in, render a seperate html
	User.find({'_id': req.params.userID}, function(err, results){
		console.log(results[0]);
		if(results[0].privacy == true){
			res.status(403).send("Profile cannot be accessed");
			return;
		}
		console.log(results[0]["total_score"]);
		if(results[0]["total_score"] != 0){
			let avg = results[0]["total_score"]/results[0]["total_quizzes"];
			res.render("pages/user", {average: avg, user: req.session, userA: results[0], session: req.session.loggedin, loggedin: req.session.loggedin });
		}else{
			res.render("pages/user", {average: 0, userA: results[0], session: req.session.loggedin, loggedin: req.session.loggedin});
	
		}
	});
	
});
//Log in if the password and username is correct
app.post("/login", function(req, res, next){
	if(req.session.loggedin){
		res.status(200).send("Already logged in.");
		return;
	}
	console.log(req.body);
	let username = req.body.username;
	let password = req.body.password;
	//Find a user equal to the typed username
	User.findOne({username: username}, function(err, result){
		if(err)throw err;
		
		console.log(result);
		//If there is a mismatch, send an error
		if(result){
			if(result.password === password){
				req.session.loggedin = true;
				req.session.username = username;
				req.session["_id"] = result["_id"];
				res.status(200).send(result["_id"]);
			}else{
				res.status(401).send("Not authorized. Invalid password.");
			}
		}else{
			res.status(401).send("Not authorized. Invalid username.");
			return;
		}
		
	});
});
//Log out if logged in, send an error if not logged in
app.get("/logout", function(req, res, next){
	console.log("SSS" + req.session.loggedin);
	if(req.session.loggedin){
		req.session.loggedin = false;
		res.render("pages/index");
	}else{
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
});
//Set the privacy of the logged in user depending on the request
app.post("/privacy", function auth(req, res, next) {
	console.log(req.body.privacy);
	//Find the user and set their privacy to on or off, it is implied that the user is logged in as the only way to set your privacy is if youre logged in
	if(req.body.privacy == "on"){
		req.session.privacy = true;
		User.find({'username': req.session.username}, function(err, results){
			results[0].privacy = true;
			results[0].save(function(err){
				if(err){	
					res.status(400).send();
				}
				
			});
			console.log(results);
		});
	//Off version of the above code
	}else if(req.body.privacy == "off"){
		req.session.privacy = false;
		User.find({'username': req.session.username}, function(err, results){
			results[0].privacy = false;
			results[0].save(function(err){
				if(err){	
					res.status(400).send();
				}
				
			});
			console.log(results);
		});
	}
});


//Connect to database
mongoose.connect('mongodb://localhost/quiztracker', {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	app.listen(3000);
	console.log("Server listening on port 3000");
});