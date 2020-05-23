var keystone = require('keystone');
	_ = require('lodash'),
	moment = require('moment');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	//locals.section = 'events';

	
	var me = req.user;
 	locals.data = { 
		event: [],
	};


	// Load the events
	view.on('init', function (next) {

	var q = keystone.list('Event')        
	        .model
	        .find({author:me})
			.sort('-eventTime');


		q.exec(function (err, results) {
			locals.data.event = results;
			next(err);
		});
	});



	view.render('discovers/event/myevent');
	
};