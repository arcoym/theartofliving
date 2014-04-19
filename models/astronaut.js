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


// define astronaut schema
var AstronautSchema = new Schema({
    slug : { type: String, lowercase: true, required: true, unique: true },
	reminder : { type: String, required: true, validate: [nameValidation, 'Name must be at least 5 characters.']},
	reminderDate : Date,
	missions : [String],
	photo : String,
	source : {
		name : String,
		url : String
	},
	skills : [String],
    lastupdated : { type: Date, default: Date.now },
});


// export 'Astronaut' model
module.exports = mongoose.model('Astronaut',AstronautSchema);