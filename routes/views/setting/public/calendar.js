var keystone = require('keystone');
var async = require('async');
var Calendar = keystone.list('Calendar');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	//locals.section = 'events';
    locals.signin = false;

    	locals.filters = {
		who: req.params.who,
	};

 	locals.data = { 
		calendars: [],
		who:[],
		mycalendar:[],
	};




//load who own the calendar

	view.on('init', function (next) {

		var q = keystone.list('User').model.findOne({
			//state: 'published',
			_id: locals.filters.who,
		})

		q.exec(function (err, result) {
			locals.data.who = result;
			next(err);
		});

	});



	// Load the events
	view.on('init', function (next) {

	var sixhour = Date.now() - 21600000;

	var q = keystone.list('Calendar')
	        .model
			.find({"$or":[{time:{$gte:sixhour},who:locals.filters.who,class:'Public Schedule'},{time:{$gte:sixhour},who:locals.filters.who,class:'Event'}]})
			.sort('time')
            .populate('event who');

		q.exec(function (err, results) {
			locals.data.calendar = results;
			next(err);
		});
	});



//load local user calendar

	var sixhour = Date.now() - 21600000;

	view.on('init', function(next) {
		if (!req.user) return next();
			Calendar.model.find({time:{$gte:sixhour}})
			.where('who', req.user._id)
			.exec(function(err, result) {
				locals.data.mycalendar = result;
				 next();
			});		
	});




//RSVP

	view.on('post', { action: 'add' }, function (next) {

		var newCalendar= new Calendar.model();
		var updater = newCalendar.getUpdateHandler(req);
         

		updater.process(req.body, {
			flashErrors: true,
			fields: 'who, title, time, location, description, class, event',
			errorMessage: 'There was a problem submitting your enquiry:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.applySubmitted = true;
				res.redirect('/calendar');	
			}
			next();
		});
	});








	view.render('setting/public/calendar');
	
};
//