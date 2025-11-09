import { useContext, useState } from 'react'
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useRef } from 'react';
import { AuthContext } from './context/AuthContext';


function App() {

const {socket, user} = useContext(AuthContext)
            useEffect(() => {
            socket.current.emit('join', user.fullname)
        },[])
  



  return (
    <>

<Outlet />
    </>
  )
}

export default App
