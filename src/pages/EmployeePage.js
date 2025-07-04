import React, { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employeeApi";
import EmployeeTable from "../components/EmployeeTable";
import { Modal, Button } from "react-bootstrap";
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [token] = useState(localStorage.getItem("token"));
  const [message, setMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    address: "",
    role: "staff",
    status: "active",
    password: "",
    role_id: 2,
    avatar: null,
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [filter, setFilter] = useState({
    department: "",
    role: "",
    full_name: "",
  });

  const fetchData = async () => {
    try {
      const res = await getEmployees(token);
      let filtered = res.data.data;

      if (filter.full_name) {
        filtered = filtered.filter((emp) =>
          emp.full_name.toLowerCase().includes(filter.full_name.toLowerCase())
        );
      }

      if (filter.department) {
        filtered = filtered.filter(
          (emp) => emp.department === filter.department
        );
      }

      if (filter.role) {
        filtered = filtered.filter((emp) => emp.role === filter.role);
      }

      setEmployees(filtered);
    } catch (err) {
      showErrorToast("Nhân viên","Lỗi khi lấy danh sách nhân viên");
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (let key in form) {
        if (form[key] !== "" && form[key] !== null) {
          formData.append(key, form[key]);
        }
      }

      if (editingId) {
        await updateEmployee(token, editingId, formData);
        showSuccessToast("Nhân viên","Cập nhật nhân viên thành công");
      } else {
        await createEmployee(token, formData);
        showSuccessToast("Nhân viên","Thêm nhân viên thành công");
      }

      setMessageType("success");
      // setTimeout(() => setMessage(""), 3000);

      setForm({
        full_name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        address: "",
        role: "staff",
        status: "active",
        password: "",
        role_id: 2,
        avatar: null,
      });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      showErrorToast("Nhân viên","Kiểm tra lại email , thông tin nhân viên !");
      setMessageType("error");
      // setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      full_name: emp.full_name || "",
      email: emp.email || "",
      phone: emp.phone || "",
      position: emp.position || "",
      department: emp.department || "",
      address: emp.address || "",
      role: emp.role || "staff",
      status: emp.status || "active",
      password: "",
      role_id: emp.role === "admin" ? 1 : 2,
      avatar: null, // không set ảnh cũ
    });
    setShowForm(true);
  };

  const openDeleteModal = (emp) => {
    if (emp.role === "admin") {
      showErrorToast("Nhân viên","Không thể xoá tài khoản admin");
      setMessageType("error");
      // setTimeout(() => setMessage(""), 3000);
      return;
    }
    setSelectedDeleteId(emp.id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedDeleteId(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployee(token, selectedDeleteId);
      showSuccessToast("Nhân viên","Xóa nhân viên thành công");
      setMessageType("success");
      fetchData();
    } catch (err) {
      showErrorToast("Nhân viên","Lỗi khi xóa nhân viên");
      setMessageType("error");
    } finally {
      closeDeleteModal();
      // setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      full_name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      address: "",
      role: "staff",
      status: "active",
      password: "",
      role_id: 2,
      avatar: null,
    });
    setShowForm(false);
  };

  const handleShowAddForm = () => {
    handleCancel();
    setShowForm(true);
  };

  return (
    <>
      <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
        <h3>Quản lý nhân viên</h3>

        {/* {message && (
          <div
            className={`alert ${
              messageType === "success" ? "alert-success" : "alert-danger"
            }`}
          >
            {message}
          </div>
        )} */}

        <div className="mb-3">
          <div className="row align-items-center">
            <div className="col-md-4 col-sm-12 mb-2 mb-md-0">
              <button
                className="btn btn-primary w-100"
                onClick={handleShowAddForm}
              >
                Thêm nhân viên
              </button>
            </div>

            <div className="col-md-8 col-sm-12">
              <div className="row g-2">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm theo tên"
                    value={filter.full_name}
                    onChange={(e) =>
                      setFilter({ ...filter, full_name: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filter.department}
                    onChange={(e) =>
                      setFilter({ ...filter, department: e.target.value })
                    }
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {[
                      ...new Set(
                        employees.map((e) => e.department).filter(Boolean)
                      ),
                    ].map((d, i) => (
                      <option key={i} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filter.role}
                    onChange={(e) =>
                      setFilter({ ...filter, role: e.target.value })
                    }
                  >
                    <option value="">-- Chọn chức vụ --</option>
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <>
            <div className="overlay123" onClick={handleCancel}></div>
            <div className="modal-form123 animate-slide-down-fade-in">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label>Họ và tên</label>
                    <input
                      className="form-control"
                      name="full_name"
                      value={form.full_name}
                      onChange={(e) =>
                        setForm({ ...form, full_name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="Không được trùng email !"
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Điện thoại</label>
                    <input
                      className="form-control"
                      name="phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Ảnh đại diện</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) =>
                        setForm({ ...form, avatar: e.target.files[0] })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Vị trí</label>
                    <input
                      className="form-control"
                      name="position"
                      value={form.position}
                      onChange={(e) =>
                        setForm({ ...form, position: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Phòng ban</label>
                    <input
                      className="form-control"
                      name="department"
                      value={form.department}
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Địa chỉ</label>
                    <input
                      className="form-control"
                      name="address"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Chức vụ</label>
                    <select
                      className="form-select"
                      name="role"
                      value={form.role}
                      onChange={(e) => {
                        const selectedRole = e.target.value;
                        setForm({
                          ...form,
                          role: selectedRole,
                          role_id: selectedRole === "admin" ? 1 : 2,
                        });
                      }}
                    >
                      <option value="">--Chọn chức vụ--</option>
                      <option value="staff">Nhân viên</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label>Trạng thái</label>
                    <select
                      className="form-select"
                      name="status"
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label>
                      Mật khẩu {editingId ? "(bỏ trống nếu không đổi)" : ""}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required={!editingId}
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button type="submit" className="btn btn-success">
                      {editingId ? "Cập nhật" : "Thêm"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}

        <EmployeeTable
          employees={employees}
          onEdit={handleEdit}
          onDelete={openDeleteModal}
        />
      </div>

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xoá nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xoá nhân viên này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Huỷ
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Xác nhận xoá
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmployeePage;
