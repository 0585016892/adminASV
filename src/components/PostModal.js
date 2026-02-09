import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Upload,
  Button,
  Divider,
  Typography,
  Spin,
  Space
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  FileTextOutlined,
  UploadOutlined,
  PictureOutlined
} from "@ant-design/icons";
import { createPost, updatePost } from "../api/postAPI";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { TextArea } = Input;
const { Title } = Typography;

const PostModal = ({
  show,
  onHide,
  initialData = null,
  onSuccess,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const isEditMode = !!initialData;
  const API_URL = process.env.REACT_APP_WEB_URL;

  const [saving, setSaving] = useState(false);
  const [mainFileList, setMainFileList] = useState([]); // Ảnh chính
  const [extraFileList, setExtraFileList] = useState([]); // Ảnh phụ

  // 1. Đồng bộ dữ liệu khi mở Modal
  useEffect(() => {
    if (show) {
      if (initialData) {
        form.setFieldsValue({
          title: initialData.title,
          slug: initialData.slug,
          category: initialData.category,
          content: initialData.content,
          status: initialData.status,
        });
        // Hiển thị ảnh cũ nếu có
        if (initialData.image) {
          setMainFileList([{
            uid: '-1',
            name: 'current_image.png',
            status: 'done',
            url: `${API_URL}${initialData.image}`,
          }]);
        }
      } else {
        form.resetFields();
        setMainFileList([]);
        setExtraFileList([]);
      }
    }
  }, [show, initialData, form, API_URL]);

  // 2. Tự động tạo Slug
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/Đ/g, "D")
      .replace(/đ/g, "d")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
    form.setFieldsValue({ slug });
  };

  // 3. Xử lý lưu dữ liệu
  const onFinish = async (values) => {
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(values).forEach(key => {
        data.append(key, values[key] || "");
      });

      // Append ảnh chính
      if (mainFileList[0]?.originFileObj) {
        data.append("image", mainFileList[0].originFileObj);
      }

      // Append ảnh phụ
      extraFileList.forEach(file => {
        if (file.originFileObj) {
          data.append("images", file.originFileObj);
        }
      });

      if (isEditMode) {
        await updatePost(initialData.id, data);
        showSuccessToast("Thành công", "Cập nhật bài viết thành công!");
      } else {
        await createPost(data);
        showSuccessToast("Thành công", "Thêm bài viết thành công!");
      }

      onSuccess();
      onHide();
    } catch (err) {
      showErrorToast("Lỗi", "Không thể lưu bài viết.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {isEditMode ? <><EditOutlined /> Sửa bài viết</> : <><PlusOutlined /> Thêm bài viết mới</>}
        </Title>
      }
      open={show}
      onCancel={onHide}
      onOk={() => form.submit()}
      width={900}
      centered
      confirmLoading={saving}
      okText={isEditMode ? "Cập nhật bài viết" : "Đăng bài ngay"}
      cancelText="Hủy bỏ"
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: 'draft' }}
          style={{ marginTop: 20 }}
        >
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                label="Tiêu đề bài viết"
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
              >
                <Input size="large" onChange={handleTitleChange} placeholder="Nhập tiêu đề hấp dẫn..." />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="Đường dẫn (Slug)" name="slug">
                <Input size="large" readOnly style={{ background: '#f5f5f5', color: '#888' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Danh mục" name="category" rules={[{ required: true }]}>
                <Input size="large" placeholder="VD: Tin tức, Khuyến mãi..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái hiển thị" name="status">
                <Select size="large">
                  <Select.Option value="draft">📁 Lưu bản nháp</Select.Option>
                  <Select.Option value="published">✅ Hiển thị công khai</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Nội dung tóm tắt / Chi tiết"
            name="content"
            rules={[{ required: true, message: 'Nội dung không được để trống' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Viết nội dung bài viết vào đây..." 
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Divider orientation="left"><PictureOutlined /> Hình ảnh bài viết</Divider>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="Ảnh đại diện chính">
                <Upload
                  listType="picture-card"
                  fileList={mainFileList}
                  onPreview={(file) => window.open(file.url || file.thumbUrl)}
                  onChange={({ fileList }) => setMainFileList(fileList)}
                  beforeUpload={() => false} // Không upload tự động
                  maxCount={1}
                >
                  {mainFileList.length >= 1 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col span={16}>
              <Form.Item label="Album ảnh phụ (Nhiều ảnh)">
                <Upload
                  listType="picture-card"
                  fileList={extraFileList}
                  onChange={({ fileList }) => setExtraFileList(fileList)}
                  beforeUpload={() => false}
                  multiple
                >
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
};

export default PostModal;