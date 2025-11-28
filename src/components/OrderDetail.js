import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, Row, Col, Card, Form ,Spinner} from "react-bootstrap";
import { updateOrderStatus, getOrderDetails } from "../api/orderApi"; // API cập nhật trạng thái đơn hàng
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";
import { useAuth } from "../contexts/AuthContext";

const OrderDetail = () => {
  const { user } = useAuth();
  const { orderId } = useParams(); // Lấy ID đơn hàng từ URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State để lưu lỗi nếu có

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderData = await getOrderDetails(orderId);
        if (orderData.success) {
          setOrder(orderData.order); // Giả sử bạn trả về dữ liệu có trường `success` và `order`
        } else {
          setError("Không tìm thấy đơn hàng");
        }
      } catch (error) {
        setError("Đã có lỗi khi tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus,user.id);
      setOrder((prevOrder) => ({
        ...prevOrder,
        status: newStatus,
      }));
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái");
    }
  };
  // in hóa đơn
  const handlePrint = () => {
    window.print(); // In trực tiếp trang hiện tại
  };
  const handleDownloadPDF = async () => {
    const input = document.getElementById("invoice-content");
    if (!input) return alert("Không tìm thấy hóa đơn để in.");
  
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`hoa_don_DH${order.order_id}.pdf`);
  };
  if (loading) {
    return <div className="text-center py-5 w-100  d-flex justify-content-center align-items-center h-100">
    <Spinner animation="border" variant="primary" />
</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!order) {
    return <div>Đơn hàng không tồn tại.</div>;
  }

  return (
    <>
     <div className="container-fluid my-4" id="invoice-content" style={{ paddingLeft: "35px" }}>
      <h4 className="mb-4 text-center">Chi tiết đơn hàng</h4>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6} className="border-end">
              <h5>
                Mã đơn hàng:{" "}
                <span className="text-primary">
                  DH{order?.order_id?.toString().padStart(4, "0")}
                </span>
              </h5>
              <p>
                <strong>Khách hàng:</strong> {order?.customer_name}
              </p>
              <p>
                <strong>SĐT:</strong> {order?.customer_phone}
              </p>
              <p>
                <strong>Email:</strong> {order?.customer_email}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {order?.address}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {new Date(order?.created_at ?? "").toLocaleDateString()}
              </p>
              <p>
                <strong>Tổng tiền:</strong>{" "}
                <span className=" ">
                  {Number(order?.total).toLocaleString()} VND
                </span>
                </p>
                 <p>
                <strong>Giảm giá:</strong>{" "}
                <span className=" ">
                  {order?.discount == 0 ? '0 VND' : "- " + Number(order?.discount).toLocaleString() + ' VND'} 
                </span>
                </p>
                 <p>
                <strong>Thành tiền:</strong>{" "}
                <span className="text-danger fw-bold">
                  {Number(order?.final_total).toLocaleString()} VND
                </span>
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <span
                  className={`badge bg-${
                    order.status === "Đã giao"
                      ? "success"
                      : order.status === "Đã hủy"
                      ? "danger"
                      : "warning"
                  } text-dark`}
                >
                  {order?.status}
                </span>
              </p>
              <Form.Select
                value={order?.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="mt-2"
                disabled={
                  order?.status === "Đã giao" || order?.status === "Đã hủy"
                }
              >
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Đang giao">Đang giao</option>
                <option value="Đã giao">Đã giao</option>
                <option value="Đã hủy">Đã hủy</option>
              </Form.Select>
              <p className="text-muted small mt-1">
                {order?.status === "Đã giao" || order?.status === "Đã hủy"
                  ? "Không thể thay đổi trạng thái này."
                  : "Chọn trạng thái đơn hàng để cập nhật."}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <h5 className="mb-3">Danh sách sản phẩm</h5>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>Tên sản phẩm</th>
                <th>Size</th>
                <th>Màu sắc</th>
                <th>Số lượng</th>
                <th>Giá</th>
                <th>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {order?.items?.length ? (
                order.items.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product_name}</td>
                    <td>{item.size}</td>
                    <td>{item.color}</td>
                    <td>{item.quantity}</td>
                    <td>{Number(item.price).toLocaleString()} VND</td>
                    <td>{(item.quantity * item.price).toLocaleString()} VND</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    Không có sản phẩm trong đơn hàng.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <h5 className="mb-3">Ghi chú</h5>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <p>
            {order?.note || (
              <span className="text-muted">Không có ghi chú</span>
            )}
          </p>
        </Card.Body>
      </Card>
      </div>
      {order && (
      <div className="text-center mt-4">
        <Button variant="outline-primary" size="lg" onClick={handleDownloadPDF}>
          <i className="bi bi-download me-2"></i>Tải hóa đơn PDF
        </Button>
      </div>
        )}
    </>
  );
};

export default OrderDetail;
