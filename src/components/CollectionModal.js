import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Typography,
  Space,
  Button,
  Divider,
  message,
  Col,
  Row,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  GlobalOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { TextArea } = Input;

const CollectionModal = ({ show, onHide, onSave, initialData = null }) => {
  const [form] = Form.useForm();
  const isEdit = !!initialData;
  const [fileList, setFileList] = useState([]);

  // Khởi tạo/Reset dữ liệu khi mở Modal
  useEffect(() => {
    if (show) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
        });
        // Thiết lập preview ảnh cũ nếu có
        if (initialData.image) {
          const imageUrl = initialData.image.startsWith("http")
            ? initialData.image
            : `${process.env.REACT_APP_WEB_URL}/uploads/${initialData.image}`;
          setFileList([{ url: imageUrl, name: initialData.image }]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [show, initialData, form]);

  // Helper tạo slug chuẩn SEO
  const generateSlug = (text) => {
    if (!text) return "";
    return text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/Đ/g, "D")
      .replace(/đ/g, "d")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    form.setFieldsValue({ slug: generateSlug(value) });
  };

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // Lấy file thực tế an toàn (Sửa lỗi dính undefined)
        let selectFile = null;
        if (fileList.length > 0) {
          // Nếu có originFileObj thì lấy (ảnh cũ), nếu không thì lấy chính fileList[0] (ảnh mới upload)
          selectFile = fileList[0]?.originFileObj || fileList[0];
        }

        const submitData = {
          ...values,
          id: initialData?.id,
          image: selectFile, // Gán file đã bóc tách an toàn vào đây
        };

        // In ra để bạn kiểm tra chắc chắn ở F12 xem 'image' đã có dữ liệu chưa
        console.log("submitData chuẩn bị gửi đi:", submitData);

        onSave(submitData);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };
  // Cấu hình cho Upload ảnh
  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false; // Ngăn upload tự động lên server
    },
    fileList,
    listType: "picture-card",
    maxCount: 1,
  };

  return (
    <Modal
      open={show}
      onCancel={onHide}
      onOk={handleFormSubmit}
      centered
      width={600}
      title={
        <Space>
          {isEdit ? <EditOutlined /> : <PlusOutlined />}
          <Title level={5} style={{ margin: 0, color: "#5d4037" }}>
            {isEdit ? "CẬP NHẬT BỘ SƯU TẬP" : "KHỞI TẠO BỘ SƯU TẬP"}
          </Title>
        </Space>
      }
      footer={[
        <Button key="back" onClick={onHide} style={{ borderRadius: 8 }}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleFormSubmit}
          style={{
            background: "#5d4037",
            borderColor: "#5d4037",
            borderRadius: 8,
          }}
        >
          {isEdit ? "Lưu thay đổi" : "Thêm mới ngay"}
        </Button>,
      ]}
    >
      <Divider style={{ margin: "12px 0" }} />

      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: "active" }}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label={<Text strong>Tên bộ sưu tập</Text>}
              rules={[
                { required: true, message: "Vui lòng không để trống tiêu đề" },
              ]}
            >
              <Input
                size="large"
                placeholder="Ví dụ: Thu Đông 2026 - Acoustic Vibe"
                onChange={handleNameChange}
                style={{ borderRadius: 8 }}
                // Tooltip xử lý khi tiêu đề quá dài
                suffix={
                  <Tooltip title="Tiêu đề sẽ được hiển thị trên trang chủ">
                    <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                  </Tooltip>
                }
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="slug"
              label={<Text strong>Slug đường dẫn</Text>}
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Đường dẫn tĩnh chuẩn SEO, được tạo tự động từ tên.
                </Text>
              }
            >
              <Input
                size="large"
                prefix={<GlobalOutlined />}
                readOnly
                style={{
                  background: "#f5f5f5",
                  color: "#8c8c8c",
                  borderRadius: 8,
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="status" label={<Text strong>Trạng thái</Text>}>
              <Select size="large" style={{ borderRadius: 8 }}>
                <Select.Option value="active">Đang kích hoạt</Select.Option>
                <Select.Option value="inactive">Tạm ẩn</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="description"
              label={<Text strong>Mô tả ngắn gọn</Text>}
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập giới thiệu về bộ sưu tập..."
                style={{ borderRadius: 8 }}
                showCount
                maxLength={200}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label={<Text strong>Ảnh bìa bộ sưu tập</Text>} required>
              <div
                style={{
                  background: "#fafafa",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px dashed #d9d9d9",
                }}
              >
                <Upload {...uploadProps}>
                  {fileList.length < 1 && (
                    <div>
                      <PictureOutlined
                        style={{ fontSize: 24, color: "#5d4037" }}
                      />
                      <div style={{ marginTop: 8, color: "#5d4037" }}>
                        Tải ảnh lên
                      </div>
                    </div>
                  )}
                </Upload>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  * Định dạng hỗ trợ: JPG, PNG. Dung lượng tối đa: 2MB.
                </Text>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CollectionModal;
