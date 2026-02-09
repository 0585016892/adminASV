import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { 
  Card, Row, Col, Button, DatePicker, 
  Spin, Typography, Space, Statistic, Empty, Divider 
} from "antd";
import { 
  DollarCircleOutlined, 
  SearchOutlined, 
  RiseOutlined,
  ExportOutlined,
  WalletOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import "chart.js/auto";

const { Title, Text } = Typography;

const RevenueReport = () => {
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
      const res = await axios.get(`${API_URL}/reports/revenue`, {
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

  // Tính toán tài chính
  const totalRevenue = data.reduce((sum, d) => sum + (Number(d.revenue) || 0), 0);
  const maxRevenue = data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 0;

  const chartData = {
    labels: data.map((d) => d.period),
    datasets: [
      {
        label: "Doanh thu thực tế",
        data: data.map((d) => d.revenue),
        backgroundColor: "#5d4037", // Acoustic Brown
        hoverBackgroundColor: "#b8860b", // Golden on hover
        borderRadius: 8,
        barThickness: 35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#2c1e1a",
        padding: 15,
        titleFont: { size: 14 },
        bodyFont: { size: 15, weight: 'bold' },
        callbacks: {
          label: (context) => ` ${Number(context.raw).toLocaleString("vi-VN")} ₫`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f0f0f0", drawBorder: false },
        ticks: {
          callback: (value) => `${(value / 1000000).toFixed(1)}M`, // Hiển thị đơn vị Triệu (M)
        },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`
        .revenue-card { border-radius: 16px; border: none; background: linear-gradient(135deg, #fff 0%, #faf9f6 100%); }
        .kpi-title { font-size: 12px; color: #8c8c8c; text-transform: uppercase; margin-bottom: 8px; font-weight: 600; }
        .revenue-value { color: #5d4037 !important; font-family: 'Georgia', serif; }
      `}</style>

      {/* Header & Filter */}
      <div className="mb-4 bg-white p-4 rounded-4 shadow-sm border">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>💰 Báo cáo Tài chính & Doanh thu</Title>
            <Text type="secondary">Phân tích dòng tiền thực tế dựa trên các đơn hàng đã thanh toán</Text>
          </Col>
          <Col>
            <Space.Compact size="large">
              <DatePicker.RangePicker 
                defaultValue={[dayjs(filters.fromDate), dayjs(filters.toDate)]}
                onChange={(dates) => {
                  if (dates) setFilters({ fromDate: dates[0].format("YYYY-MM-DD"), toDate: dates[1].format("YYYY-MM-DD") });
                }}
              />
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                onClick={fetchData}
                style={{ background: "#5d4037", borderColor: "#5d4037" }}
              >
                Cập nhật dữ liệu
              </Button>
            </Space.Compact>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading} size="large">
        {data.length === 0 ? (
          <Empty description="Chưa có dữ liệu doanh thu" />
        ) : (
          <>
            {/* KPI Section */}
            <Row gutter={[20, 20]} className="mb-4">
              <Col xs={24} md={12}>
                <Card className="revenue-card shadow-sm">
                  <div className="kpi-title"><WalletOutlined /> Tổng doanh thu kỳ này</div>
                  <Statistic 
                    value={totalRevenue} 
                    className="revenue-value"
                    suffix="VND"
                    formatter={(val) => <span style={{fontSize: '28px', fontWeight: 800}}>{val.toLocaleString('vi-VN')}</span>}
                  />
                  <div className="mt-2">
                    <Text type="success"><RiseOutlined /> Tăng trưởng ổn định</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card className="revenue-card shadow-sm">
                  <div className="kpi-title"><DollarCircleOutlined /> Doanh thu cao nhất/ngày</div>
                  <Statistic 
                    value={maxRevenue} 
                    suffix="VND"
                    valueStyle={{ color: '#b8860b' }}
                    formatter={(val) => <span style={{fontSize: '28px', fontWeight: 800}}>{val.toLocaleString('vi-VN')}</span>}
                  />
                  <div className="mt-2">
                    <Text type="secondary">Ghi nhận trong chu kỳ hiện tại</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Main Chart */}
            <Card bordered={false} className="shadow-sm rounded-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Title level={5} style={{ margin: 0 }}>Biểu đồ cột doanh thu</Title>
                <Button type="link" icon={<ExportOutlined />}>Tải báo cáo chi tiết</Button>
              </div>
              <div style={{ height: "400px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
              <Divider />
              <Row justify="center">
                <Col className="text-center">
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Đơn vị trục tung: <strong>M</strong> (Triệu VNĐ) | Dữ liệu được tính trên các đơn hàng "Đã giao"
                  </Text>
                </Col>
              </Row>
            </Card>
          </>
        )}
      </Spin>
    </motion.div>
  );
};

export default RevenueReport;