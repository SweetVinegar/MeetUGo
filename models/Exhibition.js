var keystone = require('keystone');
var Types = keystone.Field.Types;
//AWS S3
var storage = new keystone.Storage({
  adapter: require('keystone-storage-adapter-s3'),
  s3: {
    key: process.env.S3_Key, // required; defaults to process.env.S3_KEY
    secret: process.env.S3_Secret, // required; defaults to process.env.S3_SECRET
    bucket: process.env.S3_Bucket, // required; defaults to process.env.S3_BUCKET
    region: process.env.S3_Region, // optional; defaults to process.env.S3_REGION, or if that's not specified, us-east-1
    path: process.env.S3_Path,
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



/**
 * Exhibition Model
 * ==========
 */

var Exhibition = new keystone.List('Exhibition', {
    map: { name: 'title' },
	autokey: { path: 'slug', from: '_id', unique: true },
    nocreate: false,
    noedit: false,
});

Exhibition.add({
    title: { type: String, initial: true, default:'title',required: true },
    open: { type: Types.Datetime},
    start: { type: Types.Datetime, default: Date.now, require: true },
    end: { type: Types.Datetime, default: Date.now, require: true },
    link: {type: Types.Url, default: 'http://meetugo.com'},
    flyer:  { type: Types.File, storage: storage, virtuals:true },
    cities: { type: Types.Relationship, ref: 'EventCity', many: false, initial: true, required: true, default:'' },
    adress: { type: String, required: true, default:'adress' },
    email: { type: Types.Email, displayGravatar: true },
    introduction: { type: Types.Html, wysiwyg: true, height: 400 },
	state: { type: Types.Select, options: 'apply, archived, draft, published', default: 'apply', index: true },
    pv: { type: Number,default:0},

//public, delete, unpublish

    author: { type: Types.Relationship, ref: 'User',many: false, index: true},
    isOrganiser: { type: Boolean, label: 'The author is organiser', index: true },
    rsvpOnMeetUGo:{ type: Boolean, label: 'Can RSVP on MeetUGo', index: true },

    follower: { type: Types.Relationship, ref: 'User',many: true, index: true},
//    attendees: { type: Types.Relationship, ref: 'User',many: true, index: true}


    createdAt: { type: Date, noedit: true, collapse: true, default: Date.now },
    changedAt: { type: Date, noedit: true, collapse: true }
});


//Event.relationship({ ref: 'RSVP', refPath: 'event', many: false, path: 'rsvps' });


Exhibition.schema.pre('save', function(next) {
    if (!this.isModified('changedAt')) {
        this.changedAt = Date.now();
    }
    next();
});



Exhibition.defaultSort = 'state';
Exhibition.defaultColumns = 'title|20%, open|20%,end|20%, state|20%, cities';

//Virtual







Exhibition.register();
