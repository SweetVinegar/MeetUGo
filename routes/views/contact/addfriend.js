var keystone = require('keystone'),

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
		locals.searchuserdata = {};
		locals.searchmail = {};
		locals.addname = {};
		locals.searchuser = false;
		locals.alreadysend = false;
		locals.userexist = false;
		locals.followed = false;
		locals.befollowed = false;
		locals.addrequest = false;

//To add a new friend --> search user
	view.on('post', { action: 'searchuser' }, function(next) {
		keystone.list('User').model.findOne({email:req.body.email})
		.exec(function (err, result) {
			if(err){
				console.log(err);
				next();
			}
			else{
				locals.searchuser = true;
				if(!result){
					locals.searchmail = req.body.email;
					console.log('no user exist');
					next();
				//sent invitation mail
				//or create an invitation page
				}
				else{
					locals.userexist = true;
					console.log('yes, user exist');
					locals.searchuserdata = result;
					//searchuser exist -> check if I already follow the user
						keystone.list('User').model.findOne({_id:req.user._id, friends:locals.searchuserdata._id})
						.exec(function(err, result1) {
							if(err){
								console.log(err)
							}
							else{
								//haven't follow her --> check if she follow me?
								if(!result1){
									console.log('user exist,havent followed');
									keystone.list('User').model.findOne({_id:locals.searchuserdata._id,friends:req.user._id})
									.exec(function(err, result2){
										if(err){console.log(err)}
										else{
											if (!result2){
												console.log('we both not followed yet');
												//haven't follow me --> show button to add her
											}
											else{
												locals.befollowed = true;
												console.log('She already add me');
												//she already add me --> show me who already add me
												//res.redirect('');
											}
										}
										next();
									})
								}
								//have follow her -->check if she follow me?
								else{
									locals.followed = true;
									keystone.list('User').model.findOne({_id:locals.searchuserdata._id,friends:req.user._id})
									.exec(function(err, result2){
										if(err){console.log(err)}
										else{
											//she didn't follow me --> Reply "Invitation have been send"
											if (!result2){
											}
											//she also follow me --> we are already friends
											else{

												locals.befollowed = true;
												//res.redirect(''); 
											}
										}
										next();
									})
								}				
							};

						});		
				}				
			};
		});
	
	});


	view.on('post', { action: 'friendrequest' }, function(next) {

		keystone.list('User').model.update({ _id : req.user._id}, 
			{'$push':{ friends : req.body.friends}}, function(err, data){
    			if(err) {
        		console.log(err+'not success');}
        		else
        			{
						keystone.list('User').model.findOne({_id:req.body.friends})
							.exec(function(err, result){
								if(err){console.log(err)}
								else{
									locals.searchuserdata = result;
									locals.searchuser = true;
									locals.userexist = true;
									locals.followed = true;
						    		console.log(data + 'success');
								}
    							next(err);
						})

        				//success
        				console.log('success add'+locals.searchuserdata._id);
        			}
    		});});


//add who already add me
	view.on('post', { action: 'add' }, function(next) {
		keystone.list('User').model.update({ _id : req.user._id}, 
			{'$push':{ friends : req.body._id}}, function(err, data){
    			if(err) {
        		console.log(err);}
        		else
        			{   
						locals.searchuser = true;
						locals.userexist = true;
						locals.befollowed = true;
        				locals.addrequest = true;
        				locals.addname = req.body.name;
        			}
    			next(err);
    	});	
	});

if(req.user.profilePic){var picadress = req.user.profilePic.filename}
	else{var picadress = 'nopic'}
var invitationmail = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"> <link href="http://libs.baidu.com/bootstrap/3.0.3/css/bootstrap.css" rel="stylesheet"> <link href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"> <style> a.list-group-item.active, a.list-group-item.active:hover, a.list-group-item.active:focus {background-color: orange!important; border-color: orange!important; } </style> </head> <body style="background:#FFFAF4"> <style type="text/css"> ul{padding: 0;} ol, ul {list-style: none;} .posts-container .post-container{padding:10px;border:2px solid #F8F8F8;margin-bottom:-2px;padding-bottom:10px;overflow:auto}.posts-container .post-container .right-content{float:left;width:100%;}.posts-container .post-container .right-content img{position:absolute;}.posts-container .post-container .right-content .info-post ul li{margin-top:5px;float:left;} .clear {clear: both;display: block;overflow: hidden;visibility: hidden;width: 0;height: 0;} </style> <div> <div style="width: 100%;height: 50px"></div> <div style="position: relative; margin-left: auto;margin-right: auto;max-width: 600px;"> <center> <div style="height:10px"></div><img src="http://res.meetugo.com/pics/user/'+ picadress +'" style="border:solid 5px lightgray;height:200px;width:200px;border-radius:100%; overflow:hidden"> </center> <center> <h3>'+req.user.name.first+' '+req.user.name.last +'</h3> <div align="center"> <h3> '+ req.user.name.first+' '+req.user.name.last +' invite you to be a friend on MeetUGo.Com</h3> <div class="posts-container" style="padding:0"> <div class="post-container" style="background: white"> <div class="right-content"> <div style="text-align:center"> <a href="http://meetugo.com/addme/'+ req.user._id  +'"> <button class="btn" style="background:orange;color:white">Check</button> </a> </div> </div> <div class="clear"></div> </div> </div> </div> </center> </div> </div> </body> </html>'







	view.on('post', { action: 'sentmail' }, function(next) {
        const nodemailer = require('nodemailer');
                // Generate test SMTP service account from ethereal.email
                // Only needed if you don't have a real mail account for testing
        nodemailer.createTestAccount((err, account) => {
                // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: process.env.SITE_EMAIL_ADDRESS, // generated ethereal user
                    pass: process.env.SITE_EMAIL_PASSWD // generated ethereal password
                }
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from:'MeetUGo <system@mail.meetugo.com>',
                to: req.body.invitemail, // list of receiver
                subject: req.user.name.first +' '+ req.user.name.last + ' Want To Add You As Friend On MeetUGo.Com', // Subject line
                text: 'Reset your Password', // plain text body
                html: invitationmail
                       // html body
                    };

                    // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                        if (err) {
                            console.error(err);
                            req.flash('error', 'Error sending invitation');
                            next();
                        } 
                        else {
                        	locals.searchuser = true;
							locals.alreadysend = true;
                            console.log('succes We have send invitation to' + req.body.invitemail);
                           // res.redirect('to page for invite people'); should with _id
                           res.redirect('/addme/'+ req.user._id);
                        }
            });
		});
    });








	view.render('contact/addfriend');
	
} 
