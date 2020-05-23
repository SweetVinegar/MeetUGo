var keystone = require('keystone');
var async = require('async');



var Exhibition = keystone.list('Exhibition');


exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	



	locals.filters = {
		city: req.params.city,
	};
	
 	locals.data = { 
		exhibition: [],
		cities: [],
	};

	locals.ongoing = true;








	// Load all cities
	view.on('init', function (next) {

		keystone.list('EventCity').model.find().sort('name').exec(function (err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.data.cities = results;

			// Load the counts for each city
			async.each(locals.data.cities, function (city, next) {

				Exhibition.model.count().where('cities').in([city.id]).exec(function (err, count) {
					city.postCount = count;
					next(err);
				});

			}, function (err) {
				next(err);
			});
		});
	});

	// Load the current city filter
	view.on('init', function (next) {

		if (req.params.city) {
			keystone.list('EventCity').model.findOne({ key: locals.filters.city }).exec(function (err, result) {
				locals.data.city = result;
				next(err);		
			});
		} else {
			next();
		}
	});




	// Load the events
	view.on('init', function (next) {
    var yesterday = Date.now() - 86400000;
    var tomorrow = Date.now() + 86400000;


			var q = Exhibition       
	        .model
	        .find({start:{$lte:tomorrow},end:{$gte:yesterday},state:'published'})
			.sort('end')
			.populate('cities');


		if (locals.data.city) {
			q.where('cities').in([locals.data.city]);
		}
		q.exec(function (err, results) {
			locals.data.exhibition = results;
			next(err);
		});
	});


	view.on('get', { action: 'ongoing' }, function (next) {
		locals.ongoing = true;
		next();
	});

	view.on('get', { action: 'furture' }, function (next) {
		locals.ongoing = false;
	    var yesterday = Date.now() - 86400000;
	    console.log( 'Ongoing?:'+ locals.ongoing);

					var q = Exhibition       
		        .model
		        .find({start:{$gte:yesterday},state:'published'})
				.sort('start')
				.populate('cities');


			if (locals.data.city) {
				q.where('cities').in([locals.data.city]);
			}
			q.exec(function (err, results) {
				locals.data.exhibition = results;
				next(err);
			});


	});


//signin




	view.on('post', { action: 'signin' }, function (next) {
		res.cookie('lastUrl', req.path);
		res.redirect('/signin');
	});












	view.render('discovers/exhibition/exhibition');
	
};