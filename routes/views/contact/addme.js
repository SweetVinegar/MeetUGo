var keystone = require('keystone'),

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
		
		locals.filter = {
			me: req.params.me,
		};
		locals.myinfo = {};
		locals.mefollowuser = false;
		locals.userfollowme = false;



	view.on('init', function (next) {

		keystone.list('User').model.findOne({
			_id: locals.filter.me,
		})
		.exec(function (err, result) {
			locals.myinfo = result;
			

			if(req.user){
				keystone.list('User').model.findOne({_id:req.user._id,friends:locals.filter.me})
					.exec(function(err, result1) {
							if(err){
								console.log(err)
								next(err);
							}
							else{
								//user haven't follow me --> check if me follow user?
								if(!result1){
									console.log('user exist,havent followed');
									keystone.list('User').model.findOne({_id:locals.filter.me, friends:req.user._id})
									.exec(function(err, result2){
										if(err){console.log(err)}
										else{
											if (!result2){
												console.log('we both not followed yet');
												//haven't follow me --> show button to add her
											}
											else{
												locals.mefollowuser = true;
												console.log('She already add me');
												//user haven't follow me, me already follow user
											}
										}
										next();
									})
								}
								//user already follow me -->check if me follow user?
								else{
									keystone.list('User').model.findOne({_id:locals.filter.me, friends:req.user._id})
									.exec(function(err, result2){
										if(err){console.log(err)}
										else{
												locals.userfollowme = true;
											//she didn't follow me --> Reply "Invitation have been send"
											if (!result2){
											}
											//she also follow me --> we are already friends
											else{
												locals.userfollowme = true;
												locals.mefollowuser = true;
												//res.redirect(''); 
											}
										}
										next();
									})
								}				
							};
					});
			}
			else{next();}

		});
	});




	if(req.user){
		view.on('post', { action: 'followme' }, function(next) {


		if((locals.myinfo.type == "official")||(locals.myinfo.type == "community"))
			{

				
				keystone.list('User').model.update({ _id : req.user._id}, 
					{'$push':{ friends :locals.filter.me}}, function(err, data){
	    				if(err) {
		        		console.log(err);
						next(err);
	        		}
	        			else
	        				{   

								keystone.list('User').model.update({ _id : locals.filter.me}, 
									{'$push':{ friends :req.user._id}}, function(err2, data2){
					    				if(err2) {
						        		console.log(err2);
										next(err2);
					        		}
					        			else
					        				{   
					        					res.redirect('/mycalendar/'+locals.filter.me);
					        				}
					    		})

	        				}
	    		})

			}

		else
			{
				keystone.list('User').model.update({ _id : req.user._id}, 
					{'$push':{ friends :locals.filter.me}}, function(err, data){
	    				if(err) {
		        		console.log(err);
						next(err);
	        		}
	        			else
	        				{   
	        					res.redirect('/addme/'+locals.filter.me);
	        				}
	    		})
			}
		});	
	}


//signin

//if(req.user.type == "official")


	view.on('post', { action: 'signin' }, function (next) {
		res.cookie('lastUrl', req.path);
		res.redirect('/signin');
	});



	view.render('contact/addme');
	
} 
