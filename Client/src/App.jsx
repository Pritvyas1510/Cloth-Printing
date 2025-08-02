import { Routes, Route } from "react-router-dom";
import React from "react";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Design from "./pages/Design/Design";
import Contact from "./pages/Contact/Contact";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Notfound from "./Routes/Notfound/Notfound";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import { ToastContainer } from 'react-toastify';
import Adminhome from "./Admin/Pages/Adminhome";
import AddProduct from "./Admin/Product/AddProduct";
import ManageProduct from "./Admin/Product/ManageProduct";
import ViewProduct from "./Admin/Product/ViewProduct";
import EditProduct from "./Admin/Product/EditProduct";
import AllProduct from "./Admin/Product/AllProduct";
import ProductDetails from "./pages/Design/Product/ProductDetails";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <main className="flex-1">
        <Routes>
          {/* GUest Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Client Routes */}
          <Route path="/design" element={<Design />} />
          <Route path="/productdetails/:id" element={<ProductDetails/>}/>
          <Route path="/contact" element={<Contact />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<Adminhome/>}/>
          <Route path="/addproduct" element={<AddProduct/>}/>
          <Route path="/manageproduct" element={<ManageProduct/>}/>
          <Route path="/viewproduct/:id" element={<ViewProduct/>}/>
          <Route path="/editproduct/:id" element={<EditProduct/>}/>
          <Route path="/allproduct" element={<AllProduct/>}/>
          {/* Auth Routes */}
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>


          {/* Not Found */}

          <Route path="*" element={<Notfound/>}/>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
