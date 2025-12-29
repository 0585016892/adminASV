import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCustomerDetails } from "../api/customerApi";
import {
  Card,
  Table,
  Spinner,
  Alert,
  Row,
  Col,
  Image,
  Badge,
} from "react-bootstrap";

const URL_WEB = process.env.REACT_APP_WEB_URL;

const CustomerDetailsNew = () => {
  const { id } = useParams();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const data = await getCustomerDetails(id);
        setCustomerData(data);
      } catch (err) {
        setError("Không thể tải dữ liệu khách hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerDetails();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-5 d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;
console.log(customerData.customer);

  return (
        <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      {/* HEADER KHÁCH HÀNG */}
      <Card className="mb-4 shadow-sm border-0 rounded-3">
        <Card.Body className="d-flex align-items-center gap-4" style={{ backgroundColor: "#e9f7ef" }}>
          <Image
            src={`${URL_WEB}/uploads/customers/${customerData.customer.images}`}
            roundedCircle
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
          <div>
            <h4 className="mb-1">{customerData.customer.full_name}</h4>
            <p className="mb-1">
              <strong>Email:</strong> {customerData.customer.email}
            </p>
            <p className="mb-0">
              <strong>Điện thoại:</strong> {customerData.customer.phone} |{" "}
              <strong>Địa chỉ:</strong> {customerData.customer.address}
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* DANH SÁCH ĐƠN HÀNG */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Header
          as="h5"
          className="text-white"
          style={{ backgroundColor: "#28a745" }}
        >
          Danh sách đơn hàng ({customerData.orders.length})
        </Card.Header>
        <Card.Body style={{ maxHeight: "650px", overflowY: "auto" }}>
          {customerData.orders.length === 0 ? (
            <Alert variant="info">Khách hàng chưa có đơn hàng nào.</Alert>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead style={{ backgroundColor: "#f0f8ff" }}>
                <tr>
                  <th>Mã đơn</th>
                  <th>Sản phẩm</th>
                  <th>Ảnh</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Size</th>
                  <th>Màu</th>
                  <th>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {customerData.orders.map((order) => (
                  <tr key={order.order_id}>
                    <td>
                      <Badge bg="secondary">#{order.order_id}</Badge>
                    </td>
                    <td>{order.name}</td>
                    <td>
                      <Image
                        src={`${URL_WEB}/uploads/${order.image}`}
                        alt={order.name}
                        rounded
                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                      />
                    </td>
                    <td>{Number(order.price).toLocaleString("vi-VN")}đ</td>
                    <td>{order.quantity}</td>
                    <td>{order.size}</td>
                    <td>{order.color}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerDetailsNew;
