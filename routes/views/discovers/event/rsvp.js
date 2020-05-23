var keystone = require('keystone');
var Event = keystone.list('Event');
var RSVP = keystone.list('RSVP');


exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'apply';
	//locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.applySubmitted = false;

	
	locals.rsvp = {};
	locals.rsvpStatus = {};
	locals.user = req.user;
	locals.filters = {
		event: req.params.event,
	};
	locals.data = {
		events: [],
		rsvps:[],
	};



	view.on('init', function (next) {

		var q = keystone.list('Event').model.findOne({
			state: 'published',
			_id: locals.filters.event,
		}).populate('');

		q.exec(function (err, result) {
			locals.data.event = result;
			next(err);
		});

	});

	// Load an RSVP
	
	view.on('init', function(next) {
		if (!req.user) return next();
			RSVP.model.findOne()
			.where('who', req.user._id)
			.where('event', locals.data.event._id)
			.exec(function(err, result) {
				locals.rsvpStatus = {
					iRsvped: result ? true : false,
					iAttending: result && result.attending ? true : false
				}
				return next();
			});		
	});
	// On POST requests, add the Apply item to the database


  //if(locals.rsvpStatus.iRsvped && !locals.rsvpStatus.iAttending){
	view.on('post', { action: 'attend' }, function (next) {

    	

    	
     	if (!req.user || !locals.data.event) return next();
		
		RSVP.model.findOne()
			.where('who', req.user._id)
			.where('event', locals.data.event._id)
			.exec(function(err, result) {
				if (err) return next(err);

                 

            //     result.event     =  locals.data.event._id;           
                 result.attending = true;
          //       result.who = req.user._id;

	
				
                 result.save(function(err) {
 				if (err) {
 					next(err);
					//locals.validationErrors = err.errors;
				} else {
					res.redirect('/rsvp');
					//locals.applySubmitted = true;
					
				}
				next();
            	});
            });
		

		});

  // }


//else{

view.on('post', { action: 'rsvp' }, function (next) {



    		var newRSVP = new RSVP.model();
			var updater = newRSVP.getUpdateHandler(req);

			updater.process(req.body, {
				flashErrors: true,
				fields: 'event, who',
				errorMessage: 'There was a problem submitting your enquiry:',
			}, function (err) {
				if (err) {
				locals.validationErrors = err.errors;
				} else {
					locals.applySubmitted = true;
				}
				next();
			});

			

	});

//}






	view.on('post', { remove: 'delete' }, function (next) {

        RSVP.model.findOne()


		if (!req.user) {
			req.flash('error', 'You must be signed in to delete a comment.');
			return next();
		}

		RSVP.model.findOne()
			.where('who', req.user._id)
			.where('event', locals.data.event._id)
			.remove(function(err){
				if (err) {
				locals.validationErrors = err.errors;
				} else {
					locals.applySubmitted = true;
				}
				next();
			}); 





			
	});















	view.render('discovers/event/rsvp');
};

/*
if(locals.rsvpStatus){
	view.on('post', { action: 'attend' }, function(next) {
		if (!req.user || !locals.data.event) return next();
		
		RSVP.model.findOne()
			.where('who', req.user._id)
			.where('event', locals.data.event._id)
			.exec(function(err, result) {
				if (err) return next(err);

                 

            //     result.event     =  locals.data.event._id;           
                 result.attending = true;
          //       result.who = req.user._id;

	
				
                 result.save(function(err) {
 				if (err) {
 					next(err);
					//locals.validationErrors = err.errors;
				} else {
					res.redirect('/rsvp');
					//locals.applySubmitted = true;
					
				}
				next();
            });

			});			
	});
}

else{
	// Create a rsvp
	view.on('post', { action: 'attend' }, function (next) {

		var newRSVP = new RSVP.model();
		var updater = newRSVP.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'event, who',
			errorMessage: 'There was a problem submitting your enquiry:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.applySubmitted = true;
			}
			next();
		});
	});

*/
//	view.render('rsvp');
//};



























/*

var keystone = require('keystone'),
	moment = require('moment')

var Meetup = keystone.list('Event'),
	RSVP = keystone.list('RSVP');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'home';
	locals.rsvp = {};
	//locals.page.title = 'RSVP For This Event';
	
	locals.rsvpStatus = {};

	locals.user = req.user;
	
	locals.filters = {
		event: req.params.event,
	};
	locals.data = {
		events: [],
		rsvps:[],
	};
	locals.applySubmitted = false;

	view.on('init', function (next) {

		var q = keystone.list('Event').model.findOne({
			state: 'published',
			_id: locals.filters.event,
		}).populate('');

		q.exec(function (err, result) {
			locals.data.event = result;
			next(err);
		});

	});

*/
	// Load the first, PAST meetup
	/*
	view.on('init', function(next) {
		Meetup.model.findOne()
			.where('state', 'past')
			.sort('-startDate')
			.exec(function(err, pastMeetup) {
				locals.pastMeetup = pastMeetup;
				next();
			});
			
	});
	*/
	

/*
    // Load all rsvps

	view.on('init', function(next) {		
		RSVP.model.find()
			//.where('who', req.user._id)
			.where('event', locals.data.event._id)
			.exec(function(err, result) {
                locals.data.rsvp = result;
				return next();
			});			
	});


	// Load local user RSVP

*/

/*

if(locals.rsvpStatus){
	view.on('post', { action: 'attend' }, function(next) {
		if (!req.user || !locals.data.event) return next();
		
		RSVP.model.findOne()
			.where('who', req.user._id)
			.where('event', locals.data.event._id)
			.exec(function(err, result) {
				if (err) return next(err);

                 

            //     result.event     =  locals.data.event._id;           
                 result.attending = true;
          //       result.who = req.user._id;

	
				
                 result.save(function(err) {
 				if (err) {
 					next(err);
					//locals.validationErrors = err.errors;
				} else {
					res.redirect('/rsvp');
					//locals.applySubmitted = true;
					
				}
				next();
            });

			});			
	});
}
*/
/*else{
	// Create a rsvp
	view.on('post', { action: 'attend' }, function (next) {

		var newRSVP = new RSVP.model();

		var updater = newRSVP.getUpdateHandler(req);

		updater.process(req.body, {
			fields: 'event, who, attending',
			//flashErrors: true,
			errorMessage: 'There was a problem submitting your enquiry:',
		}, function (err) {
			if (err) {
				validationErrors = err.errors;
			} else {
				//req.flash('success', 'Your comment was added.');
				locals.applySubmitted = true;
			}
			next();
		});

	});

}
*/
/*
	// Delete a Comment
	view.on('get', { remove: 'comment' }, function (next) {

		if (!req.user) {
			req.flash('error', 'You must be signed in to delete a comment.');
			return next();
		}

		PostComment.model.findOne({
				_id: req.query.comment,
				post: locals.post.id,
			})
			.exec(function (err, comment) {
				if (err) {
					if (err.name === 'CastError') {
						req.flash('error', 'The comment ' + req.query.comment + ' could not be found.');
						return next();
					}
					return res.err(err);
				}
				if (!comment) {
					req.flash('error', 'The comment ' + req.query.comment + ' could not be found.');
					return next();
				}
				if (comment.author != req.user.id) {
					req.flash('error', 'Sorry, you must be the author of a comment to delete it.');
					return next();
				}
				comment.commentState = 'archived';
				comment.save(function (err) {
					if (err) return res.err(err);
					req.flash('success', 'Your comment has been deleted.');
					return res.redirect('/blog/post/' + locals.post.key);
				});
			});
	});

*/





/*

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
         
            result.save(function(err) {
 				if (err) {
					locals.validationErrors = err.errors;
				} else {
					res.redirect('/myevent');
					locals.applySubmitted = true;
					//req.flash('success', 'Your event has been updated.');
				}
				next();
            });
		});   
	});

*/

	
/*
	view.render('rsvp');
	
}
*/
