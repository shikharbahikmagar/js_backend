import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [jokes, setJokes] = useState([])

  useEffect(() => {
    axios.get('/api/jokes')
    .then((res) => {
      setJokes(res.data)
    })
  })


  return (
    <>
      <h1>SHKHAR BAHIK MAGAR</h1>
      <p>JOKES: {jokes.length}</p>

      {
        jokes.map((joke) => (
          <div key={joke.id}>
            <p>{joke.category}</p>
            <p>{joke.punchline}</p>
            <p>{joke.joke}</p> 
          </div>
        ))
      }
    </>
  )
}

export default App
