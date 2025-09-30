import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Spinner, Form, Button, Row, Col, Card, Container } from "react-bootstrap";
import { motion } from "framer-motion";
import "chart.js/auto";

const TopProductsReport = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("2025-01-01");
  const today = new Date().toISOString().split("T")[0];
  const [toDate, setToDate] = useState(today);
  const [limit, setLimit] = useState(5);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports/top-products`, {
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
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "Số lượng bán",
        data: data.map((d) => d.total_sold),
        backgroundColor: [
          "#36A2EB",
          "#FF6384",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.formattedValue} sản phẩm`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Số lượng bán" },
      },
      x: {
        title: { display: true, text: "Tên sản phẩm" },
        ticks: {
          maxRotation: 45,
          minRotation: 30,
        },
      },
    },
  };

  return (
    <Container className="py-4">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="shadow-lg border-0 rounded-4">
          <Card.Header className="bg-success text-white text-center py-3 rounded-top-4">
            <h4 className="mb-0">🔥 Top sản phẩm bán chạy</h4>
          </Card.Header>

          <Card.Body>
            {/* Form lọc thời gian */}
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
                  <Button type="submit" variant="success" className="mt-2">
                    Xem báo cáo
                  </Button>
                </Col>
              </Row>
            </Form>

            {/* Hiển thị biểu đồ */}
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="success" />
              </div>
            ) : data.length === 0 ? (
              <p className="text-center text-muted">
                Không có dữ liệu trong khoảng thời gian này.
              </p>
            ) : (
              <div style={{ height: "450px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}

            {/* Bảng tóm tắt dữ liệu */}
            {!loading && data.length > 0 && (
              <div className="mt-4">
                <h6 className="fw-bold mb-3 text-center text-secondary">
                  📋 Danh sách sản phẩm
                </h6>
                {data.map((item, idx) => (
                  <div
                    key={idx}
                    className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom small"
                  >
                    <span className="fw-semibold">{idx + 1}. {item.name}</span>
                    <span className="text-success">{item.total_sold} sản phẩm</span>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};

export default TopProductsReport;
