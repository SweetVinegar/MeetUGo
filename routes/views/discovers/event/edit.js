var keystone = require('keystone');
	_ = require('lodash'),
	moment = require('moment');
var async = require('async');
var Event = keystone.list('Event');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.filters = {
		edit: req.params.edit,
	};
	locals.data = {
		edits: [],
	};

locals.datacit = {
		cities: [],
	};


	locals.freeEvents = Event.fields.freeEvent.ops;
	//locals.formData = req.body || {};

	locals.validationErrors = {};
	locals.applySubmitted = false;
	locals.toremove == false;


	var me = req.user;


	 	// Load all cities

	view.on('init', function (next) {

		keystone.list('EventCity').model.find().sort('name').exec(function (err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.datacit.cities = results;

			// Load the counts for each city
			async.each(locals.datacit.cities, function (city, next) {

				keystone.list('Event').model.count().where('cities').in([city.id]).exec(function (err, count) {
					city.postCount = count;
					next(err);
				});

			}, function (err) {
				next(err);
			});
		});
	});




	// Load the current post

	view.on('init', function (next) {

		keystone.list('Event').model.findOne({
		//	state: 'published',
			_id: locals.filters.edit,
			author: req.user,
		}).populate('author').exec(function (err, result) {
			locals.data.edit = result;
			next(err);
			});
	  });



	view.on('post', { action: 'apply' }, function(next) {
        Event.model.findOne({
			_id: locals.filters.edit,
		}).exec(function(err, result) {
			if (err) return next(err);
			//result = req.body || {};
			result.eventTitle = req.body.eventTitle;
            result.eventTime = req.body.eventTime;
            result.freeEvent = req.body.freeEvent;
            result.cities = req.body.cities;
            result.ticketLink = req.body.ticketLink;
            result.eventAdress = req.body.eventAdress;
            result.eventEmail = req.body.eventEmail;
            result.eventIntroduction = req.body.eventIntroduction;
            result.state = req.body.state;
         
            result.save(function(err) {
 				if (err) {
					//locals.validationErrors = err.errors;
					console.log(err);
				} else {
					res.redirect('/myevent');
					
					//req.flash('success', 'Your event has been updated.');
				}
				next();
            });
		});   
	});

//to delete page
	view.on('get', { action: 'toremove' }, function (next) {
		locals.edit = true;
       locals.toremove = true;

        next();
	});

//delete: remove the event from the calendar than remove the event
	view.on('post', { remove: 'delete' }, function (next) {

			if (!req.user) {
			req.flash('error', 'You must be signed in to delete a calendar.');
			return next();
			}

			var q = Event.model.findOne({
				author:req.user,
				_id: locals.filters.edit,
			});

			q.exec(function (err, result) {
			    keystone.list('Calendar').model.remove( 
        			{event: result._id},
        			function(err, docs){
        			if(err) console.log(err);

    				q.remove(
   						function(err, docs){
        				if(err) console.log(err);
							}
    					);
    			});
			});
		res.redirect('/myevent');
		next(); 			
	});


	// Render the view
	view.render('discovers/event/edit');
};
