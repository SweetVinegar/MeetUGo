var keystone = require('keystone');
var Calendar = keystone.list('Calendar');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
//	locals.section = 'event';
	locals.filters = {
		detail: req.params.detail,
	};
	locals.data = {
		details: [],
	};
	locals.edit = false;
	locals.toremove = false;

	locals.validationErrors={};
	
	locals.allow = false;
	


	// Load the current calendar
	view.on('init', function (next) {

		var q = keystone.list('Calendar').model.findOne({
			//state: 'published',
			//who:req.user,
			slug: locals.filters.detail,
		})
		.populate('event who');

		q.exec(function (err, result) {
			locals.data.detail = result;
			res.public = true;
			//check if the schedule public, and if is local friend
			if(result.class == 'Public Schedule')
			{
				//load who I followed
				keystone.list('User').model.findOne({_id:req.user._id,friends:result.who._id})
				.exec(function(err, result1) {
				//load who I followed also follow me				
				keystone.list('User').model.findOne({_id:locals.data.detail.who._id,friends:req.user._id})
				.exec(function(err, result2) {
					if(result1 && result2)
					locals.allow = true;
					next(err);
					});		
				});					
			}
			else{
			next(err);}
		});

	});



if(res.public)
 {
//-----friends = who I followed also follow me-----------------
	view.on('init', function(next) {
		//load who I followed
			keystone.list('User').model.findOne({_id:req.user._id})
			.exec(function(err, result) {
		//load who I followed also follow me				
				keystone.list('User').model.findOne({_id:locals.data.detail.who._id,friends:req.user._id})
				.exec(function(err, result1) {
					if(result1)
					locals.bothfriends = true;
				 	next();
				});		
			});		
	});
 }



	view.on('get', { action: 'toedit' }, function (next) {
       locals.edit = true;
       next();
	});



	view.on('get', { action: 'toremove' }, function (next) {
		locals.edit = true;
       locals.toremove = true;

        next();
	});
		
		view.on('get', { action: 'notremove' }, function (next) {

        next();
	});


	view.on('post', { action: 'update' }, function(next) {
        Calendar.model.findOne({
			slug: locals.filters.detail,
		}).exec(function(err, result) {
			if (err) return next(err);

			result.title = req.body.title;
            result.time = req.body.time;
            result.location = req.body.location;
            result.description = req.body.description;
            result.class = req.body.class;
         
            result.save(function(err) {
 				if (err) {
					locals.validationErrors = err.errors;
				} else {
					res.redirect('/calendar/'+locals.filters.detail);
					//locals.applySubmitted = true;
					//req.flash('success', 'Your event has been updated.');
				}
				next();
            });
		});   
	});

//Delete the calendar

		view.on('post', { remove: 'delete' }, function (next) {

		if (!req.user) {
			req.flash('error', 'You must be signed in to delete a calendar.');
			return next();
		}

		Calendar.model.findOne({
			who:req.user,
			slug: locals.filters.detail,
		})
		.remove(function(err){
			if (err) {
			locals.validationErrors = err.errors;
			} 
			else {
			//	locals.applySubmitted = true;
				res.redirect('/calendar');	

			}
				next();
		}); 			
	});

	// Render the view
	view.render('calendar/detail');
};
