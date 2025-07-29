import React from "react";
import {
  DanhMucAdd,
  DanhSachSanPhamAdd,
  SuaSanPham,
  SuaDanhMuc,
  OrderDetail,
  CustomerDetail,
  AddSlide,
  EditSlide,
  AddFooter,
  EditFooter,
  ChatUser,
  PrivateRoute,
  Size,
  Color,
  SanphamDetail,
  AutoReplyManager,
  CollectionList
} from "./components";
import {
  Public,
  Home,
  DanhSachSanPham,
  DsDanhMuc,
  DanhSachKhachhang,
  CouponManagement,
  SlideList,
  FooterList,
  EmployeePage,
  Login,
  Unauthorized,
  OrderList,
  ReportPage,
  AdminProfile,
  ChamCongAdmin,
  DanhSachBaiViet,
  POSPage,
} from "./pages";
import "./App.css";
import path from "./ultis/path";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import { Routes, Route, usePaRams } from "react-router-dom";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from 'react-hot-toast';
function App() {
  const socket = io("http://localhost:3000");

  return (
    <div>
          <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path={path.PUBLIC}
          element={
            <PrivateRoute>
              <Public />
            </PrivateRoute>
          }
        >
          
          <Route
            path={path.HOME}
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/san-pham/danh-sach" element={<DanhSachSanPham />} />
          <Route
            path="/san-pham/them"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <DanhSachSanPhamAdd />
              </RoleRoute>
            }
          />
          <Route
            path="/san-pham/sua/:id"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <SuaSanPham />
              </RoleRoute>
            }
          />
          <Route path="/san-pham/details/:id" element={<SanphamDetail />} />
          <Route
            path="/san-pham/size"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Size />
              </RoleRoute>
            }
          />
          <Route
            path="/san-pham/mau-sac"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Color />
              </RoleRoute>
            }
          />
          <Route path="/danh-muc/danh-sach" element={<DsDanhMuc />} />
          <Route
            path="/danh-muc/them"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <DanhMucAdd />
              </RoleRoute>
            }
          />
          <Route
            path="/danh-muc/sua/:id"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <SuaDanhMuc />
              </RoleRoute>
            }
          />
          <Route
            path="/bo-sieu-tap/danh-sach"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <CollectionList />
              </RoleRoute>
            }
          />
          <Route path="/don-hang/danh-sach" element={<OrderList />} />
          <Route path="/don-hang/chi-tiet/:orderId" element={<OrderDetail />} />

          <Route path="/customers/details/:id" element={<CustomerDetail />} />
          <Route path="/khach-hang/danh-sach" element={<DanhSachKhachhang />} />

          <Route
            path="/khuyen-mai/danh-sach"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <CouponManagement />
              </RoleRoute>
            }
          />

          <Route
            path="/slide-banner/danh-sach"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <SlideList />
              </RoleRoute>
            }
          />
          <Route
            path="/slides/create"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AddSlide />
              </RoleRoute>
            }
          />
          <Route
            path="/slides/edit/:id"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <EditSlide />
              </RoleRoute>
            }
          />

          <Route
            path="/footer/danh-sach"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <FooterList />
              </RoleRoute>
            }
          />
          <Route
            path="/footers/create"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AddFooter />
              </RoleRoute>
            }
          />
          <Route
            path="/footers/edit/:id"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <EditFooter />
              </RoleRoute>
            }
          />

          <Route
            path="/message/danh-sach"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <ChatUser socket={socket} />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/danh-sach"
            element={
              <RoleRoute allowedRoles={["admin", "hr"]}>
                <EmployeePage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/cham-cong"
            element={
              <RoleRoute allowedRoles={["admin", "hr"]}>
                <ChamCongAdmin />
              </RoleRoute>
            }
          />
          <Route
            path="/tk-bc/them"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <ReportPage />
              </RoleRoute>
            }
          />
          <Route
            path="/ai/danh-sach"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AutoReplyManager />
              </RoleRoute>
            }
          />
           <Route
            path="/tintuc-blog/danh-sach"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <DanhSachBaiViet />
              </RoleRoute>
            }
          /><Route
          path="/trang-bao-tri"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <Unauthorized />
            </RoleRoute>
          }
          />
          <Route path="/ban-hang-off" element={<POSPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/trang-ca-nhan" element={<AdminProfile />} />
        </Route>
      </Routes>
    </div>
  );
}
export default App;
