import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { 
  Card, Row, Col, Button, DatePicker, InputNumber,
  Spin, Typography, Space, Table, Empty, Tag
} from "antd";
import { 
  FireOutlined, 
  SearchOutlined, 
  TrophyOutlined,
  BarChartOutlined,
  ArrowUpOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import "chart.js/auto";

const { Title, Text } = Typography;

const TopProductsReport = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    fromDate: "2025-01-01",
    toDate: dayjs().format("YYYY-MM-DD"),
    limit: 5
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports/top-products`, {
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

  // Cấu hình Biểu đồ cột ngang (Horizontal Bar)
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "Số lượng bán ra",
        data: data.map((d) => d.total_sold),
        backgroundColor: ["#5d4037", "#8d6e63", "#a1887f", "#bcaaa4", "#d7ccc8"],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y', // Chuyển thành biểu đồ ngang
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#2c1e1a",
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      x: { 
        beginAtZero: true, 
        grid: { display: false },
        ticks: { precision: 0 }
      },
      y: { 
        grid: { drawBorder: false, color: "#f5f5f5" },
        ticks: {
          font: { size: 12, weight: '500' }
        }
      },
    },
  };

  const columns = [
    {
      title: 'HẠNG',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (_, __, index) => {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        return index < 3 ? (
          <TrophyOutlined style={{ color: colors[index], fontSize: '20px' }} />
        ) : (
          <Text type="secondary">#{index + 1}</Text>
        );
      }
    },
    {
      title: 'SẢN PHẨM',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'ĐÃ BÁN',
      dataIndex: 'total_sold',
      key: 'total_sold',
      align: 'right',
      render: (val) => (
        <Space>
          <Text strong>{val}</Text>
          <Tag color="success" icon={<ArrowUpOutlined />} bordered={false}>Sản phẩm hot</Tag>
        </Space>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <style>{`
        .product-table .ant-table-thead > tr > th { background: #fafafa; font-size: 11px; }
        .filter-card { border-radius: 12px; border: 1px solid #f0ece1; margin-bottom: 24px; }
      `}</style>

      {/* Filter Section */}
      <Card className="filter-card shadow-sm">
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={10}>
            <Text type="secondary">Giai đoạn báo cáo</Text>
            <DatePicker.RangePicker 
              className="w-100 mt-2"
              defaultValue={[dayjs(filters.fromDate), dayjs(filters.toDate)]}
              onChange={(dates) => {
                if (dates) setFilters({...filters, fromDate: dates[0].format("YYYY-MM-DD"), toDate: dates[1].format("YYYY-MM-DD")});
              }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Text type="secondary">Số lượng hiển thị</Text>
            <InputNumber 
              className="w-100 mt-2" 
              min={1} max={20}
              value={filters.limit}
              onChange={(val) => setFilters({...filters, limit: val})}
            />
          </Col>
          <Col xs={12} md={8}>
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={fetchData} 
              className="w-100 mt-2"
              style={{ background: "#5d4037", borderColor: "#5d4037", height: '40px' }}
            >
              Phân tích xu hướng
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {data.length === 0 ? (
          <Empty description="Không tìm thấy dữ liệu sản phẩm bán chạy" />
        ) : (
          <Row gutter={[24, 24]}>
            {/* Biểu đồ trực quan */}
            <Col xs={24} lg={12}>
              <Card 
                title={<Space><BarChartOutlined /> Biểu đồ doanh số</Space>} 
                className="shadow-sm border-0 rounded-4"
              >
                <div style={{ height: "400px" }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </Card>
            </Col>

            {/* Bảng chi tiết */}
            <Col xs={24} lg={12}>
              <Card 
                title={<Space><FireOutlined style={{ color: '#ff4d4f' }} /> Bảng xếp hạng sản phẩm</Space>} 
                className="shadow-sm border-0 rounded-4"
              >
                <Table 
                  className="product-table"
                  dataSource={data} 
                  columns={columns} 
                  pagination={false} 
                  rowKey="name"
                  size="middle"
                />
                <div className="mt-4 p-3 bg-light rounded-3">
                  <Text type="secondary" italic style={{ fontSize: '12px' }}>
                    * Danh sách dựa trên tổng số lượng sản phẩm đã được thanh toán và giao hàng thành công.
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Spin>
    </motion.div>
  );
};

export default TopProductsReport;