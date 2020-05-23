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
    path: '/test',
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

var P = new keystone.List('P');

P.add({
    picture:  { type: Types.File, storage: storage, virtuals:true },
    //test: { type: String, required: true, default:'Test' },
});



P.register();
