import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/home/Home.jsx';
import Login from './pages/login/Login.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRouter from './components/protectedRouter/ProtectedRouter.jsx';
import Profile from './pages/profile/Profile.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <BrowserRouter>
      <AuthProvider>
        <Routes>

        <Route element={<ProtectedRouter />}>
          <Route path='/' element={<App />} >
            <Route index element={<Home />} />
            <Route path='/profile/:id' element={<Profile />} />
            <Route path='/profile' element={<Profile />} />
          </Route>
        </Route>


          <Route path='/login' element={<Login />} />


        </Routes>


      </AuthProvider>
    </BrowserRouter>

  </StrictMode>,
)
