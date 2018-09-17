const readLine = require("lei-stream").readLine
const File = require("fs")
let a = ["渌渚镇中学",
    "杭州艮山中学",
    "杭州聋哑学校",
    "杭州国际学校",
    "杭州育才中学",
    "杭州丰潭中学",
    "萧山金山初中",
    "杭州养正学校",
    "新理想高复学校",
    "杭州第十二中学",
    "萧山区回澜中学",
    "富阳市场口中学",
    "浙江省盲人学校",
    "杭州市东方中学",
    "杭州市丰潭中学",
    "杭州市公益中学",
    "杭州市江城中学",
    "杭州市景芳中学",
    "杭州市夏衍中学",
    "杭州市第六中学",
    "富阳市实验中学",
    "富阳市江南中学",
    "杭州市第九中学",
    "杭州市康桥中学",
    "杭州市上泗中学",
    "杭州钱塘外国语",
    "杭州市开元中学",
    "杭州市大关中学",
    "杭州市春蕾中学",
    "杭州市朝晖中学",
    "杭州市袁浦中学",
    "杭州市周浦中学",
    "杭州市拱宸中学",
    "杭州市运河学校",
    "杭州市长河中学",
    "杭州市西兴中学",
    "杭州市浦沿中学",
    "杭州市滨兴学校",
    "杭州市长征中学",
    "杭州市青春中学",
    "杭州市育才中学",
    "杭州市惠兴中学",
    "杭州市锦绣中学",
    "杭州市闸弄口中学",
    "杭州私立国佳学校",
    "明珠教育集团学校",
    "杭州西湖高级中学",
    "建德育才高级中学",
    "杭州市外国语学校",
    "杭州市机场路中学",
    "杭州市四季青中学",
    "杭州天成教育集团",
    "杭州市虎山路初中",
    "杭州二中滨江校区",
    "杭州江南实验学校",
    "杭州滨兰实验学校",
    "杭州之江高级中学",
    "萧山区蜀山中心学校",
    "萧山区第二高级中学",
    "建德市三河中心学校",
    "建德市石屏中心学校",
    "杭州市采荷实验学校",
    "杭州市大成实验学校",
    "杭州仁和外国语学校",
    "建德市育才高级中学",
    "杭州市景成实验学校",
    "杭州市西溪实验学校",
    "杭师大东城实验学校",
    "杭州市北苑实验中学",
    "杭州市高新实验学校",
    "杭州萧山区高桥初中",
    "萧山区湘湖初级中学",
    "杭州天目外国语学校",
    "杭州市西湖高级中学",
    "杭州市求是高级中学",
    "建德市新世纪实验学校",
    "萧山区所前镇初级中学",
    "北京四中网校杭州分校",
    "杭州二中树兰实验学校",
    "绍兴市绍兴县鉴湖中学",
    "杭州国泰外语艺术学校",
    "杭州师范大学东城中学",
    "淳安县千岛湖镇南山学校",
    "杭州市余杭区蒲公英学校",
    "杭州市第二中学东河校区",
    "平阳县万全综合高级中学",
    "杭州市第四中学下沙校区",
    "杭州市钱江新城实验学校",
    "杭州萧山区第六高级中学",
    "杭州市文海实验学校初中",
    "杭州市西湖第一实验学校",
    "浙江省慈溪市杨贤江中学",
    "杭州安吉路良渚实验学校",
    "乐清国际外国语学校初中部",
    "杭州市萧山区第三高级中学",
    "杭州市第十五中学（高中）",
    "杭州市金沙学校（中学部）",
    "杭州实验外国语学校中学部",
    "杭十五中教育集团西溪中学",
    "浙江省教科院附属实验学校",
    "杭州锦绣育才中学附属学校",
    "杭州市萧山区城南初级中学",
    "杭州市余杭区第二高级中学",
    "杭州第二中学树兰实验学校",
    "保俶塔实验学校申花路校区",
    "杭州市保俶塔实验学校初中部",
    "杭州市翠苑中学（文华校区）",
    "杭州市采荷中学（采荷校区）",
    "杭州市翠苑中学（翠苑校区）",
    "宁波市第三中学（宁波三中）",
    "杭州师范学院附属三墩高级中学",
    "杭十五中教育集团浙大附属初中",
    "杭州市第十一中学（杭十一中）",
    "杭州市高桥金帆实验学校（初中）",
    "上海市奉贤区五四学校（中学部）",
    "杭州市长河高级中学（长河高中）",
    "浙江传媒学院实验中学（艮山中学）",
    "杭州市树兰中学（原大关树兰中学）",
    "杭州市保俶塔实验学校（紫金港校区）",
    "杭州师范大学附属中学（杭师大附中）",
    "杭州市留下中学（浙工大附属实验学校）",
    "杭州第二中学滨江校区（杭二中滨江校区）",
    "浙江艺术职业学院",
    "浙江交通职业技术学院",
    "杭州职业技术学院",
    "浙江机电职业技术学院",
    "浙江商业职业技术学院",
    "浙江警官职业学院",
    "浙江旅游职业学院",
    "浙江金融职业学院",
    "浙江经济职业技术学院",
    "浙江建设职业技术学院",
    "浙江经贸职业技术学院",
    "浙江育英职业技术学院",
    "杭州万向职业技术学院",
    "浙江长征职业技术学院",
    "杭州师范大学钱江学院",
    "浙江医学高等专科学校",
    "浙江同济科技职业学院",
    "浙江体育职业技术学院",
    "浙江警察学院",
    "浙江大学",
    "浙江传媒学院",
    "浙江农林大学",
    "浙江理工大学",
    "浙江中医药大学",
    "杭州师范大学",
    "浙江科技学院",
    "浙江财经大学",
    "浙江教育学院",
    "杭州电子科技大学",
    "浙江工商大学",
    "浙江水利水电专科学校",
    "浙江树人学院",
    "浙江外国语学院",
    "杭州万向职业技术学院",
    "杭州师范大学钱江学院",
    "杭州科技职业技术学院"];

let sets = new Set();
for(let s of a){
    sets.add(s);
}
let names = [];
readLine("download.txt").go((data, next) => {
    try{
        data = JSON.parse(data);
        if(!sets.has(data.title)){
            names.push(data.title);
        }
    }catch(e){}
    next()
}, () => {
    readLine("zhongxuedetail.txt").go((data, next) => {
        try{
            data = JSON.parse(data);
            if(!sets.has(data.name)){
                names.push(data.name)
            }
        }catch(e){}
        next();
    }, () => {
        console.log(names.length);
        for(let n of names){
            File.appendFileSync("altext.txt", n + "\n")
        }
    })
})