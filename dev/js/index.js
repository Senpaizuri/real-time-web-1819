(()=>{
    const 
        socket = io(),
        canvas = document.querySelector("canvas"),
        config = {x:canvas.width,y:canvas.height},
        ctx = canvas.getContext("2d"),
        hexToRgb = (hex)=>{
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null
        },
        app = ()=>{
            canvas.addEventListener("mousemove",(e)=>{
                const 
                    pos = {
                        "x":Math.trunc((e.layerX/canvas.clientHeight)*config.x),
                        "y":Math.trunc((e.layerY/canvas.clientWidth)*config.y)
                    },
                    pixel = ctx.createImageData(1,1),
                    color = hexToRgb(document.querySelector("[type=color]").value)
                
                pixel.data[0] = color.r  
                pixel.data[1] = color.g  
                pixel.data[2] = color.b
                pixel.data[3] = 255
        
                socket.emit("pixel update",{
                    pos,
                    "pixel":{
                        r:pixel.data[0],
                        g:pixel.data[1],
                        b:pixel.data[2],
                        a:pixel.data[3]
                    }
                })
                ctx.putImageData(pixel,pos.x,pos.y)
            })
        }

    socket.on("pixel update",(update)=>{
        const 
            pos = update.pos,
            pixel = ctx.createImageData(1,1)
        
        pixel.data[0] = update.pixel.r
        pixel.data[1] = update.pixel.g
        pixel.data[2] = update.pixel.b
        pixel.data[3] = update.pixel.a

        ctx.putImageData(pixel,pos.x,pos.y)
    })

    const form = document.querySelector("form")

    form.addEventListener("submit",(e)=>{
        e.preventDefault()
        const name = document.querySelector("#username").value
        localStorage.setItem("user",name)
        socket.emit("user registration",{user:name,color:document.querySelector("[type=color]").value})
        return false
    })

    socket.on("user registration",(e)=>{
        console.log(e.user,localStorage.getItem("user"))
        if(e.user){
            document.querySelector("ul").innerHTML+=
            `
                <li>${e.msg}</li>
            `
        }
        if(e.user == localStorage.getItem("user")){
            app()
            console.log("booting app")
        }
    })

    socket.on("online users",(e)=>{
        console.log(e)
    })

})()