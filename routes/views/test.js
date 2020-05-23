var keystone = require('keystone');
var async = require('async');
var request = require('request');


exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	





	





	view.render('test');
	
};
//