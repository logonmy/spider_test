const Http = require("../api/http").Http;

let Task = {};

Task.fetchTask = (name) => {
    return new Promise(async(resolve, reject) => {
        try{
            let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/fetch?name=${name}`);
            task = JSON.parse(task);
            task = task.result;
            if (task.id === 0) throw new Error("暂时没有任务");
            resolve(task);
        }catch(e){
            reject(e)
        }
    })
};

Task.putTaskData = async(task) => {
    let query = {
        task_id: task.id,
        data: task.data
    };
    await Http.call(`http://bee.api.talkmoment.com/scheduler/task/data/put`, query);
};

Task.resolveTask = async(task) => {
    await Http.call(`http://bee.api.talkmoment.com/scheduler/task/resolve?task_id=${task.id}`);
};

//todo
Task.callClean = async(task) => {
    await Http.call(`http://bee.api.talkmoment.com/scheduler/task/resolve?task_id=${task.id}`);
}

Task.rejectTask = async(task, err) => {
    let query = {
        task_id: task.id,
        reason: err.stack || "N/A"
    };
    await Http.call(`http://bee.api.talkmoment.com/scheduler/task/reject`, query);
};

Task.countTask = async(task_id, bee_name) => {
    let query = {
        task_id: task_id,
        name: bee_name,
        state: "INTASK",
        created_at: Date.now()
    }
    await Http.call('http://bee.api.talkmoment.com/bee/wash/state/put', query);
}

exports.Task = Task;