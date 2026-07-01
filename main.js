
const express=require("express")
const app=express()
const path=require("node:path")
const {Pool}=require("pg")
const nodemailer=require("nodemailer")
require("dotenv").config();

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


const transporter = nodemailer.createTransport({
    service:"gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.MY_ACCOUNT,
    pass: process.env.PASSWORD,
  },
});

async function testEmail(subject, html) {
  try {
    console.log("Attempting email...");

    const info = await transporter.sendMail({
      from: process.env.MY_ACCOUNT,
      to: process.env.MY_ACCOUNT,
      subject,
      html,
    });

    console.log("Email sent!");
    console.log(info);
  } catch (err) {
    console.error("EMAIL ERROR:");
    console.error(err);
  }
}
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("SMTP Ready");
  }
});



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






console.log("MY_ACCOUNT:", process.env.MY_ACCOUNT);
console.log("PASSWORD exists:", !!process.env.PASSWORD);

const webApk="https://go-out.onrender.com/"
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
        imageSrc="/kasi chill.jpg"
    }else{
        imageSrc="/mystery.webp"
    }
    const subject=`${name} Said Yes To the Date.Isn't that wonderful`
    const msg = `
<h2>Date Confirmed!</h2>
<p>The Date is on: ${new Date(date).toDateString()}</p>
<p>Time: ${time}</p>
<p>Food: ${food.toUpperCase()}</p>
<img src="${webApk}${imageSrc}" alt="${food}" width="300">
`;
    testEmail(subject,msg)
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

const port = process.env.PORT || 4000;

app.listen(port,()=>{
    console.log(`app is runnng on..... ${port}`)
})