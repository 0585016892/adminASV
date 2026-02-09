import React from "react";
import { 
  Modal, 
  Button, 
  Badge, 
  Row, 
  Col, 
  Spin, 
  Typography, 
  Divider, 
  Image, 
  Descriptions, 
  Empty ,
  Card,
  Space,
  Tag
} from "antd";
import { 
  BookOutlined, 
  EyeOutlined, 
  FileTextOutlined, 
  PictureOutlined,
  CheckCircleOutlined,
  StopOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const PostDetailModal = ({ show, onHide, post, loading = false }) => {
  const URL_WEB = process.env.REACT_APP_WEB_URL;

  if (!post && !loading) return null;

  return (
    <Modal
      title={
        <Space>
          <BookOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 700 }}>CHI TIẾT BÀI VIẾT</span>
        </Space>
      }
      open={show}
      onCancel={onHide}
      width={1000} // Mở rộng chiều ngang modal
      centered
      footer={[
        <Button key="close" type="primary" onClick={onHide}>
          Đóng cửa sổ
        </Button>,
      ]}
    >
      <Spin spinning={loading} tip="Đang tải dữ liệu bài viết...">
        {!post ? (
          <Empty description="Không tìm thấy dữ liệu" />
        ) : (
          <div style={{ padding: '10px 0' }}>
            <Row gutter={[24, 24]}>
              {/* Cột trái: Thông tin và Nội dung */}
              <Col xs={24} lg={15}>
                <Title level={4}>{post.title}</Title>
                
                <Descriptions bordered size="small" column={2} className="mb-4">
                  <Descriptions.Item label="Danh mục">
                    <Tag color="blue">{post.category || "Chưa phân loại"}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {post.status === "published" ? (
                      <Badge status="success" text="Đang hiển thị" />
                    ) : (
                      <Badge status="default" text="Bản nháp" />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo" span={2}>
                    {new Date(post.created_at || Date.now()).toLocaleString("vi-VN")}
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left" style={{ margin: '12px 0' }}>
                  <Space><FileTextOutlined /> Nội dung bài viết</Space>
                </Divider>
                
                <div 
                  className="content-preview-box"
                  style={{ 
                    maxHeight: '400px', 
                    overflowY: 'auto', 
                    padding: '15px', 
                    background: '#fcfcfc', 
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px'
                  }}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </Col>

              {/* Cột phải: Hình ảnh */}
              <Col xs={24} lg={9}>
                <Card 
                  size="small" 
                  title={<Space><PictureOutlined /> Hình ảnh đại diện</Space>}
                  className="mb-3"
                  headStyle={{ background: '#fafafa' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={`${URL_WEB}${post.image}`}
                      alt="Thumbnail"
                      style={{ 
                        maxHeight: 200, 
                        width: '100%', 
                        objectFit: 'cover', 
                        borderRadius: '4px' 
                      }}
                      fallback="https://via.placeholder.com/400x300?text=No+Image"
                    />
                  </div>
                </Card>

                <Card 
                  size="small" 
                  title={<Space><PictureOutlined /> Album hình ảnh</Space>}
                  headStyle={{ background: '#fafafa' }}
                >
                  {post.images?.length > 0 ? (
                    <Image.PreviewGroup>
                      <Row gutter={[8, 8]}>
                        {post.images.map((img, idx) => (
                          <Col span={8} key={idx}>
                            <Image
                              src={`${URL_WEB}${img}`}
                              style={{ 
                                height: 60, 
                                width: '100%', 
                                objectFit: 'cover', 
                                borderRadius: '4px',
                                border: '1px solid #f0f0f0' 
                              }}
                            />
                          </Col>
                        ))}
                      </Row>
                    </Image.PreviewGroup>
                  ) : (
                    <Text type="secondary" italic>Không có hình ảnh đính kèm</Text>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default PostDetailModal;