var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'events';

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

	var q = keystone.list('Event')        
	        .model
	        .find({eventTime:{$gte:yesterday},state:'draft'})
			.sort('eventTime')
			.populate('cities');

		q.exec(function (err, results) {
			locals.data.event = results;
			next(err);
		});
	});

/**
 	// Load all tickets
	view.on('init', function(next) {

		var q = keystone.list('Event').model.find();
		 
		q.exec(function(err, results) {
			locals.data.event = results;
			next(err);
		});
	});
	**/ 
	// Render the view

	view.render('discovers/event/unevent');
	
};