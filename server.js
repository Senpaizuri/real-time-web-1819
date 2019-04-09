const
    express = require("express"),
    app = express(),
    http= require("http").Server(app),
    ejs = require("ejs"),
    compression = require("compression"),
    io = require("socket.io")(http),
    port = process.env.PORT || 5000

let users = []
let check = (str,arr)=>{
    let q = false
    arr.forEach((el,i) => {
        if(arr[i].user == str){
            q = true
        } else{
            q = false
        }
    })
    return q
}

app.use(compression())
app.use(express.static("src"))
app.set("view engine","ejs")

app.get("/",(req,res)=>{
    res.status(200).render("home/home.ejs")
})

io.on("connection",(ws)=>{
    console.log("a user connected")
    ws.on("disconnect",(ws)=>{
        console.log("a user disconnected")
    })
    ws.on("pixel update",(update)=>{
        io.emit("pixel update",update)
    })
    ws.on("user registration",(update)=>{
        let user = update.user
        if(!check(user,users)){
            users.push({
                user:user
            })
            console.log(`user ${user} registered`)
            io.emit("user registration",{msg:`<span style="color:${update.color}">${user}</span> has joined`,user:user})
        } else{
            console.log(`user ${user} already registered`)
            io.emit("user registration",toString({msg:`<span style="color:${update.color}">${user}</span> has joined`,user:user}))
        }
    })
})

http.listen(port,(a,b)=>{
    console.log(`Active on port ${port}`)
})
