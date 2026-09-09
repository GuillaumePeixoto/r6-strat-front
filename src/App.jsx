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

function App() {


  return (
    <>
      <NavBar />
      <div className="min-screen-height">
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<RegisterPage></RegisterPage>} />
          <Route path="/map/:slugMap" element={<ProtectedRoute><StrategiesList /></ProtectedRoute>}></Route>
          {/* <Route path="/strategies/:gameId" element={<ProtectedRoute><DetailStrategyPage /></ProtectedRoute>}></Route>
          <Route path="/strategies/update/:strategyId" element={<ProtectedRoute><AddingStrategyPage /></ProtectedRoute>}></Route>
          <Route path="/add-strategy" element={<ProtectedRoute><AddingStrategyPage /></ProtectedRoute>}></Route> */}
          <Route path="*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
        </Routes>
      </div>
      <Footer></Footer>
    </>
  )
}

export default App
