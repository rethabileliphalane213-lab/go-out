require("dotenv").config();
const express=require("express")
const app=express()
const path=require("node:path")
const {Pool}=require("pg")

app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname,'public')))
app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))

const con = new Pool({
  connectionString: process.env.DATABASE_URL,
});

con.connect().then(()=>{
    console.log("Connected Succesfully")
}).catch(()=>{
    console.log("connecting Failed!!!")
})


//////////////////////////ASYNC FUNCTINS///////////////////////

async function date(obj) {
    const {date,time}=obj
    console.log(time)
    console.log(date)

    await con.query(`INSERT INTO date(date,time)VALUES($1,$2)`,[date,time])
}

async function orderedFood(obj) {
    const {food}=obj
    await con.query(`INSERT INTO date(food)VALUES($1)`,[food])
}


/////////////////////////////////////////////////////////////////

let crushId
app.get("/",(req,res)=>{
    res.render("home")

})

app.get("/comment1",(req,res)=>{
    res.render("yes")
})

app.get("/date",(req,res)=>{
    res.render("date")
})

app.post("/date",async(req,res)=>{
    console.log(req.body)
 const results=await con.query(`INSERT INTO DATE(date,time)VALUES($1,$2) RETURNING id`,[req.body.date,req.body.time])

 crushId=results.rows[0].id
 res.render("food")
})

app.get("/food",(req,res)=>{
  res.render("food")   
})
app.post("/food",async(req,res)=>{
    console.log(req.body)
   await con.query(`UPDATE date SET food=$1 WHERE id=$2`,[req.body.food,crushId])
   res.render("username")
})
app.get("/username",(req,res)=>{
    res.render("username")
})
let imageSrc=""
app.post("/username",async(req,res)=>{
    
    await con.query(`UPDATE date SET phone=$1,name=$2 WHERE id=$3`,[req.body.phone,req.body.name,crushId])
     const dateInfo=await con.query(`SELECT * FROM date WHERE id=$1`,[crushId])
     
    const {name,date,time,food}=dateInfo.rows[0]
    if(food==="fts"){
imageSrc="/kota.jpg" 
    }else if(food ==="ice-cream"){
        imageSrc="/ice-cream.jpeg"
    }
    else if(food==="pizza"){
        imageSrc="/pizza.jpg" 
    }else if(food === "burger"){
        imageSrc="/burger.jpeg"
    }
    else if(food==="kasi chill"){
        imageSrc="/loal.jpg"
    }else{
        imageSrc="/mystery.webp"
    }
    res.render("complete",{username:name,dateChosen:date,timeChosen:time,foodChosen:food,src:imageSrc})
})

app.get("/complete",async(req,res)=>{

    
})
app.get("/no",(req,res)=>{
    res.render("no")
})

app.get("/mission-failed",(req,res)=>{
    res.render("mission-failed")
})

port=4000||5000

app.listen(port,()=>{
    console.log(`app is runnng on..... ${port}`)
})