import React from "react";

const EmployeeTable = ({ employees, onEdit, onDelete }) => (
  <table className="table table-bordered">
    <thead>
      <tr>
        <th>Họ tên</th>
        <th>Email</th>
        <th>Điện thoại</th>
        <th>Vai trò</th>
        <th>Nơi làm việc</th>
        <th>Chức vụ</th>
        <th>Địa chỉ</th>
        <th>Trạng thái</th>
        <th>Hành động</th>
      </tr>
    </thead>
    <tbody>
      {employees.map((emp) => (
        <tr key={emp.id}>
          <td>{emp.full_name}</td>
          <td>{emp.email}</td>
          <td>{emp.phone}</td>
          <td>{emp.role == "admin" ? "Admin" : "Nhân viên"}</td>
          <td>{emp.department}</td>
          <td>{emp.position}</td>
          <td>{emp.address}</td>
          <td>{emp.status == "active" ? "Hoạt động" : "Không hoạt động"}</td>
          <td>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => onEdit(emp)}
            >
              Sửa
            </button>
            <button
              className="btn btn-sm btn-danger ms-2"
              onClick={() => onDelete(emp)}
            >
              Xoá
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default EmployeeTable;
