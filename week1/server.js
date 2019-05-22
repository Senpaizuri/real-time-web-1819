const
    express = require("express"),
    app = express(),
    http= require("http").Server(app),
    ejs = require("ejs"),
    fetch = require("node-fetch"),
    compression = require("compression"),
    io = require("socket.io")(http),
    port = process.env.PORT || 5000,
    apiUrl = {
        "title":"Random Item API",
        "url":"http://roger.redevised.com/api/v1/"
    }

let 
    users = [],
    online = [],
    generate = true

app.use(compression())
app.use(express.static("src"))
app.set("view engine","ejs")

app.get("/",(req,res)=>{
    res.status(200).render("home/home.ejs")
})

io.on("connection",(ws)=>{
    let thisUser
    
    io.emit("online users",users)

    ws.on("disconnect",(ws)=>{
        console.log(`${thisUser} disconnected`)
        if(online.indexOf(thisUser) > -1){
            online.splice(online.indexOf(thisUser),1)
            users.splice(online.indexOf(thisUser),1)
        }
        io.emit("online users",users)
    })

    ws.on("pixel update",(update)=>{
        io.emit("pixel update",update)
    })

    ws.on("user registration",(update)=>{
        let user = update.user
        if(!online.indexOf(user) > -1 && users[online.indexOf(user)] == undefined){
            users.push({
                user:user,
                color:update.color
            })
        }
        thisUser = user
        if(online.indexOf(user) < 0){
            online.push(user)
            io.emit("user registration",{msg:`<span style="color:${update.color}">${user}</span> has joined`,user:user})
        }else{
            io.emit("user registration",{msg:`<span style=color:${users[online.indexOf(user)].color}>${user}</span> changed color to <span style=color:${update.color}>${update.color}</span>`,user:user})
            users[online.indexOf(user)].color = update.color
        }
        io.emit("online users",users)
        if(users.length >= 2 && generate == true){
            genWord()
        }
    })
})

let
    getWord = async ()=>{
       let word = await fetch(apiUrl.url).then(res => res.text()).catch(err => "tree")
       return word
    },
    genWord = ()=>{
        if(generate == false){
            io.emit("snapshot",true)
        }
        if(users.length >= 2){
            getWord().then(res => {
                io.emit("new word",`Draw this: <span>${res}</span>`)
            })
            generate = false
            setTimeout(genWord,30000)
        }else{
            io.emit("new word",`The session has ended`)
            generate = true
        }
    }
    
http.listen(port,(a,b)=>{
    console.log(`Exposed on port ${port}`)
})
