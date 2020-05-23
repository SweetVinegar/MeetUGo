var keystone = require('keystone');
var P = keystone.list('P');
var async = require('async');




exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals

	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.applySubmitted = false;




	// On POST requests, add the Apply item to the database
	view.on('post', { action: 'picture' }, function (next) {

		var newP = new P.model();
		var updater = newP.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'picture',
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

	view.render('pic');
};
