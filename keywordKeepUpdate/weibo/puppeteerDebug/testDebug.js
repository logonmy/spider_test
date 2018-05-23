const readline = require('readline')

async function debug () {
    return await new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> '
        })
        rl.prompt()
        rl.on('line', (line) => {
            if(line.indeOf("easy") > -1){

            }else{

            }
            try {
                eval(`(async () => {
          console.log(${line})
        })()`).then(() => {
                    rl.prompt()
                })
            } catch (e) {
                console.error(e)
                rl.prompt()
            }
        })
        rl.on('close', () => {
            rl.close()
            console.log('')
            resolve()
        })
    })
}
async function run (){
    await debug();
}
run()




