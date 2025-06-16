import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from "./component/AdminLayout";
import AdminDashboard from "./Adminpage/AdminDashboard";
import User from './Adminpage/User';
import ScriptPage from './Adminpage/Script';
import AdminLogin from './Adminpage/AdminLogin';
import SharePage from './Adminpage/Share';
import ResetPassword from './Adminpage/ResetPassword';
// import Shares from "./pages/Shares";
// import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />}/>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="user" element={<User />} />
          <Route path="script" element={<ScriptPage />} />
          <Route path="share" element={<SharePage />} />
          <Route path="reset-password" element={<ResetPassword />} />
          
        </Route>
      </Routes>
      
    </Router>
  );
}

export default App;
