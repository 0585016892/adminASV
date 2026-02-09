import React, { useEffect, useState, useCallback } from "react";
import { 
  Table, Tag, Button, Modal, Form, Row, Col, 
  DatePicker, Select, Input, Space, Card, Typography, 
  Tooltip, Empty ,Badge
} from "antd";
import { 
  SearchOutlined, 
  HistoryOutlined, 
  InfoCircleOutlined, 
  UserOutlined,
  ExportOutlined 
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { parseUserAgent } from "../ultis/parseUserAgent";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const roleMap = { admin: "Quản trị viên", staff: "Nhân viên", hr: "Nhân sự" };
const actionColors = { 
  create: "green", 
  update: "orange", 
  delete: "red", 
  login: "blue",
  logout: "default" 
};

const LogManagement = () => {
  const API_URL_LOGIN = process.env.REACT_APP_API_URL;
  const [form] = Form.useForm();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // 1. Fetch Data
  const fetchLogs = useCallback(async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL_LOGIN}/log/logs`, { 
        params: { ...filters, page, limit: pagination.pageSize } 
      });
      if (data.success) {
        setLogs(data.data);
        setPagination(prev => ({ ...prev, current: data.page, total: data.total }));
      }
    } catch (err) {
      console.error("Lỗi lấy logs:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL_LOGIN, pagination.pageSize]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  // 2. Xử lý bộ lọc
  const onFilter = (values) => {
    const filterData = { ...values };
    if (values.range) {
      filterData.date_from = values.range[0].format("YYYY-MM-DD");
      filterData.date_to = values.range[1].format("YYYY-MM-DD");
      delete filterData.range;
    }
    fetchLogs(1, filterData);
  };

  // 3. Render so sánh dữ liệu (Diff)
  const renderDetailDiff = (log) => {
    if (!log.old_data && !log.new_data) return <Empty description="Không có dữ liệu thay đổi" />;
    
    const oldData = log.old_data ? JSON.parse(log.old_data) : {};
    const newData = log.new_data ? JSON.parse(log.new_data) : {};
    const keys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));

    const columns = [
      { title: 'Trường dữ liệu', dataIndex: 'key', key: 'key', render: text => <Text strong>{text}</Text> },
      { title: 'Giá trị cũ', dataIndex: 'old', key: 'old', render: text => <Text type="secondary">{text || "-"}</Text> },
      { title: 'Giá trị mới', dataIndex: 'new', key: 'new', render: (text, record) => (
        <Text style={{ color: record.old !== text ? '#cf1322' : 'inherit', background: record.old !== text ? '#fff1f0' : 'transparent' }}>
          {text || "-"}
        </Text>
      )},
    ];

    const dataSource = keys.map(k => ({ key: k, old: String(oldData[k] || ""), new: String(newData[k] || "") }));

    return <Table columns={columns} dataSource={dataSource} pagination={false} size="small" bordered />;
  };

  // 4. Định nghĩa cột cho Table chính
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Người thao tác',
      key: 'user',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.full_name || "Hệ thống"}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.user_id || "N/A"}</Text>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: role => <Tag icon={<UserOutlined />}>{roleMap[role] || role || "-"}</Tag>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: action => (
        <Tag color={actionColors[action] || "default"} style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
          {action}
        </Tag>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: text => <Badge status="processing" text={text} />,
    },
    {
      title: 'Thiết bị/Trình duyệt',
      dataIndex: 'user_agent',
      key: 'user_agent',
      width: 200,
      render: ua => <Text ellipsis={{ tooltip: parseUserAgent(ua) }}>{parseUserAgent(ua)}</Text>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => dayjs(date).format("HH:mm:ss DD/MM/YYYY"),
    },
    {
      title: 'Thao tác',
      key: 'ops',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          ghost 
          size="small" 
          icon={<HistoryOutlined />} 
          onClick={() => setSelectedLog(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4" style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Card bordered={false} className="shadow-sm" style={{ borderRadius: '12px' }}>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={3} style={{ margin: 0 }}><HistoryOutlined /> Nhật ký hoạt động hệ thống</Title>
            <Text type="secondary">Theo dõi các thay đổi dữ liệu và lịch sử truy cập của người dùng.</Text>
          </Col>
          <Col>
            <Button icon={<ExportOutlined />}>Xuất báo cáo</Button>
          </Col>
        </Row>

        {/* Form Filter */}
        <Form form={form} onFinish={onFilter} layout="inline" className="mb-4 p-3" style={{ background: "#fafafa", borderRadius: "8px" }}>
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col span={4}>
              <Form.Item name="user_id">
                <Input placeholder="User ID" prefix={<SearchOutlined />} allowClear />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="action">
                <Input placeholder="Hành động (create...)" allowClear />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="module">
                <Input placeholder="Module (order...)" allowClear />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="role">
                <Select placeholder="Chọn Role" allowClear>
                  {Object.entries(roleMap).map(([key, name]) => <Select.Option key={key} value={key}>{name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="range">
                <RangePicker style={{ width: '100%' }} placeholder={['Từ ngày', 'Đến ngày']} />
              </Form.Item>
            </Col>
            <Col span={2}>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} block>Lọc</Button>
            </Col>
          </Row>
        </Form>

        {/* Main Table */}
        <Table 
          columns={columns} 
          dataSource={logs} 
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => `Tổng cộng ${total} bản ghi`
          }}
          onChange={(pag) => fetchLogs(pag.current, form.getFieldsValue())}
          scroll={{ x: 1200 }}
          bordered
          size="middle"
        />
      </Card>

      {/* Modal Chi tiết Diff */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>Chi tiết thay đổi dữ liệu - Log #{selectedLog?.id}</span>
          </Space>
        }
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        width={800}
        footer={[<Button key="close" onClick={() => setSelectedLog(null)}>Đóng</Button>]}
      >
        {selectedLog && (
          <div className="mb-3">
            <Card size="small" className="mb-3" style={{ background: '#fafafa' }}>
              <Row gutter={16}>
                <Col span={12}><Text type="secondary">Mô tả:</Text> <Text strong>{selectedLog.description}</Text></Col>
                <Col span={12}><Text type="secondary">Thời gian:</Text> <Text strong>{dayjs(selectedLog.created_at).format("HH:mm:ss DD/MM/YYYY")}</Text></Col>
              </Row>
            </Card>
            {renderDetailDiff(selectedLog)}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LogManagement;