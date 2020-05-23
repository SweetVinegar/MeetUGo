/*User Type!!!!! Restart

data.calendar
load mycalendar if mycalendar.event = calendarevent ==> 
who follow me => for type = community

*/








var keystone = require('keystone');
var async = require('async');
var Calendar = keystone.list('Calendar');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	//locals.section = 'events';
    locals.signin = false;
    locals.bothfriends = false;

 	locals.data = { 
		calendar: [],
		user: []
	};

	locals.filter = {
		user: req.params.user,
	};

	var sixhour = Date.now() - 21600000;


//load url user
	view.on('init', function (next) {


	var q = keystone.list('User')
	        .model
	        .findOne({_id:locals.filter.user})

		q.exec(function (err, result) {
			locals.data.user = result;
			next(err);
		});

	});

if(req.user)
{
//-----friends = who I followed also follow me-----------------
	view.on('init', function(next) {
		//load who I followed
			keystone.list('User').model.findOne({_id:req.user._id,friends:locals.filter.user})
			.exec(function(err, result) {
				//load who I followed also follow me	
				if(result){
					keystone.list('User').model.findOne({_id:locals.filter.user,friends:req.user._id})
					.exec(function(err, result1) {
						if(result1){
							locals.bothfriends = true;
						}
						else{
							locals.bothfriends = false;
						}
			 			next();
					});
				}
				else{
					locals.bothfriends = false;
					next();
				}
			});		
	});
}


	// Load the events
	view.on('init', function (next) {


	var q = keystone.list('Calendar')
	        .model
	        .find({time:{$gte:sixhour},who:locals.filter.user})
			.sort('time')
			.populate('event who');

		q.exec(function (err, results) {
			locals.data.calendar = results;
			next(err);
		});

	});







//signin


	view.on('post', { action: 'signin' }, function (next) {
		res.cookie('lastUrl', req.path);
		res.redirect('/signin');
	});


	view.render('calendar/mycalendar');
	
};
//