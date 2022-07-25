const express=require("express");
const mongoose=require("mongoose");
const multer=require('multer')
const {aws} = require('aws-sdk')
const route=require("./route/route");

const app=express();

app.use(express.json())
app.use(multer().any())

mongoose.connect("mongodb+srv://sangamsuman323:XVZrnDNPfS8c21p8@cluster0.bolaw.mongodb.net/group40Database",{
    useNewUrlParser:true
})

.then(()=>console.log("MongooDB Connected"))
.catch((error)=>console.log(error))

app.use('/',route)


app.listen(3000, function(){
    console.log("Express app running on Port 3000")
})