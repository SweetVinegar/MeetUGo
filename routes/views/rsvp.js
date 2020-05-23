var keystone = require('keystone');
var Event = keystone.list('Event');
var RSVP = keystone.list('RSVP');


exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'apply';
	locals.validationErrors = {};
	locals.applySubmitted = false;

	
	locals.rsvp = {};
	locals.rsvpStatus = {};
	locals.user = req.user;
	locals.filters = {
		event: req.params.event,
	};
	locals.data = {
		events: [],
		rsvps:[],
	};



	view.on('init', function (next) {

		var q = keystone.list('Event').model.findOne({
			state: 'published',
			slug: locals.filters.event,
		}).populate('');

		q.exec(function (err, result) {
			locals.data.event = result;
			next(err);
		});

	});

	// Load an RSVP
	
	view.on('init', function(next) {
		if (!req.user) return next();
			RSVP.model.findOne()
			.where('who', req.user._id)
			.where('event', locals.data.event._id)
			.exec(function(err, result) {
				locals.rsvpStatus = {
					iRsvped: result ? true : false,
					iAttending: result && result.attending ? true : false
				}
				return next();
			});		
	});

	// Attend the event
	view.on('post', { action: 'attend' }, function (next) {
      	if (!req.user || !locals.data.event) return next();
		
		RSVP.model.findOne()
			.where('who', req.user._id)
			.where('event', locals.data.event._id)
			.exec(function(err, result) {
				if (err) return next(err);         
                result.attending = true;
                result.save(function(err) {
 				if (err) {
 					next(err);
					//locals.validationErrors = err.errors;
				} else {
					res.redirect('/rsvp');					
				}
				next();
            	});
            });		
		});



	view.on('post', { action: 'rsvp' }, function (next) {

    		var newRSVP = new RSVP.model();
			var updater = newRSVP.getUpdateHandler(req);

			updater.process(req.body, {
				flashErrors: true,
				fields: 'event, who',
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


	view.on('post', { remove: 'delete' }, function (next) {

		if (!req.user) {
			req.flash('error', 'You must be signed in to delete a rsvp.');
			return next();
		}

		RSVP.model.findOne()
			.where('who', req.user._id)
			.where('event', locals.data.event._id)
			.remove(function(err){
				if (err) {
				locals.validationErrors = err.errors;
				} else {
					locals.applySubmitted = true;
				}
				next();
			}); 			
	});


	view.render('rsvp');
};

