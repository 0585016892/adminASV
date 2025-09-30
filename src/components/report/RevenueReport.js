import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Spinner,
  Form,
  Button,
  Row,
  Col,
  Card,
  Container
} from "react-bootstrap";
import { motion } from "framer-motion";
import "chart.js/auto";

const RevenueReport = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState(today);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports/revenue`, {
        params: { from_date: fromDate, to_date: toDate },
      });
      setData(res.data.data || []);
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

  // Tổng doanh thu
  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
const formattedRevenue = Number(totalRevenue).toLocaleString("vi-VN");
  // Biểu đồ
  const chartData = {
    labels: data.map((d) => d.period),
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: data.map((d) => d.revenue),
        backgroundColor: "rgba(75,192,192,0.6)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#333",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            ` ${context.formattedValue.toLocaleString("vi-VN")} ₫`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Doanh thu (VNĐ)" },
        ticks: {
          callback: (value) =>
            value.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }),
        },
      },
      x: {
        title: { display: true, text: "Thời gian" },
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
            <h4 className="mb-0">💰 Báo cáo doanh thu theo thời gian</h4>
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

                <Col md={2} className="d-grid">
                  <Button type="submit" variant="success" className="mt-2">
                    Xem báo cáo
                  </Button>
                </Col>
              </Row>
            </Form>

            {/* Biểu đồ hoặc trạng thái */}
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="success" />
              </div>
            ) : data.length === 0 ? (
              <p className="text-center text-muted">
                Không có dữ liệu trong khoảng thời gian này.
              </p>
            ) : (
              <div style={{ height: "450px",width:"100%" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}

            {/* Tổng doanh thu */}
            {!loading && data.length > 0 && (
              <div className="mt-4 text-center">
                <h6 className="fw-bold text-secondary mb-3">
                  💹 Tổng doanh thu:{" "}
                  <span className="text-success">
                    {formattedRevenue} ₫
                  </span>
                </h6>
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};

export default RevenueReport;
