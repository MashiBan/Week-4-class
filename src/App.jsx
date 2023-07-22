import  { useState } from 'react'
import React from 'react';
import './App.css'

// var todos = [{
//   title:"go to gym",
//   description: "go to gum at 11",
//   id: 1
// },{
//   title:"go eat food",
//   description: "cook food for 2",
//   id: 2
// }]


// let todos = {
//   title:"go to gym",
//   description: "go to gum at 11",
//   id: 1
// }


// setInterval(() => { 
//   todoss.title = "asdads" // this is changing todoss.title after 1 sec but we can't see in browser because we cannot define a state variable like this in react for this to produce seeable change we use 'useState' 
// } ,1000)




// ** Making Custom Hooks 
const  useTodos = () => {
  
  const [todos ,setTodos] =React.useState( [])

  React.useEffect(() => {
    fetch("http://localhost:3000/todos",{
      method:'GET'
    }).then( (response) => {
        response.json().then((data) => {
          console.log(data);
          setTodos(data)
        })
    })

    
  //To make it more real time changing
  setInterval(() => {
    fetch("http://localhost:3000/todos", {
      method:"GET"
    }).then((response) => {
      response.json().then((data) => {
        setTodos(data);
      })
    })
  },1000)

  },[]);


  
  return todos;
}


function App(){

   

//   const [todos, setTodos] = React.useState([{
//     title:"go to gym",
//     description:"leg-day",
//     id: 1
//   },{
//     title:"go to park",
//     description:"meet tom",
//     id: 1
//   },{
//     title:"go to park",
//     description:"meet tom",
//     id: 1
//   } 
// ]);

  // setInterval(() => {
  //   settodos({
  //   title:"eat food",
  //   description:" bring veggis to cook food",
  //   id: 2
  //   })
  // } , 4000);

  const todos =useTodos()
  return (
    <div>
      {todos.map(todo => {
        return <div>
        {todo.title},
        {todo.description},
        {todo.id},
        <button>Delete</button>
        <br/>
        </div>
      })}
    </div>
  )
}


function Todo(props){
  return <div style={{backgroundColor: "grey" , padding:"15px", borderRadius:"5px" , margin:"4px"}}>
    {props.title}
    {props.description}
  </div>
}


// function PersonName(props ) {
//   return <div>
//   {props.fName}{props.lName}
//   </div>
// }

 
export default App;