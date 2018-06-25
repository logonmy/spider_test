const readLine = require("lei-stream").readLine;
const File = require("fs");

readLine("other.txt").go(async(data, next) => {
	data = JSON.parse(data);
	for(let i=0;i< data.length -2;i++){
		if(data[i].p && (data[i].p.indexOf("【")>-1 ||data[i].p.indexOf("[") -1) && data[i].p.indexOf("http") < 0){
			if(data[i].p.indexOf("未经允许") > -1 || data[i].p.indexOf("[size=3][color=green") > -1 || data[i].p.indexOf("[/color]") > -1 ){
				continue;
			}
			if(data[i].p.indexOf("】") > -1 && data[i].p.indexOf("】") < 5){
				data[i].p = data[i].p.split("】")[1];
			}else if(data[i].p.indexOf("[") > -1 && data[i].p.indexOf("[") < 5){
				data[i].p = data[i].p.split("[")[1];
			}

			if(data[i+1] && ((data[i+1].p && data[i+1].p.indexOf("http")) > -1 || data[i+1].img)){
				let picSrc = data[i+1];
				let da = void 0;
				if(picSrc.img){
					da = {
						title: data[i].p,
						src: picSrc.img.src
					}
				}else if(picSrc.p){
					try{
						picSrc.p = picSrc.p.split("]")[1].split("[")[0];
						da = {
							title: data[i].p,
							src: picSrc.p
						}
					}catch(e){
						
					}
					
				}
				if(da){
					console.log(da)
					File.appendFileSync("4.txt", JSON.stringify(da) + "\n");
				}
			}
			
		}
	}
	next();
})