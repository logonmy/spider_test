const Queue = require("../api/queue").Queue;

let run= async function(){
	await Queue.clear("jikeAllNeeded");	
}
run();