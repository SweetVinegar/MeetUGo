var keystone = require('keystone');
var Types = keystone.Field.Types;



/**
 * Token Model
 * ==========
 */

var Token = new keystone.List('Token', {
    map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true },
});

Token.add({
 	payer: { type: Types.Relationship, ref: 'User', many: false },
 	paid: { type: Number, noedit: false },
	payNote: { type: Types.Html, wysiwyg: true, height: 400 },
 	payee:{ type: Types.Relationship, ref: 'User', many: false },
 	received: { type: Number, noedit: true },
 	recieveNote:{ type: Types.Html, wysiwyg: true, height: 400 },
    timeStamp:{ type: Date, noedit: true, collapse: true, default: Date.now },
});

Token.defaultSort = '-timeStamp';
Token.defaultColumns = 'payer|20%, payee|20%, timeStamp|20%';


//


Token.register();
