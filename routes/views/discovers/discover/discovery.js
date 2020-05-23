var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'discover';
	locals.filters = {
		discovery: req.params.discovery,
	};
	locals.data = {
		discoveries: [],
	};

	// Load the current post
	view.on('init', function (next) {

		var q = keystone.list('Discover').model.findOne({
			state: 'published',
			slug: locals.filters.discovery,
		}).populate('categories');

		q.exec(function (err, result) {
			locals.data.discovery = result;
			next(err);
		});

	});

	// Load other posts
	view.on('init', function (next) {

		var q = keystone.list('Discover').model.find().where('state', 'published').sort('-publishedDate').populate('categories');

		q.exec(function (err, results) {
			locals.data.discoveries = results;
			next(err);
		});

	});

	// Render the view
	view.render('discovers/discover/discovery');
};
