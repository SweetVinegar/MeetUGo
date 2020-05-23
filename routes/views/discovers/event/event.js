var keystone = require('keystone');
var async = require('async');
var Calendar = keystone.list('Calendar');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'events';
	locals.applySubmitted = false;
	locals.validationErrors = {};
	locals.mycalendar = {};


	locals.filters = {
		city: req.params.city,
	};
	
 	locals.data = { 
		event: [],
		cities: [],
	};

	// Load all cities
	view.on('init', function (next) {

		keystone.list('EventCity').model.find().sort('name').exec(function (err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.data.cities = results;

			// Load the counts for each city
			async.each(locals.data.cities, function (city, next) {

				keystone.list('Event').model.count().where('cities').in([city.id]).exec(function (err, count) {
					city.postCount = count;
					next(err);
				});

			}, function (err) {
				next(err);
			});
		});
	});

	// Load the current city filter
	view.on('init', function (next) {

		if (req.params.city) {
			keystone.list('EventCity').model.findOne({ key: locals.filters.city }).exec(function (err, result) {
				locals.data.city = result;
				next(err);		
			});
		} else {
			next();
		}
	});

	// Load the events
	view.on('init', function (next) {
    var yesterday = Date.now() - 86400000;

	if(req.user){
			var q = keystone.list('Event')        
	        .model
	        .find({"$or":[{eventTime:{$gte:yesterday},state:'published'},{eventTime:{$gte:yesterday},author:req.user._id}]})
			.sort('eventTime')
			.populate('cities');

	}

	if(!req.user){
				var q = keystone.list('Event')        
	        .model
	        .find({eventTime:{$gte:yesterday},state:'published'})
			.sort('eventTime')
			.populate('cities');
	}

		if (locals.data.city) {
			q.where('cities').in([locals.data.city]);
		}
		q.exec(function (err, results) {
			locals.data.event = results;
			next(err);
		});
	});


	//
	var sixhour = Date.now() - 21600000;
	view.on('init', function(next) {
		if (!req.user) return next();
			Calendar.model.find({time:{$gte:sixhour}})
			.where('who', req.user._id)
	//		.populate('event')
			.exec(function(err, result) {
				locals.mycalendar = result;
				 next();
			});		
	});


//signin


	view.on('post', { action: 'signin' }, function (next) {
		res.cookie('lastUrl', req.path);
		res.redirect('/signin');
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
				res.redirect('/');	
			}
			next();
		});
	});







	view.render('discovers/event/event');
	
};