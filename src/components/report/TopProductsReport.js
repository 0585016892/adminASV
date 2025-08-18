import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Spinner, Form, Button, Row, Col } from "react-bootstrap";
import "chart.js/auto";

const TopProductsReport = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("2025-01-01");
  const date = new Date();
  const formatted = date.toISOString().split("T")[0];
  const [toDate, setToDate] = useState(formatted);
  const [limit, setLimit] = useState(5);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports/top-products`, {
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
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "Số lượng bán",
        data: data.map((d) => d.total_sold),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderRadius: 6, // bo tròn đầu cột
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
      },
    },
  };

  return (
    <div>
      <h4 className="mb-4">Top sản phẩm bán chạy</h4>

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
        <div className="text-center py-5 d-flex justify-content-center align-items-center h-100">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div style={{ width: "100%", height: "500px" }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default TopProductsReport;
