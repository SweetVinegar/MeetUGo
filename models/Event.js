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
 * Event Model
 * ==========
 */

var Event = new keystone.List('Event', {
    map: { name: 'eventTitle' },
	autokey: { path: 'slug', from: '_id', unique: true },
    nocreate: false,
    noedit: false,
});

Event.add({
    eventTitle: { type: String, initial: true, default:'EventTitle',required: true },
    eventTime: { type: Types.Datetime, default: Date.now, require: true },
    freeEvent: { type: Types.Select, options: 'Free, Not Free', default: 'Not Free', index: true },
    ticketLink: {type: Types.Url, default: 'http://meetugo.com'},
    flyer:  { type: Types.File, storage: storage, virtuals:true },
    cities: { type: Types.Relationship, ref: 'EventCity', many: false, initial: true, required: true, default:'' },
    eventAdress: { type: String, required: true, default:'Event Adress' },
    eventEmail: { type: Types.Email, displayGravatar: true },
    eventIntroduction: { type: Types.Html, wysiwyg: true, height: 400 },
	state: { type: Types.Select, options: 'apply, archived, draft, hidden, published', default: 'apply', index: true },
    pv: { type: Number,initial: true,default:0},

//public, delete, unpublish

    author: { type: Types.Relationship, ref: 'User',many: false, index: true},
    isOrganiser: { type: Boolean, label: 'The author is event organiser', index: true },
    rsvpOnMeetUGo:{ type: Boolean, label: 'Can RSVP on MeetUGo', index: true },

    follower: { type: Types.Relationship, ref: 'User',many: true, index: true},
//    attendees: { type: Types.Relationship, ref: 'User',many: true, index: true}
    maxRSVPs: { type: Number, default: 100 },
    totalRSVPs: { type: Number, noedit: true },
    createdAt: { type: Date, noedit: true, collapse: true, default: Date.now },
    changedAt: { type: Date, noedit: true, collapse: true }
});


//Event.relationship({ ref: 'RSVP', refPath: 'event', many: false, path: 'rsvps' });


Event.schema.pre('save', function(next) {
    if (!this.isModified('changedAt')) {
        this.changedAt = Date.now();
    }
    next();
});

//?該加嗎？
Event.schema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

Event.defaultSort = 'state';
Event.defaultColumns = 'eventTitle|20%, eventTime|20%, state|20%, cities';

//Virtual

Event.schema.virtual('url').get(function () {
    return '/event/' + this._id;
});


Event.schema.virtual('remainingRSVPs').get(function() {
    if (!this.maxRSVPs) return -1;
    return Math.max(this.maxRSVPs - (this.totalRSVPs || 0), 0);
});

Event.schema.virtual('rsvpsAvailable').get(function() {
    return (this.remainingRSVPs > 0);
});

//Methods RSVP in Calendar model
Event.schema.methods.refreshRSVPs = function(callback) {
    var event = this;
    keystone.list('Calendar').model.count()
        .where('event').in([event.id])
        .where('attending', true)
        .exec(function(err, count) {
            if (err) return callback(err);
            event.totalRSVPs = count;
            event.save(callback);
        });
}

Event.schema.set('toJSON', {
    transform: function(doc, rtn, options) {
        return _.pick(doc, '_id', 'eventTitle', 'eventTime', 'freeEvent', 'ticketLink', 'flyer', 'cities', 'eventAdress', 'eventEmail', 'eventIntroduction', 'state', 'author', 'rsvpsAvailable', 'remainingRSVPs');
    }
});


Event.schema.pre('save', function(next) {
    _id = this._id;
    doc = {
        title: this.eventTitle,
        time: this.eventTime,
        location: this.eventAdress,
        description: this.eventIntroduction
        };
    keystone.list('Calendar').model.update(
        {event: _id}, doc,
        {multi: true}, 
        function(err, docs){
        if(err) console.log(err);
        next();
    });
    next();        
});


//Add the event into the calendar who post event
Event.schema.pre('save', function(next) {
    author = this.author;
    _id = this._id;
    eventTitle = this.eventTitle;
    eventTime = this.eventTime;
    eventAdress = this.eventAdress,
    eventIntroduction  = this.eventIntroduction
    var q = keystone.list('Calendar')
            .model
            .findOne({who:author, event:_id})
        q.exec(function (err, result) {
            if(!result){
                doc = {
                    event: _id,
                    who: author,
                    title: eventTitle,
                    time: eventTime,
                    location: eventAdress,
                    description: eventIntroduction,
                    class:'Event'
                    };
                keystone.list('Calendar').model.create(
                    doc,
                    function(err, docs){
                    if(err) console.log(err);
                    next();
                });
                next();
            }
        });    
    next();           
});


Event.schema.pre('remove', function(next) {
    _id = this._id;
    keystone.list('Calendar').model.remove( 
        {event: _id},
        function(err, docs){
        if(err) console.log(err);
        next();
    });
    next();        
});



Event.register();
