import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { 
  Card, Row, Col, Form, Button, DatePicker, 
  InputNumber, Spin, Table, Typography, Space, Empty, Divider 
} from "antd";
import { 
  SearchOutlined, 
  UsergroupAddOutlined, 
  PieChartOutlined,
  CalendarOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import "chart.js/auto";

const { Title, Text } = Typography;

const CustomersReport = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State cho bộ lọc
  const [filters, setFilters] = useState({
    fromDate: "2025-01-01",
    toDate: dayjs().format("YYYY-MM-DD"),
    limit: 5
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports/customers`, {
        params: { 
          from_date: filters.fromDate, 
          to_date: filters.toDate, 
          limit: filters.limit 
        },
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

  const chartData = {
    labels: data.map((d) => d.customer_group),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: ["#5d4037", "#8d6e63", "#bcaaa4", "#d7ccc8", "#f5f5f5"],
        hoverBackgroundColor: ["#3e2723", "#5d4037", "#8d6e63", "#a1887f", "#e0e0e0"],
        borderWidth: 0,
        cutout: "70%", // Tạo biểu đồ vòng (Ring chart) hiện đại hơn
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 20 } },
    },
    maintainAspectRatio: false,
  };

  const columns = [
    {
      title: 'NHÓM KHÁCH HÀNG',
      dataIndex: 'customer_group',
      key: 'customer_group',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'SỐ LƯỢNG',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      render: (val) => <Text style={{ color: '#5d4037' }}>{val} khách</Text>
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`
        .filter-bar { background: #fafafa; padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #f0f0f0; }
        .chart-container { height: 320px; position: relative; }
        .total-badge { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
      `}</style>

      {/* Bộ lọc thông minh */}
      <div className="filter-bar">
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={10} md={8}>
            <Text type="secondary"><CalendarOutlined /> Khoảng thời gian</Text>
            <DatePicker.RangePicker 
              className="w-100 mt-2"
              defaultValue={[dayjs(filters.fromDate), dayjs(filters.toDate)]}
              onChange={(dates) => {
                if (dates) {
                  setFilters({...filters, fromDate: dates[0].format("YYYY-MM-DD"), toDate: dates[1].format("YYYY-MM-DD")});
                }
              }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Text type="secondary">Giới hạn nhóm</Text>
            <InputNumber 
              className="w-100 mt-2" 
              min={1} 
              value={filters.limit} 
              onChange={(val) => setFilters({...filters, limit: val})}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={fetchData} 
              className="w-100"
              style={{ background: "#5d4037", borderColor: "#5d4037" }}
            >
              Lọc dữ liệu
            </Button>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        {data.length === 0 ? (
          <Empty description="Không có dữ liệu khách hàng" />
        ) : (
          <Row gutter={24}>
            {/* Cột trái: Biểu đồ */}
            <Col xs={24} lg={10}>
              <Card title={<Space><PieChartOutlined /> Phân bổ nhóm</Space>} className="shadow-sm border-0 rounded-4">
                <div className="chart-container">
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="total-badge">
                    <Title level={4} style={{ margin: 0 }}>
                      {data.reduce((sum, item) => sum + item.count, 0)}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>TỔNG CỘNG</Text>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Cột phải: Bảng chi tiết */}
            <Col xs={24} lg={14}>
              <Card title={<Space><UsergroupAddOutlined /> Chi tiết thống kê</Space>} className="shadow-sm border-0 rounded-4">
                <Table 
                  dataSource={data} 
                  columns={columns} 
                  pagination={false} 
                  rowKey="customer_group"
                  size="middle"
                />
                <Divider dashed />
                <div className="text-end px-3">
                  <Text type="secondary">Báo cáo dựa trên dữ liệu từ đơn hàng đã hoàn tất.</Text>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Spin>
    </motion.div>
  );
};

export default CustomersReport;