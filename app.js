const express = require('express');
const app = express();
require("dotenv").config();
const key =process.env.SECRET_KEY
const PORT= process.env.PORT
const bcrypt = require("bcrypt")
const db= require("./config/config")
const bodyParser = require('body-parser');
const userModel = require('./models/user');
const taskModel= require("./models/tasks")
app.set('view engine', 'ejs');
const jwt= require("jsonwebtoken");
const cookieParser = require('cookie-parser');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieParser())


const  auth =(req,res,next)=>
{
    const tokenFromCookie= req.cookies.token
    try{
        const verification =jwt.verify(tokenFromCookie,key)
        next()
    }catch(err){
        if(!tokenFromCookie)
          {
            res.redirect("/")
          }
        else if (err.name === 'TokenExpiredError' || !tokenFromCookie) {
                res.redirect("/")
            }
        else {
            res.status(401).send("malformed token")
        }
    }

}


app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/signup', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const fname= req.body.fname
    const lname=req.body.lname

    if(!(fname && lname && email && password))
    {
        res.status(400).send("all field are required")
    }
    const exist = await userModel.findOne({Email:email})
    if(exist){
        res.status(401).send("user already exist")
    }
    else{
        const encryptPass= await bcrypt.hash(password,10)
        const user=await userModel.create({
            Fname:fname,
            Lname:lname,
            Email: email,
            Password:encryptPass
        });
       
        const id=user._id

        await taskModel.create({
            userid:id,
            task:[]
        });

        res.redirect('/');
    }
    
});


const checkLoginState = (req, res, next) => {
    const token = req.cookies.token;
    let loggedIn = false;
    if (token) {
        try {
            jwt.verify(token, key);
            loggedIn = true;
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                res.redirect("/logout")
                } 
            else {
                res.status(401).send("malformed token")
            }
        }
    }
    res.locals.loggedIn = loggedIn; // Set the loggedIn state in res.locals
    next(); 
};

app.get('/',checkLoginState,async(req, res) => {
    
    const tokenFromCookie = req.cookies.token;
    if(tokenFromCookie)
    {  
        const verification = jwt.verify(tokenFromCookie,key)
        const id = verification.id;
        const user = await userModel.findOne({ _id: id})
        const taskuser = await taskModel.findOne({ userid: id})
        const dec_sort=[]
        const task_array=taskuser.task
        const len= task_array.length
        for (let i=len-1;i>=0;i--) 
        {
            dec_sort.push(task_array[i])
        }
       if(taskuser){
        res.render('index',{oldToNew_array:task_array,newToOld_array:dec_sort,isEncrypted:taskuser.isEncrypted,username:user.Fname});
       }else{
        res.render('index',{task_array:[]});
       }
    }
    else{
        res.render('index',{task_array:[]});
    }
    
});


app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if(!(email && password))
    {
        res.status(401).send("please provide all information")
    }
    const user = await userModel.findOne({Email:email });
    if(!user)
    {
        res.status(401).send("user not present")
    }
    else if((user)&& bcrypt.compare(password,user.Password) )
    {
        const token = await jwt.sign(
            {id:user._id},
             key,   
            {
               expiresIn:("24h")
            }
        );
        const options={
            expires:new Date(Date.now()+24*60*60*1000),
            httpOnly:true
        };

        res.status(200).cookie("token",token,options)
        res.redirect("/")
    }else{
        res.status(401).send("Password incorrect")
    }
    
});

app.get('/logout', (req, res) => {
    const token=req.cookies.token
    res.cookie('token', token, { expires: new Date(0), httpOnly: true });
    res.redirect("/")

});
app.get("/ADDtask",auth,async(req,res)=>
{
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; 
    const day = now.getDate();
    const date = `${day}-${month}-${year}`;
    
    try{
        const tokenFromCookie = req.cookies.token;
        const verification = jwt.verify(tokenFromCookie, key);
        const id = verification.id;
        const taskuser = await taskModel.findOne({
            $and: [{ userid: id }, { 'task.date': date }]
        });

            res.render("addtask")

    }catch(err){
        res.status(400)
    }
    

})
app.post('/ADDtask',auth, async (req, res) => {
    const data = req.body.data;
    const tname = req.body.taskname;
    const now = new Date();
    const date = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    const tokenFromCookie = req.cookies.token;
    const verification = jwt.verify(tokenFromCookie, key);
    const id = verification.id;
    const isEncrypted= req.body.enc
    if(isEncrypted){
       const task = await taskModel.updateOne(
            { userid: id},
            {
                $push: {
                    task: { date: date, data: data, taskname: tname,isEncrypted:true}
                }
            }
        );
        console.log(task)
    }
    
    else if(isEncrypted==undefined){
        await taskModel.updateOne(
            { userid: id },
            {
                $push: {
                    task: { date: date, data: data, taskname: tname }
                }
            }
        );
    }
    else
    {
        res.status(401).send("please enter pass word !!")
    }
    
    res.redirect("/");
});

app.get("/viewtask/:id",auth,async(req,res)=>
{
    const tokenFromCookie = req.cookies.token;
       if(tokenFromCookie)
       {
        const verification = jwt.verify(tokenFromCookie, key);
        const id = verification.id;
        const taskid= req.params.id
        const user = await taskModel.findOne(
            { userid:id, 'task._id': taskid },  // Match the user and the specific khata element
            { 'task.$': 1 }  // Retrieve only the matching khata element
        );      
         console.log(user)
             res.render("viewtask",{date:user.task[0].date,title:user.task[0].taskname,data:user.task[0].data,isEncrypted:user.task[0].isEncrypted,id:user.task[0]._id})
        }
})
app.post("/viewtask/:id",auth,async(req,res)=>
{
    const tokenFromCookie = req.cookies.token;
       if(tokenFromCookie)
       {
        const verification = jwt.verify(tokenFromCookie, key);
        const id = verification.id;
        const taskid= req.params.id
        const pass= req.body.pass
        const user= await userModel.findOne({_id:id})
        const isvalid= bcrypt.compare(pass,user.Password)
        if(isvalid)
        {
            res.redirect(`/viewtask/${taskid}`)
        }
        else{
            res.status(401).send("incorrect password....try again to view khata")
        }
        }
})
app.get("/edittask/:id",auth,async(req,res)=>
{
    const tokenFromCookie = req.cookies.token;
       if(tokenFromCookie)
       {
        const verification = jwt.verify(tokenFromCookie, key);
        const id = verification.id;
        const taskid= req.params.id
        const user = await taskModel.findOne(
            { userid:id, 'task._id': taskid },  // Match the user and the specific khata element
            { 'task.$': 1 }  // Retrieve only the matching khata element
        );
        res.render("edit",{data:user.task[0].data,date:user.task[0].date,title:user.task[0].taskname,isEncrypted:user.task[0].isEncrypted,id:user.task[0]._id})
       } 
})
app.get("/deletetask/:id",auth,async(req,res)=>
    {   
       const tokenFromCookie = req.cookies.token;
       if(tokenFromCookie)
       {
        const verification = jwt.verify(tokenFromCookie, key);
        const id = verification.id;
        const taskid = req.params.id
        await taskModel.updateOne(
         { userid: id },
         {
             $pull: {
                 task: {_id:taskid}
             }
         }
       );

       }
    res.redirect("/")
})

app.post("/updatetask/:id",auth,async(req,res)=>
    {
       const tokenFromCookie = req.cookies.token;
       if(tokenFromCookie)
       {
        const verification = jwt.verify(tokenFromCookie, key);
        const id = verification.id;
        const taskid= req.params.id
        const data= req.body.data
        const title = req.body.title
        const isEncrypted=req.body.enc
        let val=false

        if(isEncrypted)
        {
            val=true
        }
        else{
            val=false
        }
       

        await taskModel.updateOne(
            {userid:id,'task._id':taskid},

            {
                $set: {
                    "task.$.data": data,
                    "task.$.taskname": title, 
                    "task.$.isEncrypted": val
                }
            },
            {new:true}
        )

       }
    res.redirect("/")
})


app.listen(PORT)