import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Form, Input, Button, Row, Col, Card, Select, 
  Typography, Space, Breadcrumb, ConfigProvider, 
  Spin, Divider, Tooltip 
} from "antd";
import { 
  PlusOutlined, ArrowLeftOutlined, AppstoreAddOutlined, 
  InfoCircleOutlined, GlobalOutlined, SendOutlined,
  ClusterOutlined
} from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { addDanhmuc, getParentCategories } from "../api/danhmucApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";
import { useAuth } from "../contexts/AuthContext";

const { Title, Text } = Typography;

// Helper tạo slug chuẩn SEO
const generateSlug = (text) => {
  if (!text) return "";
  const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ";
  const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydD";
  let str = text.split("").map((c, i) => {
    const idx = from.indexOf(c);
    return idx > -1 ? to[idx] : c;
  }).join("");

  return str.toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

const DanhMucAdd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);

  // Lấy danh sách danh mục cha khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getParentCategories();
        setParentCategories(response.categories || []);
      } catch (error) {
        showErrorToast("Lỗi", "Không thể tải danh sách danh mục cha.");
      }
    };
    fetchCategories();
  }, []);

  // Tự động sinh slug khi nhập tên
  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setFieldsValue({ slug: generateSlug(name) });
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const dataToSend = {
        ...values,
        parent_id: values.parent_id || null, // Xử lý null nếu không chọn
        userID: user.id
      };

      await addDanhmuc(dataToSend);
      showSuccessToast("Thành công", "Danh mục mới đã được tạo!");
      
      // Delay điều hướng để người dùng kịp thấy toast thành công
      setTimeout(() => {
        navigate("/danh-muc/danh-sach");
      }, 1500);
    } catch (error) {
      showErrorToast("Thất bại", "Có lỗi xảy ra khi thêm danh mục.");
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 12 } }}>
      <div className="container-fluid p-4">
        <style>{`
          .add-card { border-radius: 16px; border: 1px solid #f0ece1; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
          .section-title { color: #5d4037; display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
          .ck-editor__editable { min-height: 250px; border-radius: 0 0 8px 8px !important; }
          .ant-form-item-label label { font-weight: 600; }
        `}</style>

        {/* Loading Overlay */}
        <Spin spinning={loading} fullscreen tip="Đang lưu dữ liệu..." />

        {/* Header Section */}
        <Row className="mb-4 align-items-center">
          <Col span={12}>
            <Breadcrumb items={[{ title: "Quản trị" }, { title: "Danh mục" }, { title: "Khởi tạo" }]} className="mb-2" />
            <Title level={3} className="m-0"><AppstoreAddOutlined /> Thêm Danh Mục Mới</Title>
          </Col>
          <Col span={12} className="text-end">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/danh-muc/danh-sach")}>
              Quay lại danh sách
            </Button>
          </Col>
        </Row>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish} 
          initialValues={{ status: "active", parent_id: "" }}
          className="mt-2"
        >
          <Row gutter={24} justify="center">
            <Col xs={24} xl={18}>
              <Card className="add-card">
                <Title level={5} className="section-title"><InfoCircleOutlined /> Thông tin chung</Title>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="name" 
                      label="Tên danh mục" 
                      rules={[{ required: true, message: 'Tên danh mục không được để trống' }]}
                    >
                      <Input size="large" placeholder="Nhập tên (ví dụ: Phụ kiện đàn)" onChange={handleNameChange} />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="slug" 
                      label={
                        <Space>
                          Slug đường dẫn
                          <Tooltip title="Đường dẫn được tạo tự động để tối ưu SEO">
                            <InfoCircleOutlined style={{ fontSize: 12 }} />
                          </Tooltip>
                        </Space>
                      } 
                      rules={[{ required: true }]}
                    >
                      <Input size="large" prefix={<GlobalOutlined className="text-muted" />} readOnly placeholder="tu-dong-sinh-slug" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="parent_id" 
                      label={<Space><ClusterOutlined /> Danh mục cha (nếu có)</Space>}
                    >
                      <Select size="large" placeholder="-- Chọn danh mục cấp cao hơn --">
                        <Select.Option value="">Không có (Là danh mục gốc)</Select.Option>
                        {parentCategories.map(cat => (
                          <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item name="status" label="Trạng thái hiển thị" rules={[{ required: true }]}>
                      <Select size="large">
                        <Select.Option value="active">Hiển thị công khai</Select.Option>
                        <Select.Option value="inactive">Tạm ẩn</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                {/* Phần mô tả với CKEditor */}
                <Form.Item 
                  name="description" 
                  label="Mô tả chi tiết"
                  trigger="onChange"
                  getValueFromEvent={(event, editor) => editor.getData()}
                >
                  <CKEditor
                    editor={ClassicEditor}
                    config={{
                      placeholder: 'Nhập nội dung mô tả danh mục tại đây...',
                    }}
                    onReady={(editor) => {
                      // Tùy chỉnh chiều cao nếu cần
                      editor.editing.view.change((writer) => {
                        writer.setStyle("height", "250px", editor.editing.view.document.getRoot());
                      });
                    }}
                  />
                </Form.Item>

                <div className="text-end mt-4">
                  <Space size="middle">
                    <Button size="large" onClick={() => navigate("/danh-muc/danh-sach")}>
                      Hủy bỏ
                    </Button>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<SendOutlined />} 
                      htmlType="submit"
                      loading={loading}
                      style={{ paddingLeft: 40, paddingRight: 40 }}
                    >
                      LƯU DANH MỤC
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </ConfigProvider>
  );
};

export default DanhMucAdd;