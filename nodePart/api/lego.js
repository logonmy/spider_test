const Http = require("../api/http").Http

let addLegoBrick = async (name, desc) => {
	let morArgs = {
		"name": name,
		"desc": desc,
		"tag": "",
		"created_at": new Date().getTime(),
		"size": 0
	}
	let result = await Http.call("http://chatbot.api.talkmoment.com/lego/library/legobrick/post?version=002", morArgs);
	console.log(typeof (result));
	return result;
}
let deleteLegoBrick = async (brick_id) => {
	let result = await Http.get("http://chatbot.api.talkmoment.com/lego/library/legobrick/del?brick_id=" + brick_id + "&version=002");
	return result;
}

let readLegoFirst = async (brick_id) => {
	let result = await Http.get("http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id=" + brick_id + "&id_start=99999999&limit=1&version=002");
	return result;
}

let getLegoBrickOne = async (brick_id, id) => {
	let result = await Http.get("http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id=" + brick_id + "&id_start=" + id + "&limit=100&version=002");
	return result;
}
let getLegoBrickAll = async (brick_id) => {
	let datas = [];
	let result = await Http.get("http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id=" + brick_id + "&id_start=99999999&limit=100&version=002");
	result = JSON.parse(result);
	let length = result.result.length - 1;
	let id = result.result[length].id;
	while (length === 99) {
		try {
			console.log("....loading");
			result = await getLegoBrickOne(brick_id, id);
			result = JSON.parse(result);
			length = result.result.length - 1;
			id = result.result[length].id;
			datas = datas.concat(result.result);
		} catch (e) {
			console.log(e);
			console.log("getLegoBrickOne Error");
		}
	}
	return datas;
}

const getLegoBrick = async (limit) => {
	let result = await Http.get("http://chatbot.api.talkmoment.com/lego/library/brick/list?limit=" + limit + "&version=002");
	return result;
}

const updateLego = async (lego) => {
	Http.call("http://chatbot.api.talkmoment.com/lego/library/lego/put", lego);
}

const getLego = async (lego_id) => {
	let result = await Http.get("http://chatbot.api.talkmoment.com/lego/library/lego/get?id=" + lego_id);
	return JSON.parse(result).result;
}

const postOneLego = async (data) => {
	let d = await Http.call("http://chatbot.api.talkmoment.com/lego/library/lego/post", data);
	return d;
}

const putLego = async (data) => {
	let result = await Http.call("http://chatbot.api.talkmoment.com/lego/library/lego/put", data)
	return result;
}

const importLego = async (lego_id) => {
	let href = "http://chatbot.api.talkmoment.com/lego/engine/lego/import?id=" + lego_id
	let d = await Http.get(href);
	return d;
}


exports.addLego = addLegoBrick;
exports.deleteLego = deleteLegoBrick;
exports.readLegoFirst = readLegoFirst;
exports.getLegoBrickAll = getLegoBrickAll;
exports.getBrick = getLegoBrick;
exports.getLego = getLego;
exports.updateLego = updateLego;
exports.postOneLego = postOneLego;
exports.getLegoBrickOne = getLegoBrickOne;
exports.putLego = putLego;
exports.importLego = importLego;