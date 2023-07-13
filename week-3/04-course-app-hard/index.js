const express = require('express');
const app = express();
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

app.use(express.json());

const SECRET = 'ohPenny'
let ADMINS = [];
let USERS = [];
let COURSES = [];

const userSchema = new mongoose.Schema({
  username: {type : String},
  password : String,
  purchasedCourses : [{type : mongoose.Schema.Types.ObjectId, ref:'Course'}]
})

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
})

const courseSchema = new mongoose.Schema({
  title: String,
  description : String,
  price: Number,
  imageLink : String,
  published: Boolean
})

//making mongoose models
const User = mongoose.model('User', userSchema)
const Admin = mongoose.model('Admin', adminSchema)
const Course = mongoose.model('Course', courseSchema)

const authenticateJwt = (res ,req ,next) =>{
  const authHeader = req.header.autherization
  if(authHeader){
    const token = authHeader.split(" ")[1]
    jwt.verify(token , SECRET , (err ,user) => {
      if(err){
        return res.sendStatus(403)
      }
      req.user = user
      next()
    })
  }else{
    res.sendStatus(401)
  }
}


//for connecting to MongoDB

mongoose.connect('mongodb+srv://kb00664422:fYPlbAbSHcQPKz8x@cluster0.qsvtsoz.mongodb.net/courses', { useNewUrlParser: true , useUnifiedTopology: true , dbName:"course"})

// Admin routes
app.post('/admin/signup', async (req, res) => {
  // logic to sign up admin
  const admin = req.body
  const existingAdmin = await Admin.findOne({username})
  if(admin){
    res.status(403).json({message:"Admin already exists"})
  }else{
    admin.save()
    const token = jwt.sign({username , role:'admin'} , SECRET , {expiresIn : "1h"})
    res.json({message:'Admin created successfully' , token})
  }


});

app.post('/admin/login',async (req, res) => {
  // logic to log in admin
  const {username ,password} = req.headers
  const admin = await Admin.findOne({username , password })
  if(admin){
    const token = jwt.sign({username, role:'admin'} , SECRET , {expiresIn: '1h'})
    res.json({message: 'Logged In' , token})
  }else{
    res.status(403).json({message : "Invalid username or password"})
  }
});

app.post('/admin/courses', authenticateJwt , async (req, res) => {
  // logic to create a course
  const course = new Course(req.body)
  await course.save()
  res.json({ message: 'Course created successfully', courseId: course.id });

});

app.put('/admin/courses/:courseId', authenticateJwt ,async (req, res) => {
  // logic to edit a course
  const course = await Course.findByIdAndUpdate(req.params.courseId , req.body , {new : true})
  if(course){
    res.json({ message: 'Course updated successfully' });
  }else{
    res.status(403).json({ message: 'Course not found' });
  }
});

app.get('/admin/courses', authenticateJwt , async (req, res) => {
  // logic to get all courses
  const courses = await Course.find({})
  res.json({ courses});
});

// User routes
app.post('/users/signup', async (req, res) => {
  // logic to sign up user
  const user = req.body
  const existingUser = await findOne({username})
  if(existingUser){
    res.status(403).json({ message: 'User already exists' });
  }else{
    await user.save()
    const token = jwt.sign({username} , SECRET , {expiresIn : '1h'})
    res.json({ message: 'User created' , token});
  }
});

app.post('/users/login', async (req, res) => {
  // logic to log in user
  const {username , password} = req.headers
  const user  = await User.findOne({username , password})
  if(user){
    const token = jwt.sign({username, role:'admin'} , SECRET , {expiresIn : '1h'})
    res.json({ message: 'Logged in successfully' , token});
  }else{
    res.status(403).json({ message: 'Invalid username and password' });
  }
});

app.get('/users/courses', authenticateJwt ,async (req, res) => {
  // logic to list all courses
  const course = await Course.findOne({ published : true})
  res.json({course})
});

app.post('/users/courses/:courseId',authenticateJwt ,async (req, res) => {
  // logic to purchase a course
  const course = await Course.findById(req.params.courseId)
  if(course){
    const user = await Course.findOne({username :req.user.username})
    if(user){
      if(!user.purchasedCourses){
        user.purchasedCourses = []
      }else{
        user.purchasedCourses.push(course)
        await user.save()
        res.json({ message: 'Course purchased successfully' });
      }
    }else{
      res.status(403).json({ message: 'User not found' });
    }
  }else{
    res.status(403).json({ message: 'Course not found' });
  }
});

app.get('/users/purchasedCourses', authenticateJwt, async (req, res) => {
  // logic to view purchased courses
  const user = await User.findOne({ username: req.user.username}).populate('purchasedCourse')
  if(user){
    res.json({ purchasedCourses : user.purchasedCourses || []})
  }else{
    res.status(403).json({ message : "User not found"})
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
