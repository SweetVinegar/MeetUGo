var keystone = require('keystone');
var Types = keystone.Field.Types;



/**
 * Discover Model
 * ==========
 */

var Discover = new keystone.List('Discover', {
    map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true },
});

Discover.add({
    title: { type: String, initial: true, default:'Title',required: true },
    content: { type: Types.Html, wysiwyg: true, height: 400 },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
    publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },    
    categories: { type: Types.Relationship, ref: 'DiscoverCategory',  many: false, initial: true, required: true, default:''},
});

Discover.defaultSort = '-publishedDate';
Discover.defaultColumns = 'title|20%, state|20%, publishedDate|20%';



Discover.schema.virtual('url').get(function () {
    return '/discover/' + this.slug;
});

Discover.register();
