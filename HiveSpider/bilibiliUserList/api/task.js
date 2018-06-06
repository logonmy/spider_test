define(["./http", "./socket"], function(Http, Socket){
    let Task = {};

    Task.fetchTask = async(name) => {
        try {
            let task = await Http.call(`http://bee.api.talkmoment.com/scheduler/task/fetch?name=${name}`);
            if (task.id === 0) return null;
            Socket.log(`取得任务,task=`, task);
            return task;
        } catch(err) {
            Socket.error("获取任务失败, err=", err.stack);
            return null;
        }
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

    Task.rejectTask = async(task, err) => {
        let query = {
            task_id: task.id,
            reason: err.stack || "N/A"
        };
        await Http.call(`http://bee.api.talkmoment.com/scheduler/task/reject`, query);
    };

    Task.countTask = async(task) => {
        let query = {
            task_id: task.id,
            name: task.name,
            state: "INTASK",
            created_at: Date.now()
        }
        await Http.call('bee.api.talkmoment.com/bee/wash/state/put', query);
    }

    return Task;
});