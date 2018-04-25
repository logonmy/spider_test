const readLine = require("lei-stream").readLine
const Queue = require("../api/queue").Queue
const queueName = "jikeAllNeeded";

let i =0 ;
readLine("nowNeed.txt").go(async (data, next) => {
	//let naturalData = JSON.parse((await Queue.getDataFromMessage(queueName)).result);
	//console.log(JSON.parse(naturalData).id)

	await Queue.postDataToMessage(queueName, data);

	i++;
	console.log(i);
	next()
})