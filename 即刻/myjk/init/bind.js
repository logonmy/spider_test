const readLine = require("lei-stream").readLine;
const File = require("fs")


// let result = [];
// let selectedResult = [];
// readLine("taskName.txt").go(async (data, next) => {
// 	selectedResult.push(JSON.parse(data));
// 	next();
// },() => {
// 	readLine("legolibrary_result.txt").go(async(data, next) => {
// 		data = JSON.parse(data);
// 		for(let json of selectedResult){
// 			if(data.name === json.topic_name){
// 				json.brick_id = data.brick_id;
// 			}
// 		}
// 		next()
// 	}, () => {
// 		for(let da of selectedResult){
// 			File.appendFileSync("allNeed.txt", JSON.stringify(da) + "\n");
// 		}
// 	})
// })



// readLine("selected.txt").go(async (data, next) => {
// 	let data2 = {
// 		topic_id: void 0,
// 		topic_name: void 0
// 	}
// 	if(!data){
// 		next();
// 	}
// 	console.log(JSON.parse(data).id);
// 	console.log(JSON.parse(data).content);

// 	data2.topic_id = JSON.parse(data).id;
// 	data2.topic_name = "即刻_" + JSON.parse(data).content;
// 	console.log(data2);
// 	try{
// 		File.appendFileSync("taskName.txt", JSON.stringify(data2) + "\n");	
// 		console.log(1)
// 	}
// 	catch(e){

// 	}
// 	next();
// })

