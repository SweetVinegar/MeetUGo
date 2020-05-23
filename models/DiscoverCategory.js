var keystone = require('keystone');

/**
 * EventCity Model
 * ==================
 */

var DiscoverCategory = new keystone.List('DiscoverCategory', {
	autokey: { from: 'name', path: 'key', unique: true },
});

DiscoverCategory.add({
	name: { type: String, required: true, default:'Category' },
});

DiscoverCategory.relationship({ ref: 'Discover', path: 'discovers', refPath: 'categories' });

DiscoverCategory.register();
