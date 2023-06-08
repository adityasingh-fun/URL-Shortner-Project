const express = require('express')
const mongoose = require('mongoose')
const route = require('./src/route/route')
const app = express()


mongoose.set('strictQuery', true);

app.use(express.json())

mongoose.connect('mongodb+srv://sanketmunishwar7:q5WEY4lK4vMAzwbJ@cluster0.0jenlvx.mongodb.net/group8Database?retryWrites=true&w=majority',{
    useNewUrlParser: true
})
.then(()=> console.log("DB connected"))
.catch((err)=>console.log(err))

app.use((err,req,res,next)=>{
    if(err){
        return res.status(400).send({status:false,messsage:"Please provide valid JSON"})
    }
    else{
        next()
    }
});

app.use('/',route)



app.listen(3000, function(){
    console.log('Express app is running on '+ 3000)
})


