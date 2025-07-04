import React from "react";
import {
  Button,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

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
                     <OverlayTrigger overlay={<Tooltip>Sửa</Tooltip>}>
              <Button
                 style={{marginRight:2}}
                          size="sm"
                          variant="outline-primary"
                          onClick={() => onEdit(emp)}
                        >
                          <FaEdit />
                        </Button>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip>Xóa</Tooltip>}>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => onDelete(emp)}
                        >
                          <FaTrash />
                        </Button>
                      </OverlayTrigger>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default EmployeeTable;
