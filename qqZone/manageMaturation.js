const child_process = require("child_process");

let count = 2;

let getUser = (() => {
    let users = [
        // {usr: "1634129053", pas: "cqcp815"},
        // {usr: "2110998942", pas: "washu123456"},
        // {usr: "3185303424", pas: "washu123456"},
        // {usr: "2728703162", pas: "washu123456"},
        {usr: "2657981304", pas: "washu12345"},
        {usr: "3275440566", pas: "washu1234"}
    ]
    return () => {
        let result = users.shift();
        users.push(result);
        return result;
    }
})();


let createWorker = () => {
    let worker = child_process.fork(__dirname + "/maturation.js");
    worker.send({
        user: getUser()
    })
}

for(let i = 0;i< count;i++){
    createWorker();
}
