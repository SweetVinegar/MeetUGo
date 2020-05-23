var keystone = require('keystone');
var Calendar = keystone.list('Calendar');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
//	locals.freeEvents = Event.fields.freeEvent.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.applySubmitted = false;
	locals.isEvent = false;
    locals.timeNow = Date.now;



//See if it's event
	view.on('get', { action: 'isEvent' }, function (next) {
       res.redirect('/event'); 
	});
	view.on('get', { action: 'notEvent' }, function (next) {
       locals.isEvent = true;
        next();
	});


	view.on('post', { action: 'create' }, function (next) {

		var newCalendar= new Calendar.model();
		var updater = newCalendar.getUpdateHandler(req);
         

		updater.process(req.body, {
			flashErrors: true,
			//fields: 'who, title, time',
			fields: 'who, title, time, location, description, class',
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



	// Render the view
	view.render('calendar/create');
};
