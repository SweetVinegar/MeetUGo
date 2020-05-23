var keystone = require('keystone'),

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
		locals.refriends = {};


//-----friends = who I followed also follow me-----------------
//load who I followed
	view.on('init', function(next) {
			keystone.list('User').model.findOne({_id:req.user._id})
			.exec(function(err, result) {
				res.follower = result;
				console.log('result: '+result.friends);
				console.log('re2 + '+res.follower.friends);
				next();
			});		
	});
//load who I followed also follow me	
	view.on('init', function(next) {
			keystone.list('User').model.find({_id:{$in:res.follower.friends},friends:req.user._id})
			.exec(function(err, results) {
				locals.refriends = results;
				console.log('3: '+locals.refriends);
				 next();
			});		
	});
//-------------------------------------------------------------


	
	view.render('test2');
	
} 
