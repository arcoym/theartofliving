
/*
 * routes/index.js
 * 
 * Routes contains the functions (callbacks) associated with request urls.
 */

var request = require('request'); // library to make requests to remote urls

var moment = require("moment"); // date manipulation library
var reminderModel = require("../models/reminder.js"); //db model


/*
	GET /
*/
exports.index = function(req, res) {
	
	console.log("main page requested");

	// query for all astronauts
	// .find will accept 3 arguments
	// 1) an object for filtering {} (empty here)
	// 2) a string of properties to be return, 'name slug source' will return only the name, slug and source returned astronauts
	// 3) callback function with (err, results)
	//    err will include any error that occurred
	//	  allAstros is our resulting array of astronauts
	reminderModel.find({}, 'name slug source', function(err, allReminds){

		if (err) {
			res.send("Unable to query database for reminders").status(500);
		};

		console.log("retrieved " + allReminds.length + " reminders from database");

		var templateData = {
			reminder : allReminds,
			pageTitle : "Reminders (" + allReminds.length + ")"
		}

		res.render('index.html', templateData);

	});
}

exports.data_all = function(req, res) {

	reminderQuery = reminderModel.find({}); // query for all astronauts

	reminderQuery.sort('-reminderDate');
	
	reminderQuery.select('reminder reminderDate tags');
	

	reminderQuery.exec(function(err, allReminds){
		// prepare data for JSON
		var jsonData = {
			status : 'OK',
			reminder : allReminds
			
		}

		res.json(jsonData);
	});

}

/*
	GET /reminders/:reminder_id
*/
exports.detail = function(req, res) {

	console.log("detail page requested for " + req.params.reminder_id);

	//get the requested reminders by the param on the url :astro_id
	var reminder_id = req.params.reminder_id;


	var reminderQuery = reminderModel.findOne({slug:reminder_id});
	reminderQuery.exec(function(err, currentReminder){

		if (err) {
			return res.status(500).send("There was an error on the reminder query");
		}

		if (currentReminder == null) {
			return res.status(404).render('404.html');
		}

		console.log("Found astro");
		console.log(currentReminder.reminder);

		// formattedDate function for currentReminder
		currentReminder.formattedDate = function() {
			// formatting a JS date with moment
			// http://momentjs.com/docs/#/displaying/format/
            return moment(this.reminderDate).format("dddd, MMMM Do YYYY");
        };
		
		//query for all reminders, return only name and slug
		reminderModel.find({}, 'name slug', function(err, allReminds){

			console.log("retrieved all reminders : " + allReminds.length);

			//prepare template data for view
			var templateData = {
				reminder : currentReminder,
				reminder : allReminds,
				pageTitle : currentReminder.reminder
			}

			// render and return the template
			res.render('detail.html', templateData);


		}) // end of .find (all) query
		
	}); // end of .findOne query

}

exports.data_detail = function(req, res) {

	console.log("detail page requested for " + req.params.reminder_id);

	//get the requested reminder by the param on the url :astro_id
	var reminder_id = req.params.reminder_id;

	// query the database for reminder
	var reminderQuery = reminderModel.findOne({slug:reminder_id});
	reminderQuery.exec(function(err, currentReminder){

		if (err) {
			return res.status(500).send("There was an error on the reminder query");
		}

		if (currentReminder == null) {
			return res.status(404).render('404.html');
		}


		// formattedDate function for currentReminder
		currentReminder.formattedDate = function() {
			// formatting a JS date with moment
			// http://momentjs.com/docs/#/displaying/format/
            return moment(this.date).format("dddd, MMMM Do YYYY");
        };
		
		//prepare JSON data for response
		var jsonData = {
			reminder : currentReminder,
			status : 'OK'
		}

		// return JSON to requestor
		res.json(jsonData);

	}); // end of .findOne query

}

/*
	GET /create
*/

exports.reminderForm = function(req, res){

	var templateData = {
		page_title : 'Enlist a new Reminder'
	};

	res.render('create_form.html', templateData);
}


/*
	POST /create
*/
exports.createReminder = function(req, res) {

	console.log("received form submission");
	console.log(req.body);

	// accept form post data
	var newReminder = new reminderModel({
		reminder : req.body.reminder,
		slug : req.body.reminder
		//.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_')

	});

	// you can also add properties with the . (dot) notation
	if (req.body.reminderDate) {
		newReminder.reminderDate = moment(req.body.reminderDate).toDate();
	}

	newReminder.tag = req.body.tag.split(",");


		newReminder.save(function(err){
		if (err) {
			console.error("Error on saving new reminder");
			console.error(err); // log out to Terminal all errors

			var templateData = {
				page_title : 'Save a new reminder',
				errors : err.errors, 
				reminder : req.body
			};

			res.render('create_form.html', templateData);
			// return res.send("There was an error when creating a new reminder");

		} else {
			console.log("Created a new reminder!");
			console.log(newReminder);
			
			// redirect to the reminder's page
			res.redirect('/reminders/'+ newReminder.slug)
			}
		});	
	};

exports.editReminderForm = function(req, res) {

	// Get reminder from URL params
	var reminder_id = req.params.reminder_id;
	var reminderQuery = reminderModel.findOne({slug:reminder_id});
	reminderQuery.exec(function(err, reminder){

		if (err) {
			console.error("ERROR");
			console.error(err);
			res.send("There was an error querying for "+ reminder_id).status(500);
		}

		if (reminder != null) {

			// birthdateForm function for edit form
			// html input type=date needs YYYY-MM-DD format
			reminder.reminderdateForm = function() {
					return moment(this.reminderdate).format("YYYY-MM-DD");
			}

			// prepare template data
			var templateData = {
				reminder : reminder
			};

			// render template
			res.render('edit_form.html',templateData);

		} else {

			console.log("unable to find reminder: " + reminder_id);
			return res.status(404).render('404.html');
		}

	})

}

exports.updateReminder = function(req, res) {

	// Get reminder from URL params
	var reminder_id = req.params.reminder_id;

	// prepare form data
	var updatedData = {
		reminder : req.body.reminder,
		reminderDate : moment(req.body.reminderDate).toDate(),
		tag : req.body.tag.split(","),		
	}


	// query for reminder
	reminderModel.update({slug:reminder_id}, { $set: updatedData}, function(err, reminder){

		if (err) {
			console.error("ERROR: While updating");
			console.error(err);			
		}

		if (reminder != null) {
			res.redirect('/reminders/' + reminder_id);

		} else {

			// unable to find reminder, return 404
			console.error("unable to find reminder: " + reminder_id);
			return res.status(404).render('404.html');
		}
	})
}


exports.deleteReminder = function(req,res) {

	// Get reminder from URL params
	var reminder_id = req.params.reminder_id;

	// if querystring has confirm=yes, delete record
	// else display the confirm page

	if (req.query.confirm == 'yes')  {  // ?confirm=yes
	
		reminderModel.remove({slug:reminder_id}, function(err){
			if (err){ 
				console.error(err);
				res.send("Error when trying to remove reminder: "+ reminder_id);
			}

			res.send("Removed reminder. <a href='/'>Back to home</a>.");
		});

	} else {
		//query reminder and display confirm page
		reminderModel.findOne({slug:reminder_id}, function(err, reminder){

			if (err) {
				console.error("ERROR");
				console.error(err);
				res.send("There was an error querying for "+ reminder_id).status(500);
			}

			if (reminder != null) {

				var templateData = {
					reminder : reminder
				};
				
				res.render('delete_confirm.html', templateData);
			
			}
		})

	}
};


exports.remote_api = function(req, res) {

	var remote_api_url = 'http://itpdwdexpresstemplates.herokuapp.com/data/reminders';
	// var remote_api_url = 'http://localhost:5000/data/astronauts';

	// make a request to remote_api_url
	request.get(remote_api_url, function(error, response, data){
		
		if (error){
			res.send("There was an error requesting remote api url.");
			return;
		}

		// Step 2 - convert 'data' to JS
		// convert data JSON string to native JS object
		var apiData = JSON.parse(data);

		console.log(apiData);
		console.log("***********");


		// STEP 3  - check status / respond
		// if apiData has property 'status == OK' then successful api request
		if (apiData.status == 'OK') {

			// prepare template data for remote_api_demo.html template
			var templateData = {
				reminder : apiData.reminder,
				rawJSON : data, 
				remote_url : remote_api_url
			}

			return res.render('remote_api_demo.html', templateData);
		}	
	})
};

exports.set_session = function(req, res) {

	// set the session with the submitted form data
	req.session.userName = req.body.reminder;
	req.session.userColor = req.body.fav_color;

	// redirect back to where they came from
	console.log(req.referrer);
	res.redirect('/');

}





