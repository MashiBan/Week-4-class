const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req , res , next) => {
 const {username , password} = req.headers

 const admin = ADMINS.find(a => a.username === username && a.password === password)
 if(admin){
  next()
 }else{
  res.status(402).json({message:"Admin authenticaiton failed"})
 } 
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body
  const existingAdmin = ADMINS.find(a => a.username == admin.username)
  if(existingAdmin){
    res.status(403).json({message:"Admin already exists"})
  }else{
    ADMINS.push(admin)
    res.json({meaage:"new admin created"})
  }
});
app.get('/admin/list' , (req ,res) => {
  res.json({ADMINS})
})
app.post('/admin/login', adminAuthentication ,(req, res) => {
  // logic to log in admin
  res.status(200).json({message:"Logged in successfully"})
});

app.post('/admin/courses', adminAuthentication ,(req, res) => {
  // logic to create a course
  const course = req.body
  course.id = Date.now()
  COURSES.push(course)
  res.json({message:"Course added successfully"})

});

app.put('/admin/courses/:courseId', adminAuthentication ,(req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId)
  const course = COURSES.find(a => a.courseId === id)
  if(course){
    Object.assign(course , req.body)
    res.status(200).json({message: "Course edited successfully"})
  }else{
    res.status(400).json({message:"Unable to Edit"})
  }
});

app.get('/admin/courses',adminAuthentication,(req, res) => {
  // logic to get all courses
  res.json({course:COURSES})
});

// User routes


const userAuthentication = (req ,res ,next) => {
  const {username , password} = req.headers
  const user = USERS.find(u => u.username === username && u.password === password)
  if(user){
    next()
  }else{
    res.status(400).json({message : "User does not exists"})
  }
}
app.post('/users/signup', (req, res) => {
  // logic to sign up user
    const user = { ...req.body , purchasedCourse: []}
    USERS.push(user)
    res.json({message:"User created"})
  
});

app.post('/users/login',userAuthentication, (req, res) => {
  // logic to log in user
  res.json({message : "User exists"})
});

app.get('/users/courses',userAuthentication, (req, res) => {
  // logic to list all courses
  res.json({courses : COURSES.filter(c => c.published)})
});

app.post('/users/courses/:courseId',userAuthentication, (req, res) => {
  // logic to purchase a course
  const courseId = parseInt(req.params.courseId)
  const course = COURSES.find(c => c.courseId === courseId && c.published)
  if(course){
    req.user.purchasedCourse.push(courseId)
    res.status(200).json({message : "course purchased successfully"})
  }else{
    res.status(400).json({message : "course was not found"})
  }

});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
  res.json({courses : COURSES.filter(c => req.user.purchasedCourse.includes(c.id))})
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
