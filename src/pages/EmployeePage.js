import React, { useEffect, useState, useCallback } from "react";
import { 
  Table, Card, Button, Input, Select, Space, Modal, 
  Form, Upload, Tag, Typography, Breadcrumb, App, Row, Col, Spin, Pagination 
} from "antd";
import { 
  PlusOutlined, SearchOutlined, UserOutlined, 
  EditOutlined, DeleteOutlined, UploadOutlined,
  TeamOutlined, FilterOutlined 
} from "@ant-design/icons";
import { 
  getEmployees, createEmployee, 
  updateEmployee, deleteEmployee 
} from "../api/employeeApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  
  const token = localStorage.getItem("token");
  
  // Phân trang & Lọc
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    keyword: "",
    department: "",
    role: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees(token);
      let data = res.data.data;
      
      // Filter logic tại client (nếu API chưa hỗ trợ lọc)
      if (filters.keyword) {
        data = data.filter(emp => emp.full_name.toLowerCase().includes(filters.keyword.toLowerCase()));
      }
      if (filters.department) {
        data = data.filter(emp => emp.department === filters.department);
      }
      if (filters.role) {
        data = data.filter(emp => emp.role === filters.role);
      }

      setEmployees(data);
      setTotal(res.data.total || data.length);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể lấy danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Xử lý Form
  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingId(emp.id);
      form.setFieldsValue({
        ...emp,
        password: "", // Không hiển thị mật khẩu cũ
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleFinish = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          if (key === 'avatar' && values[key].file) {
            formData.append('avatar', values[key].file.originFileObj);
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      if (editingId) {
        await updateEmployee(token, editingId, formData);
        showSuccessToast("Thành công", "Cập nhật nhân viên thành công");
      } else {
        await createEmployee(token, formData);
        showSuccessToast("Thành công", "Thêm nhân viên mới thành công");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showErrorToast("Thất bại", "Vui lòng kiểm tra lại thông tin");
    }
  };

  const handleDelete = (id, role) => {
    if (role === "admin") return showErrorToast("Cảnh báo", "Không thể xóa Quản trị viên");
    
    Modal.confirm({
      title: 'Xác nhận xóa?',
      content: 'Dữ liệu nhân viên sẽ bị xóa vĩnh viễn khỏi hệ thống.',
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteEmployee(token, id);
          showSuccessToast("Thành công", "Đã xóa nhân viên");
          fetchData();
        } catch {
          showErrorToast("Lỗi", "Không thể xóa nhân viên này");
        }
      }
    });
  };

  // Cấu hình bảng
  const columns = [
    {
      title: 'Nhân viên',
      key: 'user',
      render: (_, record) => (
        <Space>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0ece1', overflow: 'hidden' }}>
             {record.avatar ? <img src={record.avatar} alt="v" style={{width:'100%'}}/> : <UserOutlined style={{padding: 12}} />}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{record.full_name}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="blue">{text || 'N/A'}</Tag>
    },
    {
      title: 'Chức vụ',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'volcano' : 'green'}>
          {role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Hoạt động' : 'Khóa'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id, record.role)} />
        </Space>
      )
    }
  ];

  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Breadcrumb items={[{ title: 'Hệ thống' }, { title: 'Quản lý nhân viên' }]} />
          <Title level={3} style={{ marginTop: 8 }}><TeamOutlined /> Danh sách đội ngũ</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />} 
            onClick={() => handleOpenModal()}
            style={{ background: '#5d4037', borderColor: '#5d4037', borderRadius: 8 }}
          >
            Thêm nhân viên
          </Button>
        </Col>
      </Row>

      {/* Bộ lọc */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Input 
              prefix={<SearchOutlined />} 
              placeholder="Tìm theo tên hoặc email..." 
              onChange={e => setFilters({...filters, keyword: e.target.value})}
            />
          </Col>
          <Col xs={12} md={6}>
            <Select 
              className="w-100" 
              placeholder="Lọc phòng ban" 
              allowClear
              onChange={val => setFilters({...filters, department: val})}
              options={[...new Set(employees.map(e => e.department))].filter(Boolean).map(d => ({label: d, value: d}))}
            />
          </Col>
          <Col xs={12} md={6}>
            <Select 
              className="w-100" 
              placeholder="Chức vụ" 
              allowClear
              onChange={val => setFilters({...filters, role: val})}
              options={[{label: 'Quản trị viên', value: 'admin'}, {label: 'Nhân viên', value: 'staff'}]}
            />
          </Col>
        </Row>
      </Card>

      {/* Bảng dữ liệu */}
      <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
        <Table 
          columns={columns} 
          dataSource={employees} 
          loading={loading}
          rowKey="id"
          pagination={{
            total: total,
            pageSize: 10,
            showSizeChanger: false,
            style: { marginTop: 20 }
          }}
        />
        <div className="mt-2 text-secondary">Tổng cộng: <strong>{total}</strong> nhân viên</div>
      </Card>

      {/* Modal Thêm/Sửa */}
      <Modal
        title={editingId ? "Cập nhật thông tin nhân viên" : "Đăng ký nhân viên mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
        okText={editingId ? "Lưu thay đổi" : "Tạo tài khoản"}
        cancelText="Hủy bỏ"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="email@company.com" disabled={!!editingId} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="090..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="avatar" label="Ảnh đại diện">
                <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                  <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="department" label="Phòng ban">
                <Input placeholder="Kế toán, Sales..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="role" label="Quyền hạn" initialValue="staff">
                <Select options={[{label: 'Quản trị viên', value: 'admin'}, {label: 'Nhân viên', value: 'staff'}]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái" initialValue="active">
                <Select options={[{label: 'Hoạt động', value: 'active'}, {label: 'Khóa', value: 'inactive'}]} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item 
                name="password" 
                label="Mật khẩu" 
                rules={[{ required: !editingId, message: 'Vui lòng đặt mật khẩu' }]}
              >
                <Input.Password placeholder={editingId ? "Để trống nếu không muốn đổi" : "Mật khẩu tối thiểu 6 ký tự"} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeePage;