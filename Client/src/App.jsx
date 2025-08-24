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
import { ToastContainer } from "react-toastify";
import Adminhome from "./Admin/Pages/Adminhome";
import AddProduct from "./Admin/Product/AddProduct";
import ManageProduct from "./Admin/Product/ManageProduct";
import ViewProduct from "./Admin/Product/ViewProduct";
import EditProduct from "./Admin/Product/EditProduct";
import AllProduct from "./Admin/Product/AllProduct";
import ProductDetails from "./pages/Design/Product/ProductDetails";
import Profile from "./components/Profile";
import Cart from "./pages/Cart/Cart";
import Order from "./pages/Orders/Order";
import Myorder from "./pages/My-Order/Myorder";
import Manage from "./Admin/ManageUser/Manage";
import AllOrder from "./Admin/ManageUser/Order/AllOrder";
import OrderDesign from "./Admin/ManageUser/Order/OrderDesign";
import ShippedDetails from "./Admin/ManageUser/Order/ShippedDetails";
import DesignAdmin from "./Admin/ManageUser/Order/DesignAdmin";
import ShipppedOrder from "./Admin/ManageUser/Order/ShipppedOrder";
import Complate from "./Admin/ManageUser/Order/Complate";
import ComplatedOrder from "./pages/ComplatedOrder/ComplatedOrder";
import CancelOrder from "./Admin/ManageUser/Order/CancelOrder";
import ProtectedRoute from "./Routes/Protected/ProtectedRoute";

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
          <Route path="/productdetails/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/order/:id" element={<Order />} />
          <Route path="/myorder" element={<Myorder />} />
          <Route path="/complatedorder" element={<ComplatedOrder />} />
          {/* Admin Routes */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Adminhome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addproduct"
            element={
              <ProtectedRoute role="admin">
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manageproduct"
            element={
              <ProtectedRoute role="admin">
                <ManageProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewproduct/:id"
            element={
              <ProtectedRoute role="admin">
                <ViewProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editproduct/:id"
            element={
              <ProtectedRoute role="admin">
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/allproduct"
            element={
              <ProtectedRoute role="admin">
                <AllProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manageuser"
            element={
              <ProtectedRoute role="admin">
                <Manage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/allorder"
            element={
              <ProtectedRoute role="admin">
                <AllOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orderdesign/:id"
            element={
              <ProtectedRoute role="admin">
                <OrderDesign />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shippeddetails/:id"
            element={
              <ProtectedRoute role="admin">
                <ShippedDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/designadmin"
            element={
              <ProtectedRoute role="admin">
                <DesignAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shippedorder"
            element={
              <ProtectedRoute role="admin">
                <ShipppedOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/completed"
            element={
              <ProtectedRoute role="admin">
                <Complate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cancelorder"
            element={
              <ProtectedRoute role="admin">
                <CancelOrder />
              </ProtectedRoute>
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Profile Routes */}
          <Route path="/profile" element={<Profile />} />

          {/* Not Found */}

          <Route path="*" element={<Notfound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
