const Queue = require("../api/queue").Queue;

let task =[
    "粉底液",
    "BB霜",
    "遮瑕膏",
    "润唇膏",
    "底妆",
    "唇膏",
    "乳液",
    "眼霜",
    "睫毛膏",
    "洗面奶",
    "护手霜",
    "爽肤水",
    "口红",
    "眼影",
    "面膜",
    "气垫",
    "氨基酸洗面奶",
    "防晒霜",
    "彩妆",
    "唇色",
    "眼妆",
    "眼线",
    "化妆刷",
    "护肤品",
    "祛痘印",
    "防晒",
    "祛斑",
    "祛痘",
    "美白",
    "美容护肤",
    "美容养颜",
    "皮肤保养",
    "眼部护理",
    "皮肤护理",
    "脸部清洁",
    "皮肤清洁",
    "固体散粉",
    "液体散粉",
    "腮红饼",
    "腮红",
    "腮红膏",
    "腮红笔",
    "卸妆水",
    "卸妆油",
    "卸妆膏",
    "面部卸妆",
    "眼唇卸妆",
    "无油面霜",
    "化妆水",
    "紧肤水",
    "收敛水",
    "柔肤水",
    "柔软水",
    "保湿水",
    "洁面",
    "皂基",
    "氨基酸基",
    "洁面泡沫",
    "洁面粉",
    "洁面皂",
    "美白精华",
    "抗衰老精华",
    "淡斑精华",
    "防晒喷雾",
    "防晒棒",
    "膜状面膜",
    "盒装面膜",
    "补水面膜",
    "清洁面膜",
    "美白面膜",
    "保湿",
    "抗皱",
    "抗氧化",
    "淡斑",
    "淡痘印",
    "去角质",
    "收敛毛孔",
    "抗雾霾",
    "晒后修复",
    "眼部护肤",
    "淡化黑眼圈",
    "去眼袋"];

(async () => {
    for(let i=0;i< task.length;i++){
        await Queue.postDataToMessage("DressingZ", task[i]);
        console.log("已完成到   ", i);
    }
})();
