(()=>{
    let 
        paint = false
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
        draw = (e,click)=>{
            if(paint || click){
                const 
                pos = {
                    "x":Math.trunc((e.layerX/canvas.clientHeight)*config.x),
                    "y":Math.trunc((e.layerY/canvas.clientWidth)*config.y)
                },
                pixel = ctx.createImageData(1,1)
                                
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
            }
        },
        app = ()=>{
            canvas.addEventListener("mousemove",(e)=>{
                draw(e)
            })
            canvas.addEventListener("click",(e)=>{
                e.preventDefault()
                draw(e,true)
            })
            canvas.addEventListener("mousedown",(e)=>{
                e.preventDefault()
                paint = true
            })
            canvas.addEventListener("mouseup",(e)=>{
                e.preventDefault()
                paint = false
            })
        }

    let 
        color = hexToRgb(document.querySelector("[type=color]").value)

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
            if(name.length > 0){
                color = hexToRgb(document.querySelector("[type=color]").value)
                localStorage.setItem("user",name)
                socket.emit("user registration",{user:name,color:document.querySelector("[type=color]").value})
            } else{
                alert("Please enter a user name")
            }
        return false
    })

    socket.on("user registration",(e)=>{
        if(e.user){
            document.querySelector("ul").innerHTML+=
            `
                <li>${e.msg}</li>
            `
        }
        if(e.user == localStorage.getItem("user")){
            app()
            form.querySelector("label").style.setProperty("display","none")
        }
    })

    socket.on("online users",(e)=>{
        const 
            onlineCont = document.querySelector("#online")
        
        onlineCont.innerHTML = ""
        e.forEach(el=>{
            const 
                newDiv = document.createElement("div"),
                newSpan= document.createElement("span"),
                newClr = document.createElement("div")

            newSpan.innerHTML = el.user
            newClr.style.setProperty("background",el.color)

            newDiv.appendChild(newClr)
            newDiv.appendChild(newSpan)
            onlineCont.appendChild(newDiv)
        })
    })

    socket.on("booting",(e)=>{
        if(e){
            document.body.classList.add("loading")
        }else{
            document.body.classList.remove("loading")
        }
    })

    socket.on("new word",(e)=>{
        console.log(e)
        if(document.querySelector("main h1")){
            document.querySelector("main h1").innerHTML = e
        }else{
            let
                newH1 = document.createElement("h1")
            newH1.classList.add("itemName")
            newH1.innerHTML = e
            document.querySelector("main").appendChild(newH1)
        }
    })

    socket.on("snapshot",(e)=>{
        let
            snapshot = canvas.toDataURL("image/png"),
            snapCont = document.querySelector("#snapshots"),
            newImg = document.createElement("img"),
            newSpan = document.createElement("span")

        newImg.src = snapshot

        newSpan.innerHTML = document.querySelector(".itemName span").innerHTML
        newSpan.appendChild(newImg)

        snapCont.appendChild(newSpan)

        ctx.clearRect(0,0,config.x,config.y)
    })

})()