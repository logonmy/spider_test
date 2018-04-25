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

//exports.addLego = addLego;
//exports.deleteLego = deleteLego;


let run = async() => {
	var a = JSON.parse(await addLegoBrick("ceshi8", "cesjo1"));
	console.log(a)
	console.log(typeof(a));
	console.log(a.result);
	console.log(typeof(a.result));
	console.log(await deleteLegoBrick(11861));
}
run()