/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};

// Setup Route Bindings
exports = module.exports = function (app) {
	// Views

   	app.all('/picture', routes.views.picture);


	app.all('/', routes.views.calendar.calendar);
	app.get('/blog/:category?', routes.views.blog);
	app.get('/blog/post/:post', routes.views.post);
	app.get('/discover/:category?', routes.views.discovers.discover.discover);
	app.get('/discover/discovery/:discovery', routes.views.discovers.discover.discovery);
	//app.all('/contact', routes.views.contact);

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

	// Session
	app.all('/join', routes.views.session.join);
	app.all('/signin', routes.views.session.signin);
	app.get('/signout', routes.views.session.signout);
	app.all('/forgot-password', routes.views.session['forgot-password']);
    app.post('/reset-password', keystone.security.csrf.middleware.validate, routes.views.session['reset-password']);
	app.get('/reset-password/:key', keystone.security.csrf.middleware.init, routes.views.session['reset-password']);
    

	//Discovers
	app.get('/discovers', routes.views.discovers.discovers);

	//Event
	app.all('/event/:city?', routes.views.discovers.event.event);
    app.get('/pastevent', routes.views.discovers.event.pastevent);
    app.get('/unevent', routes.views.discovers.event.unevent);
	app.all('/event/eventinfo/:eventinfo', routes.views.discovers.event.eventinfo);
    //My Event
    app.all('/myevent*', middleware.requireUser);
	app.all('/myevent', routes.views.discovers.event.myevent);
	//app.get('/event*/edit/:edit', middleware.requireUser);

	app.all('/event/edit/:edit*', middleware.requireUser);
	app.all('/event/edit/:edit', routes.views.discovers.event.edit);
	app.all('/event/manage/:manage*', middleware.requireUser);
	app.all('/event/manage/:manage', routes.views.discovers.event.manage);
    app.all('/rsvp/:event', routes.views.discovers.event.rsvp);
    app.all('/apply*', middleware.requireUser);
    app.all('/apply', routes.views.discovers.event.create);
    app.all('/create/event*', middleware.requireUser);
    app.all('/create/event', routes.views.discovers.event.create);


	//Exhibition
	app.all('/exhibition/:city?', routes.views.discovers.exhibition.exhibition);
	app.all('/exhibition/exhinfo/:exhinfo', routes.views.discovers.exhibition.exhinfo);

    //setting
	app.get('/setting', routes.views.setting.setting);
	app.all('/public/calendar/:who', routes.views.setting.public.calendar);


 	// User
	app.all('/me*', middleware.requireUser);
	app.all('/me', routes.views.setting.me);   

	// Authentication
	app.all('/auth/confirm', routes.views.auth.confirm);
	app.all('/auth/app', routes.views.auth.app);
	app.all('/auth/:service', routes.views.auth.service);

    // Calendar
    //app.all('/calendar*', middleware.requireUser);
	app.all('/calendar', routes.views.calendar.calendar);
	//app.all('/calendar/:detail*', middleware.requireUser);
	app.all('/calendar/:detail', routes.views.calendar.detail);
	app.all('/create/calendar*', middleware.requireUser);
	app.all('/create/calendar', routes.views.calendar.create);
  	app.all('/calendar/eventinfo/:eventinfo', routes.views.discovers.event.eventinfo);
 	app.all('/mycalendar/:user', routes.views.calendar.mycalendar);
 	app.all('/mycalendar/:user/detail/:detail', routes.views.calendar.detail);
 	app.all('/mycalendar/:user/eventinfo/:eventinfo', routes.views.discovers.event.eventinfo);


	//contact
	app.all('/contact*', middleware.requireUser);
	app.all('/contact', routes.views.contact.contact);
	app.all('/contact/addfriend*', middleware.requireUser);
	app.all('/contact/addfriend', routes.views.contact.addfriend);
	app.all('/contact/checkfriend*', middleware.requireUser);
	app.all('/contact/checkfriend', routes.views.contact.checkfriend);
	app.all('/addme/:me', routes.views.contact.addme);


	app.all('/test', middleware.requireUser);
	app.all('/test', routes.views.test);

	app.all('/test2', middleware.requireUser);
	app.all('/test2', routes.views.test2);
	app.all('/test3/:a/:b', routes.views.test3);

};
