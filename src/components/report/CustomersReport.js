import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Spinner, Form, Button, Row, Col } from "react-bootstrap";
import "chart.js/auto";

const CustomersReport = () => {
  const API_URL = process.env.REACT_APP_API_URL; // Cập nhật URL nếu khác
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Kết quả dạng "2025-06-16"
  });
  const [limit, setLimit] = useState(5);
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports/customers`, {
        params: {
          from_date: fromDate,
          to_date: toDate,
          limit: limit,
        },
      });
      setData(res.data.data);
    } catch (error) {
      console.error("Lỗi gọi API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const chartData = {
    labels: data.map((d) => d.customer_group),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: ["#FF9F40", "#36A2EB", "#FF6384"],
      },
    ],
  };

  return (
    <div>
      <h4>Thống kê khách hàng</h4>

      <Form onSubmit={handleSubmit} className="mb-4">
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Từ ngày</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Đến ngày</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button type="submit" variant="primary">
              Xem báo cáo
            </Button>
          </Col>
        </Row>
      </Form>
      {loading ? (
         <div className="text-center py-5  d-flex justify-content-center align-items-center h-100">
         <Spinner animation="border" variant="primary" />
       </div>
      ) : (
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <Doughnut data={chartData} />
        </div>
      )}
    </div>
  );
};

export default CustomersReport;
