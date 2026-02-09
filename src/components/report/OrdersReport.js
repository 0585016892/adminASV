import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { 
  Card, Row, Col, Button, DatePicker, 
  Spin, Typography, Space, Statistic, Empty, Divider 
} from "antd";
import { 
  ShoppingOutlined, 
  SearchOutlined, 
  CalendarOutlined, 
  RiseOutlined,
  CalendarCheckOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import "chart.js/auto";

const { Title, Text } = Typography;

const OrdersReport = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    fromDate: "2025-01-01",
    toDate: dayjs().format("YYYY-MM-DD"),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports/orders`, {
        params: { from_date: filters.fromDate, to_date: filters.toDate },
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

  // Tính toán các chỉ số nhanh
  const totalOrders = data.reduce((sum, d) => sum + d.orders_count, 0);
  const avgOrders = data.length > 0 ? (totalOrders / data.length).toFixed(1) : 0;
  const maxOrders = data.length > 0 ? Math.max(...data.map(d => d.orders_count)) : 0;

  const chartData = {
    labels: data.map((d) => d.period),
    datasets: [
      {
        label: "Số lượng đơn hàng",
        data: data.map((d) => d.orders_count),
        fill: true,
        borderColor: "#5d4037", // Acoustic Brown
        backgroundColor: "rgba(93, 64, 55, 0.08)", // Nhạt dần
        tension: 0.4,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Ẩn legend vì đã có tiêu đề card
      tooltip: {
        backgroundColor: "#5d4037",
        titleFont: { size: 13 },
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { drawBorder: false, color: "#f0f0f0" },
        ticks: { stepSize: 1 },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <style>{`
        .stats-row .ant-statistic-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        .stats-row .ant-statistic-content { color: #5d4037; font-weight: 700; }
        .filter-section { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #f0ece1; margin-bottom: 24px; }
      `}</style>

      {/* Bộ lọc và Header nhanh */}
      <div className="filter-section shadow-sm">
        <Row gutter={[24, 24]} align="bottom">
          <Col xs={24} md={12} lg={16}>
            <Title level={4} style={{ margin: 0 }}> Phân tích xu hướng đơn hàng</Title>
            <Text type="secondary">Theo dõi biến động số lượng đơn hàng theo chu kỳ thời gian</Text>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Space.Compact className="w-100">
              <DatePicker.RangePicker 
                style={{ width: '75%' }}
                defaultValue={[dayjs(filters.fromDate), dayjs(filters.toDate)]}
                onChange={(dates) => {
                  if (dates) setFilters({ fromDate: dates[0].format("YYYY-MM-DD"), toDate: dates[1].format("YYYY-MM-DD") });
                }}
              />
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                onClick={fetchData}
                style={{ background: '#5d4037', borderColor: '#5d4037' }}
              >
                Lọc
              </Button>
            </Space.Compact>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        {data.length === 0 ? (
          <Empty description="Không có dữ liệu đơn hàng trong khoảng thời gian này" />
        ) : (
          <>
            {/* Thẻ chỉ số (KPIs) */}
            <Row gutter={[16, 16]} className="mb-4 stats-row">
              <Col xs={12} md={8}>
                <Card bordered={false} className="shadow-sm">
                  <Statistic 
                    title="Tổng số đơn hàng" 
                    value={totalOrders} 
                    prefix={<ShoppingOutlined />} 
                    suffix="đơn"
                  />
                </Card>
              </Col>
              <Col xs={12} md={8}>
                <Card bordered={false} className="shadow-sm">
                  <Statistic 
                    title="Trung bình/Ngày" 
                    value={avgOrders} 
                    prefix={<RiseOutlined />} 
                    precision={1}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} className="shadow-sm">
                  <Statistic 
                    title="Ngày cao điểm" 
                    value={maxOrders} 
                    prefix={<CalendarOutlined />} 
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Biểu đồ chính */}
            <Card bordered={false} className="shadow-sm rounded-4" style={{ padding: '10px' }}>
              <div style={{ height: "400px" }}>
                <Line data={chartData} options={chartOptions} />
              </div>
              <Divider />
              <div className="text-center">
                <Text type="secondary" italic>
                  Biểu đồ hiển thị dữ liệu từ {dayjs(filters.fromDate).format("DD/MM/YYYY")} đến {dayjs(filters.toDate).format("DD/MM/YYYY")}
                </Text>
              </div>
            </Card>
          </>
        )}
      </Spin>
    </motion.div>
  );
};

export default OrdersReport;