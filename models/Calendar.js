var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Calendars Model
 * ===========
 */

var Calendar = new keystone.List('Calendar', {
	autokey: { path: 'slug', from: 'who', unique: true },
  //  nocreate: false,
    //noedit: false,
});

Calendar.add({
    who: { type: Types.Relationship, ref: 'User', required: true, initial: true, index: true },
	title: { type: String, required: true, initial: true},
	time: { type: Types.Datetime, default: Date.now, require: true },
	location: {type: String, required: false},
	description: { type: Types.Html, wysiwyg: true, height: 400 },
	class: { type: Types.Select, options: 'Public Schedule,Event,Private Schedule,Exhibition', default: 'Public Schedule', index: true },
	event: { type: Types.Relationship, ref: 'Event', index: true, many: false, dependsOn:{ class: 'Event' }},
	exhibition: { type: Types.Relationship, ref: 'Exhibition', index: true, many: false, dependsOn:{ class: 'Exhibition' }},
	attending: { type: Types.Boolean, index: true, default: true, dependsOn:{ class: 'Event' }},
	createdAt: { type: Date, noedit: true, collapse: true, default: Date.now },
	changedAt: { type: Date, noedit: true, collapse: true }
});



/**
 * Hooks
 * =====
 */


Calendar.schema.pre('save', function(next) {
	if (!this.isModified('changedAt')) {
		this.changedAt = Date.now();
	}
	next();
});



Calendar.schema.post('save', function() {
	keystone.list('Event').model.findById(this.event, function(err, event) {
		if (event) event.refreshRSVPs();
	});
});

Calendar.schema.post('remove', function() {
	keystone.list('Event').model.findById(this.event, function(err, event) {
		if (event) event.refreshRSVPs();
	});
})


/**
 * Registration
 * ============
 */

Calendar.defaultColumns = 'title|20%, who, createdAt';
Calendar.defaultSort = '-createdAt';
Calendar.register();
