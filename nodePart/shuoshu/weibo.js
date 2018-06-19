const getLegoBrickAll = require("../api/lego").getLegoBrickAll;

(async () => {
    let data = await getLegoBrickAll(11784);
    console.log(data);
})()