const fs = require('fs');
const argv = require('yargs').argv;
const csvParser = require('csv-parse/lib/sync');
const GhostAdminAPI = require('@tryghost/admin-api');

if (!argv.file)
	console.error('please specify file to import using "--file"')
if (!argv.author)
	console.error('please specify author mail address using "--author"')
if (!argv.url)
	console.error('please specify your blogs url using "--url"')
if (!argv.key)
	console.error('please specify your admin api key using "--key"')

const api = new GhostAdminAPI({
	url: argv.url,
	key: argv.key,
	version: 'v3'
});

// delayed execution is required to not run in rate limiting
Array.prototype.delayedForEach = function (callback, timeout, thisArg) {
	var i = 0,
		l = this.length,
		self = this,
		caller = function () {
			callback.call(thisArg || self, self[i], i, self);
			(++i < l) && setTimeout(caller, timeout);
		};
	caller();
};

let records = readCsvFile();
records.delayedForEach(function (record) {
	let post = buildPostFromCsvRecord(record);

	api.posts.add(post, { source: 'html' })
		.then(res => console.log("creating post ", post.title, " succeeded, id is ", res.id))
		.catch(err => console.error("creating post ", post.title, " failed with message: ", err));
}, 1000);

function readCsvFile() {
	let csvContent = fs.readFileSync(argv.file);
	let records = csvParser(csvContent, {
		bom: true,
		from_line: 2,
		trim: true,
		delimiter: ';',
		columns: ['Tag', 'Title', 'Location', 'Year', 'Role', 'People'],
		skip_empty_lines: true
	});
	return records;
}

function buildPostFromCsvRecord(record) {
	let html = '';
	html += record.Role ? `<p><b>Role</b></p><p>${record.Role}</p>` : '';
	html += record.Location ? `<p><b>Location</b></p><p>${record.Location}</p>` : '';
	html += record.Year ? `<p><b>Date</b></p><p>${record.Year}</p>` : '';
	let publishedAt = `${record.Year || (new Date()).getFullYear()}-01-01T00:00:01.000Z`;
	return {
		title: record.Title,
		custom_excerpt: `${record.Title} ${record.Location}, ${record.Year}.`,
		html: html,
		status: 'draft',
		published_at: publishedAt,
		authors: [argv.author],
		tags: [record.Tag]
	};
}
