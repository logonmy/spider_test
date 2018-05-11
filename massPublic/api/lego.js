const Http = require("../api/http").Http

let addLegoBrick = async(name, desc) =>{
	let morArgs = {
		"name": name,
		"desc": desc,
		"tag": "",
		"created_at": new Date().getTime(),
		"size": 0
	}
	let result = await Http.call("http://chatbot.api.talkmoment.com/lego/library/legobrick/post?version=002", morArgs);
	console.log(typeof(result))
	return result;
}
let deleteLegoBrick = async(brick_id) =>{
	let result = await Http.get("http://chatbot.api.talkmoment.com/lego/library/legobrick/del?brick_id=" + brick_id + "&version=002");
	return result;
}

let readLegoFirst = async (brick_id) => {
    let result = await Http.get("http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id="+ brick_id +"&id_start=99999999&limit=1&version=002");
    return result;
}

exports.addLego = addLegoBrick;
exports.deleteLego = deleteLegoBrick;
exports.readLegoFirst = readLegoFirst;