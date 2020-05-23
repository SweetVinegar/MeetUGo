var keystone = require('keystone');
var Types = keystone.Field.Types;
var storage = new keystone.Storage({
  adapter: require('keystone-storage-adapter-s3'),
  s3: {
    key: process.env.S3_Key, // required; defaults to process.env.S3_KEY
    secret: process.env.S3_Secret, // required; defaults to process.env.S3_SECRET
    bucket: process.env.S3_Bucket, // required; defaults to process.env.S3_BUCKET
    region: process.env.S3_Region, // optional; defaults to process.env.S3_REGION, or if that's not specified, us-east-1
    path: '/pics/user',
    headers: {
      'x-amz-acl': 'public-read', // add default headers; see below for details
    },
  },
  schema: {
    bucket: true, // optional; store the bucket the file was uploaded to in your db
    etag: true, // optional; store the etag for the resource
    path: true, // optional; store the path of the file in your db
    url: true, // optional; generate & store a public URL
  },
});

var User = new keystone.List('User', {
	// nodelete prevents people deleting the demo admin user
	nodelete: true,
});
/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	friends: { type: Types.Relationship, ref: 'User', many: true },
	userName : { type: String,index: true},
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, unique: true, index: true },
	contactEmail: { type: Types.Email, index: true },
	countryCode: { type: Types.Number, index: true },
	phone : { type: Types.Number, index: true },
	company : { type: Types.Text, index: true},
	position : { type: Types.Text, index: true},
	password: { type: Types.Password, initial: true, required: true },
	profilePic: { type: Types.File, storage: storage, virtuals:true },
	introduction:{ type: Types.Html, wysiwyg: true, height: 400 },
	resetPasswordKey: { type: String, hidden: true },
	createdAt: { type: Date, noedit: true, collapse: true, default: Date.now },
	changedAt: { type: Date, noedit: true, collapse: true },
	type: { type: Types.Select, options: 'person, community,official', default: 'person', index: true },

}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
	isProtected: { type: Boolean, noedit: true },
	isVerified: { type: Boolean, label: 'Has a verified email address' }

});


// Link to member
User.schema.virtual('url').get(function() {
	return '/user/' + this.key;
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


/**
 * Methods
 * =======
*/
/*
User.schema.methods.resetPassword = function(callback) {
	var user = this;
	user.resetPasswordKey = keystone.utils.randomString([16,24]);
	user.save(function(err) {
		if (err) return callback(err);
		new keystone.Email('forgotten-password').send({
			user: user,
			link: '/reset-password/' + user.resetPasswordKey,
			subject: 'Reset your SydJS Password',
			to: user.email,
			from: {
				name: 'SydJS',
				email: 'contact@sydjs.com'
			}
		}, callback);
	});
}

*/

/**
 * Relationships
 */

User.relationship({ ref: 'User', path: 'users', refPath: 'friends' });
User.relationship({ ref: 'Event', path: 'events', refPath: 'author' });

//User.relationship({ ref: 'Event', path: 'events', refPath: 'attendees' });

/**
 * DEMO USER PROTECTION
 * The following code prevents anyone updating the default admin user
 * and breaking access to the demo
 */

function protect (path) {
	User.schema.path(path).set(function (value) {
		return (this.isProtected && this.get(path)) ? this.get(path) : value;
	});
}

['name.first', 'name.last', 'email', 'isProtected'].forEach(protect);

User.schema.path('password').set(function (newValue) {
	// the setter for the password field is more complicated because it has to
	// emulate the setter on the password type, and ensure hashing before save
	// also, we can't currently escape the hash->set loop, so the hash is harcoded
	// for the demo user for now.
	if (this.isProtected) return '2a$10$XhENlIBfGPOldZmUGqnIXujNZTOe4HwCYj0Rdii49Kvufmbp6d2Ae';
	this.__password_needs_hashing = true;
	return newValue;
});

/**
 * END DEMO USER PROTECTION
 */

// Link to member
User.schema.virtual('url').get(function() {
	return '/user/' + this.key;
});



/**
 * Registration
 */
User.defaultColumns = 'name, email, createdAt, isAdmin';
User.register();
