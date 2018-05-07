const Http = require("../api/http").Http;

let Task = {};

Task.fetchTask = async(name) => {
    let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/fetch?name=${name}`);
    task = JSON.parse(task);
    task = task.result;
    if (task.id === 0) return null;
    return task;
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

exports.Task = Task;
