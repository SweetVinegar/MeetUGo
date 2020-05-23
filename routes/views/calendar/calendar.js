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

 	locals.data = { 
		calendar: [],
		friendcalendar: [],
		lastevent:[]
	};
	locals.mycalendar = {};

	var sixhour = Date.now() - 21600000;

if(req.user)
{
//-----friends = who I followed also follow me-----------------
	view.on('init', function(next) {
		//load who I followed
			keystone.list('User').model.findOne({_id:req.user._id})
			.exec(function(err, result) {
		//load who I followed also follow me				
				keystone.list('User').model.find({_id:{$in:result.friends},friends:req.user._id})
				.exec(function(err, results) {
					res.bothfriends = results;
				 	next();
				});		
			});		
	});

	// Load the events
	view.on('init', function (next) {


	var q = keystone.list('Calendar')
	        .model
	        .find({time:{$gte:sixhour},"$or":[{who:req.user._id},{who:{$in:res.bothfriends},class:'Public Schedule'},{who:{$in:res.bothfriends},class:'Event'}]})
			.sort('time')
			.populate('who event');

		q.exec(function (err, results) {
			locals.data.calendar = results;
			next(err);
		});

	});

	// Load friend events
	view.on('init', function (next) {

	var q = keystone.list('Calendar')
	        .model
	        .find({time:{$gte:sixhour},"$or":[{who:req.user._id},{who:{$in:res.bothfriends}}],class:'Event'})
			.sort('time')
			.populate('who event');

		q.exec(function (err, results) {
			locals.data.friendcalendar = results;
			next(err);
		});
	});


//my events
	view.on('init', function(next) {
		if (!req.user) return next();
			keystone.list('Calendar').model.find({time:{$gte:sixhour}})
			.where('who', req.user._id)
	//		.populate('event')
			.exec(function(err, result) {
				locals.mycalendar = result;
				 next();
			});		
	});

//RSVP

	view.on('post', { action: 'add' }, function (next) {

			keystone.list('Calendar')
	        .model
	        .findOne({event:req.body.event, who:req.user._id})
			.exec(function (err, result) {
			if(result)
				{
				next(err);
				}
			else
			{
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
						res.redirect('back');	
					}
				});
			}
		});

	});

}








	view.on('init', function (next) {
	var q = keystone.list('Event')
	        .model
	        .findOne({eventTime:{$gte:Date.now()},state:'published'})
			.sort('eventTime')
			.populate('cities');

		q.exec(function (err, result) {
			locals.data.lastevent = result;
			next(err);
		});
	});














//signin


	view.on('post', { action: 'signin' }, function (next) {
		res.cookie('lastUrl', req.path);
		res.redirect('/signin');
	});


	view.render('calendar/calendar');
	
};
//