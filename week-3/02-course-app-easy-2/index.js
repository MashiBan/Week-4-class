const express = require('express');
const app = express();
// const jwt = require('JsonWebToken');

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

// Admin routes
const secretKey = "YeahThisSucks"
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body
  const existingAdmin = ADMINS.find(a => a.username === username&& a.password === password)
  if(existingAdmin){
    res.status(403).json({message: "Admin already exists"})
  }else{
    ADMINS.push(admin)
    const token = jwt.generateJwt(admin)
    res.status(200).json({message:"Admin created successfully" , token: token})
  } 
});

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization
  if(token){
    jwt.verify(token , secretKey , (err , decoded) =>{
      if(err){
        return res.sendStatus(404); //(forbidden because authentication failed)
      }
      res.user = decoded
      next()
    })
  }else{
    res.sendStatus(401) // unauthorized user
  }
}

const generateJwt = (user) => {
  const payload = {username:user.username}
  return JWT.sign(payload , secretKey , {expiresIn:'1h'})
}


app.post('/admin/login', (req, res) => {
  // logic to log in admin
  const {username, password} = req.headers
  const admin = ADMINS.find(a => a.username === username && a.password === password)
  if(admin){
   const token = generateJwt(admin)
   res.json({message : "Logged in successfully" , token:token})
  }else{
    res.status(403).json({message:"Admin authentication failed"})
  }
});

app.post('/admin/courses', authenticateJWT,(req, res) => {
  // logic to create a course
  const course = req.body
  course.id = COURSES.length + 1
  COURSES.push(course)
  res.json({message :"Course created successfully" , courseId: course.id})
});

app.put('/admin/courses/:courseId', authenticateJWT,(req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId)
  const courseIndex = COURSES.findIndex(c => c.id === courseId)

  if(courseIndex > -1){
    const updatedCourse = { ...COURSES[courseIndex] , ...req.body}
    COURSES[courseIndex] = updatedCourse;
    res.json({message:"Course updated successfully"})
  }else{
    res.json({message:" Course not found"})
  }
});

app.get('/admin/courses', authenticateJWT,(req, res) => {
  // logic to get all courses
  res.json({courses : COURSES})
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user = req.body
  const existinguser = USERS.find(u => u.username === username)
  if(existinguser){
    res.json({message: "user exists"})
  }else{
    USERS.push(user)
    const token = generateJwt(user)
    res.json({message: "User Created" , token})
  }
});

app.post('/users/login',authenticateJWT, (req, res) => {
  // logic to log in user
  const {username ,password} = req.headers
  const existingUser = USERS.find(u => u.username === username , u.password === password)
  if(existingUser){
    const token = generateJwt(existingUser)
    res.json({message:"Logged in successfully" ,token : token})
  }else{
    res.json({message: "Message does not exists"})
  }
});

app.get('/users/courses',authenticateJWT, (req, res) => {
  // logic to list all courses
  res.json({course : COURSES})
});

app.post('/users/courses/:courseId', authenticateJWT ,(req, res) => {
  // logic to purchase a course
  const courseId = parseInt(req.params.courseId) /** req.params is an object that contains the parameters extracted from the URL path of an HTTP request. courseId refers to a specific parameter name, which is typically defined in the route path, such as /courses/:courseId. req.params.courseId retrieves the value of the courseId parameter from req.params. */
  const course = COURSES.findIndex(c => c.id === courseId)
  if(course){
    const user = USERS.find(u => u.username  === req.user.username)
    if(user){
      if(!user.purchasedCourses){
        user.purchasedCourses = []
      }else{
        user.purchasedCourses.push(course)
        res.json({message:"Course purchased successfully"})
      }
    }else{
      res.json({message:"User does not exixts"})
    }
  }else{
    res.json({message:"Course not found"})
  }
});

app.get('/users/purchasedCourses', authenticateJWT ,(req, res) => {
  // logic to view purchased courses
   const user = USERS.find(u => u.username === req.user.username )
    if(user && user.purchasedCourses){
      res.json({purchasedCourses : user.purchasedCourses})
    }else{
      res.status(403).json({message : "No Courses purchased"})
    }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
