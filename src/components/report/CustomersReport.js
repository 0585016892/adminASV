import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Spinner, Form, Button, Row, Col, Card, Container } from "react-bootstrap";
import { motion } from "framer-motion";
import "chart.js/auto";

const CustomersReport = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [limit, setLimit] = useState(5);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports/customers`, {
        params: { from_date: fromDate, to_date: toDate, limit: limit },
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
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  return (
    <Container className="py-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="shadow-lg border-0 rounded-4">
          <Card.Header className="bg-primary text-white text-center py-3 rounded-top-4">
            <h4 className="mb-0">📊 Báo cáo thống kê khách hàng</h4>
          </Card.Header>
          <Card.Body>
            {/* Form lọc dữ liệu */}
            <Form onSubmit={handleSubmit} className="mb-4">
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Từ ngày</Form.Label>
                    <Form.Control
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Đến ngày</Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Giới hạn</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-grid">
                  <Button type="submit" variant="primary" className="mt-2">
                    Xem báo cáo
                  </Button>
                </Col>
              </Row>
            </Form>

            {/* Nội dung biểu đồ */}
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : data.length === 0 ? (
              <p className="text-center text-muted">Không có dữ liệu trong khoảng thời gian này.</p>
            ) : (
              <div className="text-center">
                <div style={{ maxWidth: "420px", margin: "0 auto" }}>
                  <Doughnut data={chartData} />
                </div>

                <div className="mt-4">
                  {data.map((item, idx) => (
                    <div
                      key={idx}
                      className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom small"
                    >
                      <span className="fw-semibold">{item.customer_group}</span>
                      <span className="text-primary">{item.count} khách hàng</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};

export default CustomersReport;
