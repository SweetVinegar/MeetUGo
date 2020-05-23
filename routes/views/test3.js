var keystone = require('keystone');
var Calendar = keystone.list('Calendar');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
//	locals.section = 'event';
    locals.applySubmitted = false;
    locals.validationErrors ={};
	locals.showmap = false;

	locals.filters = {
		user: req.params.a,
		event: req.params.b,
	};




	locals.data = {
		who:[],
		event: [],

	};

	// Load the event
	view.on('init', function (next) {

		var q = keystone.list('Event').model.findOne({
			slug: locals.filters.event
		}).populate('cities');

		q.exec(function (err, result) {
			locals.data.event = result;
			next(err);
		});
	});



	// Load the user
	view.on('init', function (next) {

		var q = keystone.list('User').model.findOne({
			//state: 'published',
			_id: locals.filters.user,
		});

		q.exec(function (err, result) {
			locals.data.who = result;
			next(err);
		});

	});


	// Render the view
	view.render('test3');
};
