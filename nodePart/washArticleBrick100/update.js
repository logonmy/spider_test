// 70549392
const getLego = require("../api/lego").getLego
const putLego = require("../api/lego").putLego
const importLego = require("../api/lego").importLego

const updateLego = async () => {
    
}

const modifyLeog = async () => {

}

(async () => {
    const lego_id = 70549392;
    let lego = await getLego(lego_id);
    console.log(lego);
    let brief = "好消息！「影向标」推出了小程序！"
    let r = JSON.parse(lego.R);
    r.brief = brief;
    lego.R = JSON.stringify(r);
    await putLego(lego);
    await importLego(lego_id)
})()
