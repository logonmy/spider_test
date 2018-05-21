const getBrick = require("../api/lego").getBrick;
const File = require("fs");

(async () => {
    let resu = await getBrick(800);
    resu = JSON.parse(resu)
    console.log(resu.result)
    for(let re of resu.result){
        if(re.name.indexOf("微信") > -1){
            let ss = {
                name: re.name,
                brick_id: re.id
            }
            File.appendFileSync("result.txt", JSON.stringify(ss) + "\n")
        }
    }
})();