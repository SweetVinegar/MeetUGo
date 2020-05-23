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
	locals.applylink = false;
	locals.showlink = false;	


	locals.filters = {
		eventinfo: req.params.eventinfo,
	};
	locals.data = {
		eventinfo: [],
		attendees:[],
	};




	// Load the current post
	view.on('init', function (next) {

		var q = keystone.list('Event').model.findOne({
			//state: 'published',
			_id: locals.filters.eventinfo,
		}).populate('cities');

		q.exec(function (err, result) {
			locals.data.eventinfo = result;
			next(err);
		});

	});



//Add PV

	view.on('init', function (next) {

		keystone.list('Event').model.update({ _id : locals.filters.eventinfo}, 
			{pv:locals.data.eventinfo.pv+1}, 
			function(err){
							next(err)
				    	});

	});

//signin


	view.on('post', { action: 'signin' }, function (next) {
		res.cookie('lastUrl', req.path);
		res.redirect('/signin');
	});


//Check RSVP


	view.on('init', function(next) {
		if (!req.user) return next();
			Calendar.model.findOne()
			.where('who', req.user._id)
			.where('event', locals.data.eventinfo._id)
			.exec(function(err, result) {
				locals.rsvpStatus = {
					iRsvped: result ? true : false,
				//	iAttending: result && result.attending ? true : false
				}
				return next();
			});		
	});


//load all people RSVP



	view.on('init', function(next) {
			
			Calendar.model.find()
			.where('event', locals.data.eventinfo._id)
			.populate('who')
			.exec(function(err, results) {
				locals.data.attendees = results;
				 next();
			});		
	});


	view.on('post', { action: 'rsvp' }, function (next) {


			keystone.list('Calendar')
	        .model
	        .findOne({event:locals.filters.eventinfo, who:req.user._id})
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
					res.redirect('back')
					}
				});
			}
		});


	});

	view.on('get', { remove: 'delete' }, function (next) {

		if (!req.user) {
			req.flash('error', 'You must be signed in to delete a rsvp.');
			return next();
		}

		Calendar.model.findOne()
			.where('who', req.user._id)
			.where('event', locals.data.eventinfo._id)
			.remove(function(err){
				if (err) {
				locals.validationErrors = err.errors;
				} else {
					locals.applySubmitted = true;
					res.redirect('back')
				}
				next();
			}); 			
	});


	view.on('get', { action: 'showmap' }, function (next) {
		locals.showmap = true;
        next(); 
	});


	view.on('get', { action: 'applylink' }, function (next) {
		locals.applylink = true;
        next(); 
	});

	view.on('get', { action: 'showlink' }, function (next) {
		locals.applylink = true;
		locals.showlink = true;
        next(); 
	});



	view.on('post', { action: 'showlink' }, function(next) {
		req.user.getUpdateHandler(req).process(req.body, {
			fields: 'name,countryCode,phone,contactEmail,company,position',
			flashErrors: true
		}, function(err) {
		
			if (err) {
				return next();
			}

			else{

				if(locals.data.eventinfo.follower.indexOf(req.user._id)!=(-1))
				{
						        locals.applylink = true;
								locals.showlink = true;
								next();
				}
				else
				{
					keystone.list('Event').model.update({ _id : locals.data.eventinfo._id}, 
						{'$push':{ follower : req.user._id}}, function(err2, data){
							if(err2) {
				    				return next();}
				    		else
				    			{
						        locals.applylink = true;
								locals.showlink = true;
								next();

				    			}
				    	});

				}
				}	
		});




    			
    	


	
	});

	// Render the view
	view.render('discovers/event/eventinfo');
};
