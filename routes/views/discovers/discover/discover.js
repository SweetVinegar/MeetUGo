var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'discovers';

	locals.filters = {
		category: req.params.category,
	};
	
 	locals.data = { 
		discover: [],
		categories: [],
	};

	// Load all categories
	view.on('init', function (next) {

		keystone.list('DiscoverCategory').model.find().sort('name').exec(function (err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.data.categories = results;

			// Load the counts for each category
			async.each(locals.data.categories, function (category, next) {

				keystone.list('Discover').model.count().where('categories').in([category.id]).exec(function (err, count) {
					category.postCount = count;
					next(err);
				});

			}, function (err) {
				next(err);
			});
		});
	});

	// Load the current category filter
	view.on('init', function (next) {

		if (req.params.category) {
			keystone.list('DiscoverCategory').model.findOne({ key: locals.filters.category }).exec(function (err, result) {
				locals.data.category = result;
				next(err);		
			});
		} else {
			next();
		}
	});

	// Load the discovers
	view.on('init', function (next) {

	var q = keystone.list('Discover')        
	        .model
	        .find({'state':'published'})
			.sort('-publishedDate')
			.populate('categories');

		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}

		q.exec(function (err, results) {
			locals.data.discover = results;
			next(err);
		});
	});


	view.render('discovers/discover/discover');
	
};