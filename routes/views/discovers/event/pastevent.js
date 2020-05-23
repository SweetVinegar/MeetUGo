var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'events';

	
 	locals.data = { 
		event: [],
	};

	// Load all cities


	// Load the events
	view.on('init', function (next) {

	var yesterday = Date.now() - 86400000;

	var q = keystone.list('Event')        
	        .model
	        .find({eventTime:{$lte:yesterday},state:'published'})
			.sort('-eventTime')

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

	view.render('discovers/event/pastevent');
	
};