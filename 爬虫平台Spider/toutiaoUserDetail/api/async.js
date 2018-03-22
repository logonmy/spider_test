define([], () => {
    let Async = {};

    Async.sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    return Async;
});