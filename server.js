const
    express = require("express"),
    app = express(),
    http= require("http").Server(app),
    ejs = require("ejs"),
    compression = require("compression"),
    io = require("socket.io")(http),
    port = process.env.PORT || 5000

let users = []
let online = []
let check = (str,arr)=>{
    let q = false
    let x = 0
    arr.forEach((el,i) => {
        if(arr[i].user == str){
            q = true
            x = i
        } else{
            q = false
            x = i
        }
    })
    return {q:q,x:x}
}

app.use(compression())
app.use(express.static("src"))
app.set("view engine","ejs")

app.get("/",(req,res)=>{
    res.status(200).render("home/home.ejs")
})

io.on("connection",(ws)=>{
    let thisUser
    io.emit("online users",online)

    ws.on("disconnect",(ws)=>{
        console.log(`${thisUser} disconnected`)
        online.splice(online.indexOf(thisUser),1)
        io.emit("online users",online)
    })

    ws.on("pixel update",(update)=>{
        io.emit("pixel update",update)
    })

    ws.on("user registration",(update)=>{
        let user = update.user
        if(!check(user,users).q){
            users.push({
                user:user,
                color:update.color
            })
        }
        thisUser = user
        if(online.indexOf(user) < 0){
            online.push(user)
        }
        io.emit("user registration",{msg:`<span style="color:${update.color}">${user}</span> has joined`,user:user})
        console.log(online,users)
        io.emit("online users",online)
    })
})

http.listen(port,(a,b)=>{
    console.log(`Active on port ${port}`)
})
