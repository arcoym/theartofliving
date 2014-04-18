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


// ship's log schema --> WHAT IS THIS?
var shipLogSchema = new Schema({
	date : Date,
	content : String
})


// define new schema
var reminderSchema = new Schema({
    slug : { type: String, lowercase: true, required: true, unique: true },
	reminder : { type: String, required: true, validate: [nameValidation, 'Name must be at least 5 characters.']},
	reminderDate : Date,
	photo : String,
	tags : [String],
	walkedOnMoon : Boolean,
    posted : { type: Date, default: Date.now },
	//shiplogs : [shipLogSchema]
});


// export 'Astronaut' model
module.exports = mongoose.model('reminder',reminderSchema);