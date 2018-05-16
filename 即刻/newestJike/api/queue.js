const Http = require("../api/http").Http;
const getApi = require("../api/fetch").getApi;

let Queue = {}

Queue.postDataToMessage = async (queueName, data) => {
    return await Http.call(`http://bee.api.talkmoment.com/message/publish?topic=${queueName}`, data);
};

Queue.getDataFromMessage = async (queueName) => {
	return await getApi(`http://bee.api.talkmoment.com/message/subscribe/try?topic=${queueName}`)
}
Queue.clear = async (queueName) => {
	while(true){
		await Queue.getDataFromMessage(queueName);
	}
	return null;
}

Queue.detail = async (queueName, limit) => {
	let result = await getApi("http://bee.api.talkmoment.com/message/detail?topic=" + queueName + "&limit=" + limit +"&offset=0");
	return  result;
} 

Queue.size = async (queueName) => {
	let result = await getApi("http://bee.api.talkmoment.com/message/status");
	result =  result.result[0];
	let size = 0;
	for(let i = 0; i < result.length; i++){
		if(result[i].topic === queueName){
			size = result[i].topic;
			break;
		}
	}
	return size;
}
exports.Queue = Queue;

// (async () => {
// 	let a = {
//     	topic_id: "5892a5ae87f7850015784318",
// 		brick_id: 16197,
// 		name: "即刻_Steam游戏打折情报",
// 		create_at: 1525276800000
// 	}
//
//     let b = {
//         topic_id: "557a5ad9e4b04876b8698306",
//         brick_id: 16198,
//         name: "即刻_Steam游戏每日特惠的描述",
//         create_at: 1525276800000
//     }
//     await Queue.postDataToMessage("jike_new_date", a);
//     await Queue.postDataToMessage("jike_new_date", b);
// })();