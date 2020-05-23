var keystone = require('keystone'),



/*var Meetup = keystone.list('Meetup'),
	RSVP = keystone.list('RSVP');
*/
exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
		locals.followme = {};
		locals.checkid = {};
		locals.checkname = {};
        locals.action = false;
        locals.ifadd = false;
        locals.confirmed = false;



	view.on('init', function(next) {
			keystone.list('User').model.find({friends:req.user._id, _id:{ $nin: req.user.friends}})
			.exec(function(err, results) {
				locals.followme = results;
				next();
			});		
	});



	view.on('post', { action: 'add' }, function(next) {
		keystone.list('User').model.update({ _id : req.user._id}, 
			{'$push':{ friends : req.body._id}}, function(err, data){
    			if(err) {
        		console.log(err);}
        		else
        			{
        			locals.checkid = req.body._id;
        			locals.checkname = req.body.name;
        			locals.action = true;
        			locals.ifadd = true;
        			console.log('success');
        			}
    			next(err);
    	});	
	});

	view.on('post', { action: 'removerequest' }, function(next) {
		locals.action = true;
       	locals.ifadd = false;
		locals.checkid = req.body._id;
		locals.checkname = req.body.name;
		next();		
	});

	view.on('post', { action: 'remove' }, function(next) {
		keystone.list('User').model.update({ _id : req.body._id}, 
		{'$pull':{ friends :req.user._id}}, function(err, data){
    			if(err) {
       			console.log(err);}
       			else{
       			locals.checkid = req.body._id;
       			locals.checkname = req.body.name;
       			locals.action = true;
       			locals.ifadd = false;
				locals.confirmed = true;
       			console.log('remove');
       			}
    			next(err);
    	});
	});

	
	view.render('contact/checkfriend');
	
} 
