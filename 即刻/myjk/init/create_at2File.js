const File = require("./api/file").File;
const lego = require("./api.lego").Lego;
const fs = require(fs)

const href = "http://chatbot.api.talkmoment.com/lego/library/lego/list?brick_id=16219&id_start=99999999&limit=1000&version=002"


const FindNewestC = async (brick_id) => {
    let NewC = 0;
    let datas = AllRequest(brick_id);
    for(let da of datas){
        if(da.created_at > NewC){
            NewC =da.created_at;
        }
    }
    return NewC;
}

const oneRequest = async (brick_id) => {
    let a = await Http.get(href);
}

const AllRequest = async (brick_id) => {
    let a = await Http.get(href)
    let
}

const run = async() => {
    for(let i = 14125;i < 16196; i++){
        let data = {
            brick_id:
        }
    }
}
run()