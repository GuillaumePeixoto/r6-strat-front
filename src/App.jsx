import { Route, Routes } from "react-router-dom";
import './App.css'
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/LoginPage';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import StrategiesList from './pages/StrategiesList';
import RegisterPage from "./pages/RegisterPage";
import AddingStrategyPage from "./pages/AddingStrategyPage";
import DetailsStrategyPage from "./pages/DetailsStrategyPage";
import Profil from "./pages/ProfilPage";


function App() {


  return (
    <>
      <NavBar />
      <div className="min-screen-height second-bg-color">
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<RegisterPage></RegisterPage>} />
          <Route path="/map/:slug" element={<ProtectedRoute><StrategiesList /></ProtectedRoute>}></Route>
          <Route path="/strategies/:id" element={<ProtectedRoute><DetailsStrategyPage /></ProtectedRoute>} />
          <Route path="/map/:slug/add" element={<ProtectedRoute> <AddingStrategyPage /> </ProtectedRoute>}></Route> 
          <Route path="/map/:slug/add/:id" element={<ProtectedRoute> <AddingStrategyPage /> </ProtectedRoute>}></Route>
          <Route path="/profile" element={<ProtectedRoute> <Profil /> </ProtectedRoute>}></Route> 
          <Route path="*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
        </Routes>
      </div>
      <Footer></Footer>
    </>
  )
}

export default App
