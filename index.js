const express = require('express');
const PORT = process.env.PORT || 3000;
const {ClassUsers, Subjects, Class} = require("./Models/Schema.js");
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//Database Connection
dbConnection()
.then()
.catch((e)=>{});
async function dbConnection(){
    await mongoose.connect(process.env.MONGODB_URL);
};
//User Login
app.get("/login", async(req, res)=>{
    const {email, password} = req.query;
    const user = await ClassUsers.findOne({email:email});
    if(user.password != '' || user.password != undefined){
       bcrypt.compare(password, user.password, (err, result)=>{
        if(err){
            res.status(404).send("Invalid Password");
        }else{
            if(result){
                const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '14d' });
                res.send({token:token});
            }else{
                res.status(404).send("Invalid Password");
            }
        }
       })
    }else{
        res.status(404).send("User not Fount");
    }
});
//user SignUp
app.post("/signUp", async(req, res)=>{
    try{
        const {name, email, password} = req.body.params;
        if(!name  || !email || !password){
            res.status(404).send("Invalid credientials");
            
        }else{
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
        const newUser = new ClassUsers({name:name,email:email,password:hashedPass});
        await newUser.save();
        const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '14d' });
        res.send({token:token});
        }
    }catch(err){
        console.log(err);
         res.status(404).send("Invalid credientials");
    }
});

//Verify User.
app.get("/verify", (req, res)=>{
    const {token} = req.query;
    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded)=>{
        if(err){
          res.status(401).send("Invalid Token");
        }else{
          res.status(200).send("user verified successfully");
        }
      });
});
//get all user data:
app.get("/get/all", async(req, res)=>{
    const token = req.headers.token;
    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, decoded)=>{
        if(err){
            res.status(401).send("Invalid Token");
        }else{
            const data = await ClassUsers.findOne({email:decoded.email}).populate('subjects');
            res.send({data:data});
        }
    })
})
// Add new Subject.
app.post("/subject/new", async(req, res)=>{
    try{
        const {subject, Teacher,PercentageRequired, email} = req.body.params;
        const newSub  = new Subjects({subName:subject, teacherName:Teacher, PercentageRequires:PercentageRequired,present:0, absent: 0});
        await newSub.save();
        const user = await ClassUsers.findOne({email: email});
        user.subjects.push(newSub);
        await user.save();
        res.send("Added Successfully");
    }
    catch(err){
         res.status(404).send("Unkonwn Error Occured");
    }
   
});
//Mark attandance
app.post("/subject/mark", async(req, res)=>{
   try{
      const {email, subjectId, value} = req.body.params;
      const status = Number(value);
      if(status == 1){
          await Subjects.findByIdAndUpdate(subjectId, {$inc: {present:1}});
      }else{
          await Subjects.findByIdAndUpdate(subjectId, {$inc: {absent:1}});
      }
   }catch{
        res.status(401).send("Error Updating Data");
   }
});
// Edit Subject data.
app.post("/subject/edit", async(req, res)=>{
    try{
       const {_id,subjectName,teacherName,percentageReq,presentCnt,absentCnt} = req.body.params;
     const subject = await Subjects.findByIdAndUpdate(_id, {subName:subjectName,teacherName:teacherName,PercentageRequires: percentageReq,present:presentCnt,absent:absentCnt});
   }catch(e){
    res.status(401).send("Error Occured while updating");
   }
});
app.delete("/subject/delete", async(req, res)=>{
    const {id, email} = req.query;
    try{
       const user = await ClassUsers.findOne({email:email});
       if(!user){
        res.status(401).send("Error Occured");
       }
       await ClassUsers.findOneAndUpdate({email},{$pull:{subjects:id}}, {new:true});
       await Subjects.findByIdAndDelete(id);
    }catch(e){
        res.status(401).send("Error Occured");
    }
})
app.listen(PORT)