var keystone = require('keystone'),



/*var Meetup = keystone.list('Meetup'),
	RSVP = keystone.list('RSVP');
*/
exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
		locals.userdata = {};

		locals.addfriend = false;
		locals.removefriend = false;
		locals.checkremove = false;
		locals.newfriend = {};
		locals.removewho = {};
		locals.removeid = {};
		locals.followme = {};



	view.on('init', function(next) {
			keystone.list('User').model.findOne({_id:req.user._id})
			.exec(function(err, result) {
				res.follower = result;
				next();
			});		
	});

//Check if people want to follow me
	view.on('init', function(next) {
			keystone.list('User').model.find({friends:req.user._id, _id:{ $nin: req.user.friends}})
			.exec(function(err, results) {
				locals.followme = results;
				next();
			});		
	});


//load who I followed also follow me	
	view.on('init', function(next) {
			keystone.list('User').model.find({_id:{$in:res.follower.friends},friends:req.user._id})
			.exec(function(err, results) {
				locals.userdata = results;
				 next();
			});		
	});
//-------------------------------------------------------------


	view.on('post', { action: 'deletefriend' }, function(next) {
       	locals.checkremove = true;
       	locals.removewho = req.body.name;
       	locals.removeid = req.body._id;
       	next();
	});

	view.on('post', { action: 'deletecheck' }, function(next) {
		keystone.list('User').model.update({ _id : req.user._id}, 
			{'$pull':{ friends :req.body._id}}, function(err, data){
    		if(err) {
       			console.log(err);
       		}
       		else{
       			locals.removefriend = true;
       			locals.removewho = req.body.name;
    		}
    			next(err);
    	});
	});




	
	view.render('contact/contact');
	
} 
