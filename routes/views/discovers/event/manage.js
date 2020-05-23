var keystone = require('keystone');
var Event = keystone.list('Event');
var Calendar = keystone.list('Calendar');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.filters = {
		manage: req.params.manage,
	};
	locals.data = {
		events: [],
		calanders:[]

	};




	// Load the current post

	view.on('init', function (next) {

		Event.model.findOne({
		//	state: 'published',
			_id: locals.filters.manage,
			author: req.user,
		}).populate('author cities').exec(function (err, result) {
			locals.data.event = result;
			next(err);
			});
	  });


	view.on('init', function (next) {

		Calendar.model.find({

			event: locals.data.event._id,
		}).populate('who').exec(function (err, results) {
			locals.data.calanders = results;
			next(err);
			});
	  });



	// Render the view
	view.render('discovers/event/manage');
};
