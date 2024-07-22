const express = require("express")
const mongoose=require("mongoose");    //mongoose file
const Registeruser=require('./model');   //model file
const middleware=require('./middleware');   //middles file
const jwt=require('jsonwebtoken');
const app=express();

const cors=require('cors');    //linking bwt the frontend and backend server

mongoose.connect("mongodb+srv://manasakondoju181:5ay3jTGqvXZIxF1f@cluster0.dusc1yl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",{
    useUnifiedTopology:true,
    useNewUrlParser:true
}).then(
    ()=>{console.log('DB connected established');
})

app.use(express.json());
app.use(cors({origin:"*"}));

app.post('/register',async(req,res)=>{           //register
    try{
        const {username,email,password,confirmpassword} =req.body;
        let exist = await Registeruser.findOne({email});
        if (exist){
            return res.status(400).send("User already Exist")
        }
        if (password != confirmpassword){
            return res.status(400).send("Passwords are not matching");
        }
        let newUser= new Registeruser({
            username,
            email,
            password,
            confirmpassword

        });
        await newUser.save();
        res.status(200).send('Registered Successfully');
    }
    catch(err){
        console.log(err)
        return res.status(500).send("Internel Error")

    }
});


app.post('/login',async(req,res)=>{          //login
    try{
        const {email,password}=req.body;
        let exist=await Registeruser.findOne({email});
        if (!exist){
            return res.status(400).send('User Not Found');
        }
        if (exist.password !== password){
            return res.status(400).send('Invalid Credentials');
        }
        let payload={
            user:{
                id:exist.id
            }
        }
        jwt.sign(payload,'token',{expiresIn:3600000},
            (err,token)=>{
                if (err) throw err;
                return res.json({token})
            }
            )
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Server Error');
    }
});

app.get('/myprofile', middleware,async(req,res)=>{   //middleware
    try{
        let exist= await Registeruser.findById(req.user.id);
        if (!exist){
           return res.status(400).send("User not Found");
        }
        res.json(exist);
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Server Error');
    }

})



app.listen(4000,()=>{
    console.log("server is running");
})