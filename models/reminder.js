var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// validation function
var nameValidation = function(val) {
	console.log("inside name validation");
	console.log(val);
	
	if (val.length >= 5) {
		return true;
	} else {
		return false;
	}
}


// define new schema
var reminderSchema = new Schema({
    slug : { type: String, lowercase: true, required: true, unique: true },
	//reminder : { type: String, required: true, validate: [nameValidation, 'Name must be at least 5 characters.']},
	reminder : { type: String, required: true },
	reminderDate : Date,
	tag: {type: String, lowercase: true, required: true},
    posted : { type: Date, default: Date.now },
});


// export 'Astronaut' model
module.exports = mongoose.model('reminders',reminderSchema);