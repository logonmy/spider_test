define([], () => {
    let Async = {};

    Async.sleep = (ms = 10000) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    return Async;
});