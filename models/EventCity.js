var keystone = require('keystone');

/**
 * EventCity Model
 * ==================
 */

var EventCity = new keystone.List('EventCity', {
	autokey: { from: 'name', path: 'key', unique: true },
});

EventCity.add({
	name: { type: String, required: true, default:'Choose a city' },
});

EventCity.relationship({ ref: 'Event', path: 'events', refPath: 'cities' });

EventCity.register();
