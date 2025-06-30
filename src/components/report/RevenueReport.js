import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Spinner, Form, Button, Row, Col } from "react-bootstrap";
import "chart.js/auto";

const RevenueReport = () => {
  const API_URL = process.env.REACT_APP_API_URL; // Cập nhật URL nếu khác
  const date = new Date();
  const formatted = date.toISOString().split("T")[0];
  const [toDate, setToDate] = useState(formatted);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("2025-01-01");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports/revenue`, {
        params: {
          from_date: fromDate,
          to_date: toDate,
        },
      });
      setData(res.data.data);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
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
    labels: data.map((d) => d.period),
    datasets: [
      {
        label: "Doanh thu",
        data: data.map((d) => d.revenue),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div>
      <h4 className="mb-4">Báo cáo doanh thu</h4>

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

      {loading ?
        <div className="text-center py-5  d-flex justify-content-center align-items-center h-100">
                    <Spinner animation="border" variant="primary" />
        </div> :
        <Bar data={chartData} />}
    </div>
  );
};

export default RevenueReport;
