var keystone = require('keystone');
var Event = keystone.list('Event');
var async = require('async');


exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'apply';
	locals.freeEvents = Event.fields.freeEvent.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.applySubmitted = false;

	//

 	locals.data = {
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



	// On POST requests, add the Apply item to the database
	view.on('post', { action: 'apply' }, function (next) {

		var newEvent = new Event.model();
		var updater = newEvent.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'eventTitle, eventTime, freeEvent, cities, ticketLink, eventAdress, eventEmail, eventIntroduction',
			errorMessage: 'There was a problem submitting your enquiry:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.applySubmitted = true;
			}
			next();
		});
	});

	view.render('discovers/event/apply');
};
