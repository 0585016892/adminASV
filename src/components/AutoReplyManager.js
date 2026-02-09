import React, { useState, useEffect, useCallback } from "react";
import { 
  Table, Card, Button, Input, Modal, Form, 
  Space, Typography, Tooltip, Popconfirm, 
  Upload, Row, Col, Badge, Empty, Spin, Tag 
} from "antd";
import { 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CloudUploadOutlined, 
  FileExcelOutlined,
  RobotOutlined,
  SaveOutlined,
  ExportOutlined,
  BulbOutlined
} from "@ant-design/icons";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const API = process.env.REACT_APP_API_URL;

const AutoReplyManager = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [form] = Form.useForm();
  const [gptForm] = Form.useForm();

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGPTModal, setShowGPTModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai`);
      const data = await res.json();
      setRules(data);
    } catch (error) {
      showErrorToast("Lỗi", "Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Xử lý Import Excel
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/import-excel`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        showSuccessToast("Thành công", `Đã thêm ${result.inserted} câu trả lời mới`);
        fetchRules();
      }
    } catch {
      showErrorToast("Lỗi", "Import file thất bại");
    } finally {
      setLoading(false);
    }
    return false; // Ngăn upload mặc định của Antd
  };

  // Xử lý Xóa
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/ai/delete/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showSuccessToast("Thành công", "Đã xóa quy tắc");
        fetchRules();
      }
    } catch {
      showErrorToast("Lỗi", "Không thể xóa nội dung này");
    }
  };

  // Xử lý Cập nhật
  const handleSaveEdit = async (values) => {
    try {
      const res = await fetch(`${API}/ai/update/${editingRule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await res.json();
      if (result.success) {
        showSuccessToast("Cập nhật", "Đã lưu thay đổi");
        setShowEditModal(false);
        fetchRules();
      }
    } catch {
      showErrorToast("Lỗi", "Cập nhật thất bại");
    }
  };

  // Xử lý Gemini AI
  const handleGeminiSuggest = async (values) => {
    setLoadingAI(true);
    try {
      const res = await fetch(`${API}/ai/suggest-gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: values.prompt }),
      });
      const result = await res.json();
      if (result.success) {
        showSuccessToast("Gemini AI", `✨ Đã tạo thêm ${result.inserted} quy tắc phản hồi`);
        setShowGPTModal(false);
        fetchRules();
      }
    } catch {
      showErrorToast("AI Error", "Lỗi khi kết nối với trí tuệ nhân tạo");
    } finally {
      setLoadingAI(false);
    }
  };

  const columns = [
    {
      title: 'MÃ SỐ',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => <Tag color="blue">CB82-{id}</Tag>,
    },
    {
      title: 'TỪ KHÓA / CÂU HỎI',
      dataIndex: 'chatbot_replies',
      key: 'chatbot_replies',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'NỘI DUNG PHẢN HỒI',
      dataIndex: 'reply',
      key: 'reply',
      render: (text) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}>
          {text}
        </Paragraph>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => {
                setEditingRule(record);
                form.setFieldsValue({
                  chatbot_replies: record.chatbot_replies,
                  reply: record.reply
                });
                setShowEditModal(true);
              }} 
            />
          </Tooltip>
          <Popconfirm
            title="Xóa quy tắc này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredRules = rules?.filter((r) =>
    !search || r.chatbot_replies?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-4" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <Title level={3}><RobotOutlined /> Chatbot Auto-Reply</Title>
          <Text type="secondary">Cấu hình từ khóa và câu trả lời tự động dựa trên Trí tuệ nhân tạo</Text>
        </div>
        <Space>
          <Button 
            icon={<ExportOutlined />} 
            onClick={() => window.open(`${API}/ai/export-excel`, "_blank")}
          >
            Xuất Excel
          </Button>
          <Button 
            type="primary" 
            icon={<BulbOutlined />} 
            style={{ background: '#8e44ad', borderColor: '#8e44ad' }}
            onClick={() => setShowGPTModal(true)}
          >
            Gợi ý từ Gemini AI
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card className="shadow-sm border-0" style={{ borderRadius: 12 }}>
            <div className="mb-4 d-flex justify-content-between align-items-center">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Tìm từ khóa khách hàng thường hỏi..."
                style={{ width: 400 }}
                size="large"
                onChange={(e) => setSearch(e.target.value)}
              />
              <Upload beforeUpload={handleUpload} showUploadList={false}>
                <Button icon={<CloudUploadOutlined />} type="dashed">Import Excel</Button>
              </Upload>
            </div>

            <Table 
              columns={columns} 
              dataSource={filteredRules} 
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              locale={{ emptyText: <Empty description="Chưa có dữ liệu phản hồi" /> }}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal Sửa Rule */}
      <Modal
        title="✏️ Chỉnh sửa phản hồi"
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSaveEdit}>
          <Form.Item name="chatbot_replies" label="Từ khóa khách hàng gửi" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="reply" label="Nội dung Chatbot trả lời" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Nhập nội dung phản hồi..." />
          </Form.Item>
          <Form.Item className="mb-0 text-end">
            <Space>
              <Button onClick={() => setShowEditModal(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Cập nhật ngay</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Gemini AI */}
      <Modal
        title={<Space><RobotOutlined style={{ color: '#1890ff' }} /> Gợi ý thông minh từ Gemini</Space>}
        open={showGPTModal}
        onCancel={() => setShowGPTModal(false)}
        footer={null}
      >
        <Form gptForm={gptForm} layout="vertical" onFinish={handleGeminiSuggest} initialValues={{ prompt: "Gợi ý 10 câu trả lời cho shop quần áo Acoustic Harmony" }}>
          <Form.Item name="prompt" label="Yêu cầu của bạn cho AI">
            <TextArea rows={5} placeholder="Ví dụ: Tạo các câu trả lời về chính sách đổi trả..." />
          </Form.Item>
          <div className="bg-light p-3 rounded mb-3">
            <Text type="secondary" size="small">
              <BulbOutlined /> AI sẽ tự động phân tích và tạo ra các cặp <b>Từ khóa - Phản hồi</b> phù hợp với yêu cầu của bạn và lưu trực tiếp vào cơ sở dữ liệu.
            </Text>
          </div>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            loading={loadingAI}
            icon={<RobotOutlined />}
          >
            {loadingAI ? "Gemini đang suy nghĩ..." : "Tạo và Lưu dữ liệu"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default AutoReplyManager;