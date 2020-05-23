var keystone = require('keystone');

exports = module.exports = function(req, res) {
	
	if (req.user) {
		return res.redirect('/setting');
	}
	
	var view = new keystone.View(req, res),
		locals = res.locals;
		//locals.back = false;
	
 	
	view.on('post', function(next) {
		
		if (!req.body.email || !req.body.password) {
			req.flash('error', 'Please enter your email and password.');
			return next();
		}
		
		var onSuccess = function() {

			//locals.back = true;
		//	res.redirect('/setting');
		
			res.redirect(req.cookies.lastUrl)
		}
		
		var onFail = function() {
			req.flash('error', 'Input credentials were incorrect, please try again.');
			return next();
		}
		
		keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);
		
	});
	
	view.render('session/signin');
	
}
