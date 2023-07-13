const { log } = require('console');
const express = require('express');
const app = express();
const fs = require('fs')
app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const SECRET = 'sheldon'

//to read from different files
try{
  ADMINS= JSON.parse(fs.readFileSync('admins.json' , 'utf-8'))
  USERS = JSON.parse(fs.readFileSync('users.json' , 'utf-8'))
  COURSES = JSON.parse(fs.readFileSync('courses.json'))
}catch{
  ADMINS = []
  USERS = []
  COURSES = []
}
console.log(ADMINS);


// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body
  const existingAdmin = ADMINS.find(a => a.username === username)
  console.log("admin signup");
  if(existingAdmin){
    res.status(404).json({message : "admin already exists"})
  }else{
    ADMINS.push(admin)
    fs.writeFileSync('admin.json' , JSON.stringify(ADMINS))
    const token = jwt.sign({username , role:'admin'} ,SECRET , {expiresIn : '1h'})
    res.json({message : 'Admin created successfully' , token})
  }
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  const {username , password} = req.headers
  const admin = ADMINS.find(a => a.username === username && a.password === password)
  if(admin){
    const token = jwt.sign({username, role:admin} , SECRET , {expiresIn : '1h'})
    res.json({message:"Logged In" , token})
  }else{
    res.status(403).json({message:"Invalid username or password"})
  }
});

const authenticateJwt = (req , res, next) => {
  const autheader = req.headers.autherization
  if(autheader){
    const token = autheader.split(' ')[1]
    jwt.verify( token, SECRET , (err ,user) => {
      if(err){
        return res.sendStatus(403)
      }
      req.user = user;
      next();
    })
  }else{
    res.sendStatus(401)
  }

}
app.post('/admin/courses', authenticateJwt ,(req, res) => {
  // logic to create a course
  const course = req.body
  course.id = COURSES.length + 1
  COURSES.push(course)
  fs.writeFileSync('courses.json' , JSON.stringify(COURSES))
  res.json({message : "courses created successfully" , courseId : course.id})
});

app.put('/admin/courses/:courseId', (req, res) => {
  // logic to edit a course
  const course = COURSES.find(c => c.id === parseInt(req.params.courseId))
  if(course){
    Object.assign(course , req.body)
    fs.writeFileSync('course.json' , JSON.stringify(COURSES))
    res.json({message : "Courses updated successfully "})
  }else{
    res.status(403).json({message : "Course not found "})
  }
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
  res.json({courses : COURSES})
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user = req.body
  const existingUser = USERS.find(u => u.username === username)
  if(existingUser){
    res.json({message : 'user already exists'})
  }else{
    USERS.push(user)
    fs.writeFileSync('user.json', JSON.stringify(USERS))
    const token = jwt.sign({username , role : 'admin'} , SECRET, {expiresIn : '1h'})
    res.json({message: "User created successfully" , token:token})
  }
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  const {username , password} = req.headers
  const user = USERS.find(u => u.username === username && u.password === password)
  if(user){
    const token = jwt.sign({username , role : 'admin'} , SECRET , {expiresIn : '1h'})
    res.json({message : "Logged In" , token})    
  }else{
    res.status(403).json({message: 'Invalid username or password'})
  }
});

app.get('/users/courses', authenticateJwt,(req, res) => {
  // logic to list all courses
  res.json({course : COURSES})
});

app.post('/users/courses/:courseId', authenticateJwt,(req, res) => {
  // logic to purchase a course
  const course = COURSES.find(c => c.id === parseInt(req.params.courseId))
  if(course){
    const user = USERS.find(u => u.username === req.user.username)
    if(user){
      if(!user.purchasedCourses){
        user.purchasedCourses = []
      }else{
        user.purchasedCourses.push(course)
        fs.writeFileSync('user.json' , JSON.stringify(USERS))
        res.json({message : "Course purchased successfully"})
      }
    }else{
      res.status(403).json({message : "User not found"})
    }
  }else{
    res.status(403).json({message : "Course not found"})
  }

});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
  const user = USERS.find(u => u.username === req.user.username)
  if(user){
    read.json({ purchasedCourses : user.purchasedCourses || []})
  }else{
    res.status(403).json({message : "User not found"})
  }

});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
