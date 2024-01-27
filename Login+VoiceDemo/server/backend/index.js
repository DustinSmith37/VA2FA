
const express = require("express");
const mysql = require("mysql2");
var crypto = require("crypto");
var sha256 = require("js-sha256");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');

const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);


var dealing_through_users_database = require('knex')({
  client: "mysql2",
  connection: {
	  host: MYSQLHOST,
	  user: MYSQLUSER,
	  password: MYSQLPASS,
	  database: "users"  
  }
}); 

var dealing_through_logs_database = require('knex')({
  client: "mysql2",
  connection: {
	  host: MYSQLHOST,
	  user: MYSQLUSER,
	  password: MYSQLPASS,
	  database: "logs"
	  
  }
}); 



const app = express();
app.use(express.json());

app.use("/", express.static("frontend"));


var identification_id = 0;  //global variable to use as id number


app.post("/redirect", function (req, res) {
	
	var token_to_be_checked = JSON.stringify(req.body.passed_token); //pulls token
		
	token_to_be_checked = token_to_be_checked.substring(1); //removes quote marks about the token
	token_to_be_checked = token_to_be_checked.substring(0, token_to_be_checked.length - 1);
	
	jwt.verify(token_to_be_checked, "secret", (err) => { //verifys token 
		
		if(err){
			
			res.sendStatus(401); //send 401 error message if token can't be verified 
			res.end();
		}
	
		else{ //if token is verified 
		
			var payload = jwt_decode(token_to_be_checked);
			
			if(payload.name == "GMiculek" || payload.name == "lo" || payload.name == "averie" || payload.name == "slimjim" ){ //checks username
				
				res.send("2"); //sends user to query page
			}
			
			else{
				
				res.send("1");  //sends user to funfacts page
			}
			
		}
	})	
	res.end();	
})


	
app.post("/login", function (req, res) {
	 
	var String_of_user = JSON.stringify(req.body.supplied_user); 
	var String_of_pass = JSON.stringify(req.body.supplied_pass);

	var time_log = Math.floor(Date.now() / 1000); //gets current time stamp
	
	
	identification_id = identification_id +1; //increase id number by 1
	
	
	
	String_of_user2 = String_of_user.replace(/^"(.*)"$/, '$1');
  
    dealing_through_users_database.select('username').from('users').where("username", String_of_user2).asCallback(function(err, results) { //searchs if username is present in database
	    
	  if (results == ""){  //if username is not found in data base
	 
			if(String_of_pass == '""'){ //if user not found in data and no password provided
			
				log_attempts(identification_id, time_log, String_of_user2, "''", 'failure', 'cannot verify', ''); //run log function
				
			}
	 
			else{//if user not found in data and password provided, bycrypts password for log table
				
				bcrypt.hash(String_of_pass, 10, function(err, hash) { 
	
				log_attempts(identification_id, time_log, String_of_user2, hash, 'failure', 'cannot verify', ''); //run log function
				
				})
			}
				  
		  res.sendStatus(401); //send 401 error message
		  res.end();
		  
	  }
	  
	  else{ //if username was in data base 
		  
			if(String_of_pass == '""'){ //if no password was provided
				
				log_attempts(identification_id, time_log, String_of_user2, "''", 'cannot verify', 'failure', '');
				
			}
					
			else{
		  
		  
				bcrypt.hash(String_of_pass, 10, function(err, hash) { //brcypts the password 
				
				dealing_through_users_database.select('password').from('users').where("username", String_of_user2).asCallback(function(err, SQL_find_if_valid_passordRes) {
					
					const dbhash = SQL_find_if_valid_passordRes[0].password;
						
					bcrypt.compare(String_of_pass, dbhash, function(err, result) { //compares the password to the bcrypy hash
						
						if (result) { //if they match
							
							dealing_through_users_database.select('*').from('users').where("username", String_of_user2).asCallback(function(err, results) { //gets all data about the confirmed user
					
							the_user_contents = JSON.stringify(results)
					
					
							const myArray = the_user_contents.split(/[: ,"{""}"]+/);
					
					
							myArray.shift(); //drops quotes
							myArray.pop();
					
							const USER_ID = { id_number: identification_id}
						
							const accessToken = jwt.sign(USER_ID, "secret"); //creates a token with the username, password, email, affiliation. Will expire in 10 seconds
							
							log_attempts(identification_id, time_log, String_of_user2, dbhash, 'success', 'cannot verify', "10 seconds"); //run log function
							
							res.json({ Token: accessToken }) //sends back the token 
							res.end();
							});
							
							}
						
						else{ //if they don't match
						
							log_attempts(identification_id, time_log, String_of_user2, hash, 'failure', 'cannot verify', ''); //run log function
							res.sendStatus(401); //send 401 error message
							res.end();
										
							}
						
					});
		
				})
  
			})
	  
		}
	  
	  }
  })
  
});

function log_attempts(IDnum, TimeIn, Username, Passhash, YorN, Verfying,  Token){ //log function 
	
					var values = [
					
					[IDnum, TimeIn, Username, Passhash, YorN, Token]
					
					]; 
					
					
					dealing_through_logs_database("logs").insert([{ //inserts the data into the log database
						id_number: IDnum,
						time_in: TimeIn, 
						username: Username, 
						password: Passhash, 
						log_attempt: YorN, 
						verification: Verfying,
						token_length: Token}
						])
						.then(() => {console.log("logged attempt")})
						
						
}


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);