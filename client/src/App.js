import "./App.css";
import Home from "../src/Components/Home/home";
import Detail from "./Components/DetailPost/Detail";
import { Route, Routes } from "react-router-dom";
import MainLogin from "./Components/Home/Head/Login/main";
import MainSignup from "./Components/Home/Head/Signup/main";
import MainForgot from "./Components/Home/Head/Forgot/main";
import CreatePost from "./Components/Home/Head/CreatePost/main";
import Report from "./Components/Home/Head/Report/main";

import Admin from "./Components/Admin/admin";
import User from "./Components/User/user";
import DetailPostUser from "./Components/User/user_post/detailPost";
import DetailPostAdmin from "./Components/Admin/admin_post/detailPost";
import Footer from "./Components/Home/Footer/footer";
import Recruitment from "./Components/Home/Footer/recruitment";
import Introduce from "./Components/Home/Footer/introduce";
import PriceList from "./Components/Home/Footer/priceList";
import ChangePassWord from "./Components/Home/Head/ChangePass/main";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/detail" element={<DetailPostUser />} />
      </Routes>
      <Routes>
        <Route path="/changepassword" element={<ChangePassWord />} />
      </Routes>
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Routes>
        <Route path="/user" element={<User />} />
      </Routes>
      <Routes>
        <Route path="/admin/info" element={<Admin />} />
      </Routes>
      <Routes>
        <Route path="/admin/user" element={<Admin />} />
      </Routes>
      <Routes>
        <Route path="/admin/post" element={<Admin />} />
      </Routes>
      <Routes>
        <Route path="/admin/payment" element={<Admin />} />
      </Routes>
      <Routes>
        <Route path="/admin/report" element={<Admin />} />
      </Routes>
      <Routes>
        <Route path="/user/info" element={<User />} />
      </Routes>
      <Routes>
        <Route path="/user/user" element={<User />} />
      </Routes>
      <Routes>
        <Route path="/user/post" element={<User />} />
      </Routes>
      <Routes>
        <Route path="/user/notification" element={<User />} />
      </Routes>
      <Routes>
        <Route path="/user/payment" element={<User />} />
      </Routes>
      <Routes>
        <Route path="/detail/:id" element={<Detail />} />
      </Routes>
      <Routes>
        <Route path="/detail/admin/:id" element={<DetailPostAdmin />} />
      </Routes>
      <Routes>
        <Route path="/createpost" element={<CreatePost />} />
      </Routes>

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Routes>
        <Route path="/login" element={<MainLogin />} />
      </Routes>
      <Routes>
        <Route path="/report" element={<Report />} />
      </Routes>
      <Routes>
        <Route path="/signup" element={<MainSignup />} />
      </Routes>
      <Routes>
        <Route path="/forgot" element={<MainForgot />} />
      </Routes>
      <Routes>
        <Route path="/recruitment" element={<Recruitment />} />
      </Routes>
      <Routes>
        <Route path="/introduce" element={<Introduce />} />
      </Routes>
      <Routes>
        <Route path="/priceList" element={<PriceList />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
