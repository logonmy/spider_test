const http = require('http')
const url = require('url')

let config = {
	num_item_limit: 10,
	//keyword: "二次元催生办",
	brick_id: 16218
}

config = JSON.stringify(config)

let post_data = {
	name: 'wx_xingbang_list',
	value: "二次元催生办",
	config,
	scheduled_at: new Date().getTime()

};

let content = JSON.stringify(post_data);
console.log(content)

let targetUrl = 'http://bee.api.talkmoment.com/scheduler/task/post'

setInterval(function () {
	push(targetUrl)
}, 14400*1000);

function push(targetUrl) {
	let urlObj = url.parse(targetUrl)
	let req = http.request({
		hostname: urlObj.hostname,
		path: urlObj.path,
		method: 'POST',
		//port:9090,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	}, res => {
		console.log(targetUrl, res.statusCode)

		let html = '';
		let data = [];
		res.on('data', chunk => {
			data.push(chunk)
		})
		res.on('end', () => {

			html = Buffer.concat(data).toString();

			console.log(html)

		})
	}).setTimeout(8200, function () {
		console.log('超时')
		process.exit(0);
	});

	req.write(content);
	req.end();
	req.on('error', (error) => {
		console.log(error);
	})
}


