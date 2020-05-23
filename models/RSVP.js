var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * RSVPs Model
 * ===========
 */

var RSVP = new keystone.List('RSVP', {
	autokey: { path: 'slug', from: 'event.eventTitle', unique: true },
  //  nocreate: false,
    //noedit: false,
});

RSVP.add({
    event: { type: Types.Relationship, ref: 'Event', required: true, many: false, initial: true, index: true, unique: true},
	who: { type: Types.Relationship, ref: 'User', required: true, initial: true, index: true },
	attending: { type: Types.Boolean, index: true, default: true},
	createdAt: { type: Date, noedit: true, collapse: true, default: Date.now },
	changedAt: { type: Date, noedit: true, collapse: true }
});


/**
 * Hooks
 * =====
 */

RSVP.schema.pre('save', function(next) {
	if (!this.isModified('changedAt')) {
		this.changedAt = Date.now();
	}
	next();
});

RSVP.schema.post('save', function() {
	keystone.list('Event').model.findById(this.event, function(err, event) {
		if (event) event.refreshRSVPs();
	});
});

RSVP.schema.post('remove', function() {
	keystone.list('Event').model.findById(this.event, function(err, event) {
		if (event) event.refreshRSVPs();
	});
})


/**
 * Registration
 * ============
 */

RSVP.defaultColumns = 'event|20%, who, createdAt';
RSVP.defaultSort = '-createdAt';
RSVP.register();
