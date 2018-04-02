const puppeteer = require("puppeteer-debug");

(async function(){
    const browser = await puppeteer.launch({
        headless:false,
        executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
    })
    const page = await browser.newPage()
    console.log('before')
    // or: await puppeteer.debug(page)
    await page.debug()// Into REPL
    console.log('after')
    await browser.close()
})()



//中国人 url： https://s.weibo.com/weibo/%25E4%25B8%25AD%25E5%259B%25BD%25E4%25BA%25BA&Refer=index


    
// context.blogNodes = await page.$$("div[action-type=feed_list_item]:not([isforward='1'])")

// easy context.openButton = context.blogNodes[0];
// context.button = await context.openButton.$$(".WB_text_opt")[0];
// await openButton.click();
//     //点开所有点开全文 并删除点开全文/收起全文按钮
//     for(let i = 0;i< blogNodes.length;i++){
//         let openButton = blogNodes[i];
//         try{
//             let button = await openButton.$$(".WB_text_opt")[0];
//             await openButton.click();
//             button = await openButton.$$(".WB_text_opt")[0];
//             await openButton.click();
//         }catch(e){
//             console.log(e);
//         }
//     }
//     await pages[0].evaluate(() => {
//         let buttons = document.querySelectorAll(".WB_text_opt");
//         for(let button of buttons){
//             button.remove();
//         }
//     })