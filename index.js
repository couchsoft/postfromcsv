const fs = require('fs');
const argv = require('yargs').argv;
const csvParser = require('csv-parse/lib/sync');
const GhostAdminAPI = require('@tryghost/admin-api');

if (!argv.file)
	console.error('please specify file to import using "--file"')
if (!argv.author)
	console.error('please specify author mail address using "--author"')

const api = new GhostAdminAPI({
	url: 'http://localhost:2368',
	key: '5e41113673513e3848a5b698:6ac9d54303f48d68746620c1667d8bef227e9982074db214b5927c732f2e1cbd',
	version: 'v3'
});

let records = readCsvFile();
records.forEach(record => {
	let post = buildPostFromCsvRecord(record);
	api.posts.add(post, { source: 'html' })
		.then(res => console.log(JSON.stringify(res)))
		.catch(err => console.error(err));
});

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
		status: 'published',
		published_at: publishedAt,
		authors: [argv.author],
		tags: [record.Tag]
	};
}
