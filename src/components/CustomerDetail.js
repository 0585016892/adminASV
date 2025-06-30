import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams to get dynamic route params
import { getCustomerDetails } from "../api/customerApi"; // Import the API function to get customer data
import {
  Card,
  ListGroup,
  Spinner,
  Alert,
  Row,
  Col,
  Image,
} from "react-bootstrap"; // Import React-Bootstrap components for styling

const CustomerDetails = () => {
  const { id } = useParams(); // Use the useParams hook to get the 'id' from the URL
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch customer and order details from the API
    const fetchCustomerDetails = async () => {
      try {
        const data = await getCustomerDetails(id); // Use the dynamic 'id' in the API request
        setCustomerData(data); // Set the fetched data into state
      } catch (err) {
        setError("Không thể tải dữ liệu khách hàng.");
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchCustomerDetails(); // Call the fetch function when the component is mounted or 'id' changes
  }, [id]); // Re-fetch if 'id' changes

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      {/* Customer Info Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h3" className="bg-primary text-white">
          Thông tin khách hàng
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <strong>Tên:</strong> {customerData.customer.full_name}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Email:</strong> {customerData.customer.email}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Điện thoại:</strong> {customerData.customer.phone}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Địa chỉ:</strong> {customerData.customer.address}
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Orders Section */}
      <Card className="shadow-sm">
        <Card.Header as="h4" className="bg-success text-white">
          Danh sách đơn hàng
        </Card.Header>
        <Card.Body>
          {customerData.orders.length === 0 ? (
            <Alert variant="info">Khách hàng chưa có đơn hàng nào.</Alert>
          ) : (
            <div
              style={{
                maxHeight: "513px",
                overflowY: "auto",
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
              }}
              className="custom-scroll-container"
            >
              <Row>
                {customerData.orders.map((order) => (
                  <Col key={order.order_id} md={6} className="mb-4">
                    <Card border="light" className="shadow-sm">
                      <Card.Body>
                        <Row>
                          {/* Thông tin đơn hàng bên trái */}
                          <Col md={8}>
                            <h5 className="text-success">
                              Mã đơn hàng: #{order.order_id}
                            </h5>
                            <p>
                              <strong>Ngày đặt:</strong>{" "}
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Sản phẩm:</strong> {order.name}
                            </p>
                            <p>
                              <strong>Giá:</strong>{" "}
                              {Number(order.price).toLocaleString("vi-VN")}đ
                            </p>
                            <p>
                              <strong>Số lượng:</strong> {order.quantity}
                            </p>
                            <p>
                              <strong>Size:</strong> {order.size}
                            </p>
                            <p>
                              <strong>Màu:</strong> {order.color}
                            </p>
                          </Col>
                          {/* Ảnh sản phẩm bên phải */}
                          <Col
                            md={4}
                            className="d-flex justify-content-center align-items-center"
                          >
                            <Image
                              src={`http://localhost:5000/uploads/${order.image}`}
                              alt={order.name}
                              fluid
                              rounded
                              style={{ width: "100%" }}
                            />
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerDetails;
