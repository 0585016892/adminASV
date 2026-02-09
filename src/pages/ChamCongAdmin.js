import React, { useState, useEffect, useCallback } from "react";
import { 
  Card, Row, Col, DatePicker, Button, Table, 
  Tag, Space, Modal, Statistic, Divider, 
  Typography, Breadcrumb, App, Spin, List 
} from "antd";
import { 
  CalendarOutlined, 
  FileExcelOutlined, 
  DollarCircleOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExportOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { 
  getChamCongByDate, 
  exportChamCongByMonth, 
  getSalarySummary, 
  saveSalary, 
  checkSalarySaved 
} from "../api/chamcongApi";
import { saveAs } from "file-saver";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;

const ChamCongAdmin = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [chamCongData, setChamCongData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [salaryDetail, setSalaryDetail] = useState(null);
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  // Lấy dữ liệu chấm công theo ngày
  const fetchData = useCallback(async (date) => {
    setLoading(true);
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const res = await getChamCongByDate(formattedDate);
      if (res.success) setChamCongData(res.data);
      else setChamCongData([]);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể lấy dữ liệu chấm công");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, fetchData]);

  // Xuất file Excel
  const handleExport = async () => {
    setExporting(true);
    const monthStr = selectedMonth.format("YYYY-MM");
    try {
      const res = await exportChamCongByMonth(monthStr);
      if (res) {
        saveAs(new Blob([res.data]), `ChamCong_${monthStr}.xlsx`);
        showSuccessToast("Thành công", "Đã xuất file báo cáo tháng");
      }
    } catch {
      showErrorToast("Lỗi", "Không thể xuất file Excel");
    } finally {
      setExporting(false);
    }
  };

  // Xem chi tiết lương
  const handleViewSalaryDetail = async (emp) => {
    const year = dayjs().year();
    const month = dayjs().month() + 1;
    try {
      const [salaryRes, checkRes] = await Promise.all([
        getSalarySummary(emp.id, year, month),
        checkSalarySaved(emp.id, year, month)
      ]);

      setSalaryDetail({
        ...salaryRes.data,
        user_id: emp.id,
        full_name: emp.full_name,
        email: emp.email,
        year,
        month,
        saved: checkRes.saved,
      });
      setShowSalaryModal(true);
    } catch {
      showErrorToast("Lỗi", "Không thể lấy bảng tính lương");
    }
  };

  // Lưu lương
  const handleSaveSalary = async () => {
    setSaving(true);
    try {
      await saveSalary(salaryDetail);
      showSuccessToast("Thành công", "Đã lưu bảng lương vào hệ thống");
      setSalaryDetail(prev => ({ ...prev, saved: true }));
      setShowSalaryModal(false);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể lưu bảng lương");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'STT', key: 'index', width: 60, render: (_, __, i) => i + 1 },
    { 
      title: 'Nhân viên', 
      key: 'name', 
      render: (record) => (
        <div>
          <Text strong>{record.full_name}</Text><br/>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.position}</Text>
        </div>
      ) 
    },
    { title: 'Phòng ban', dataIndex: 'department', key: 'dept' },
    { 
      title: 'Check-in', 
      key: 'in',
      render: (record) => record.check_in_time ? (
        <Tag color="blue">{dayjs(record.check_in_time).format("HH:mm:ss")}</Tag>
      ) : <Tag color="default">Vắng</Tag>
    },
    { 
      title: 'Check-out', 
      key: 'out',
      render: (record) => record.check_out_time ? (
        <Tag color="cyan">{dayjs(record.check_out_time).format("HH:mm:ss")}</Tag>
      ) : <Tag color="default">--:--</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (record) => (
        <Button 
          type="primary" 
          ghost 
          icon={<DollarCircleOutlined />} 
          onClick={() => handleViewSalaryDetail(record)}
        >
          Tính lương
        </Button>
      )
    }
  ];

  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Breadcrumb items={[{ title: 'Nhân sự' }, { title: 'Quản lý chấm công' }]} />
          <Title level={3} style={{ marginTop: 8 }}><CalendarOutlined /> Chấm công & Lương</Title>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        {/* Cột điều khiển trái */}
        <Col xs={24} lg={7}>
          <Card title="Bộ lọc & Tiện ích" bordered={false} className="shadow-sm mb-4">
            <Space direction="vertical" className="w-100" size="large">
              <div>
                <Text strong><CalendarOutlined /> Chọn ngày xem dữ liệu:</Text>
                <DatePicker 
                  className="w-100 mt-2" 
                  value={selectedDate} 
                  onChange={(d) => d && setSelectedDate(d)}
                  format="DD/MM/YYYY"
                />
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div>
                <Text strong><FileExcelOutlined /> Xuất báo cáo tháng:</Text>
                <DatePicker 
                  picker="month" 
                  className="w-100 mt-2 mb-2" 
                  value={selectedMonth}
                  onChange={(m) => m && setSelectedMonth(m)}
                />
                <Button 
                  block 
                  icon={<ExportOutlined />} 
                  loading={exporting} 
                  onClick={handleExport}
                  style={{ background: '#5d4037', color: '#fff' }}
                >
                  Xuất file Excel
                </Button>
              </div>
            </Space>
          </Card>

          <Card className="shadow-sm" bordered={false}>
            <Statistic 
              title="Tổng số nhân viên đi làm hôm nay" 
              value={chamCongData.length} 
              prefix={<CheckCircleOutlined />} 
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>

        {/* Cột bảng dữ liệu phải */}
        <Col xs={24} lg={17}>
          <Card 
            title={<span>Dữ liệu ngày: <Text type="danger">{selectedDate.format("DD/MM/YYYY")}</Text></span>}
            bordered={false} 
            className="shadow-sm"
          >
            <Table 
              columns={columns} 
              dataSource={chamCongData} 
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 8 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal Chi tiết lương */}
      <Modal
        title={<Space><DollarCircleOutlined /> Quyết toán lương tháng {salaryDetail?.month}</Space>}
        open={showSalaryModal}
        onCancel={() => setShowSalaryModal(false)}
        width={500}
        centered
        footer={[
          <Button key="back" onClick={() => setShowSalaryModal(false)}>Đóng</Button>,
          <Button 
            key="save" 
            type="primary" 
            loading={saving} 
            disabled={salaryDetail?.saved}
            onClick={handleSaveSalary}
            style={salaryDetail?.saved ? {} : { background: '#5d4037' }}
          >
            {salaryDetail?.saved ? "Đã lưu vào hệ thống" : "Xác nhận & Lưu lương"}
          </Button>
        ]}
      >
        {salaryDetail && (
          <div className="py-2">
            <div className="text-center mb-4">
              <Title level={4} style={{ margin: 0 }}>{salaryDetail.full_name}</Title>
              <Text type="secondary">{salaryDetail.email}</Text>
            </div>
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" className="bg-light">
                  <Statistic title="Ngày công" value={salaryDetail.soNgayCong} suffix="/ 26" />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="bg-light">
                  <Statistic title="Tổng giờ" value={salaryDetail.tongGio} suffix="h" />
                </Card>
              </Col>
            </Row>

            <Divider orientation="left" style={{ fontSize: '12px' }}>Chi tiết vi phạm & tăng ca</Divider>
            
            <List size="small">
              <List.Item>
                <Space><ClockCircleOutlined /> Đi trễ / Về sớm:</Space>
                <Text type="danger">{salaryDetail.soLanTre} lần / {salaryDetail.soLanVeSom} lần</Text>
              </List.Item>
              <List.Item>
                <Space><InfoCircleOutlined /> Tăng ca (OT):</Space>
                <Text strong>{salaryDetail.tongGioTangCa} giờ</Text>
              </List.Item>
            </List>

            <Divider orientation="left" style={{ fontSize: '12px' }}>Tổng hợp thu nhập</Divider>
            
            <div style={{ padding: '15px', background: '#f0ece1', borderRadius: '8px' }}>
              <Row justify="space-between" className="mb-2">
                <Text>Lương chính:</Text>
                <Text strong>{salaryDetail.luongNgay.toLocaleString()} đ</Text>
              </Row>
              <Row justify="space-between" className="mb-2">
                <Text>Thưởng OT:</Text>
                <Text strong>{salaryDetail.luongTangCa.toLocaleString()} đ</Text>
              </Row>
              <Divider style={{ margin: '10px 0' }} />
              <Row justify="space-between">
                <Title level={4} style={{ color: '#5d4037', margin: 0 }}>THỰC NHẬN:</Title>
                <Title level={4} style={{ color: '#5d4037', margin: 0 }}>
                  {salaryDetail.tongLuong.toLocaleString()} đ
                </Title>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChamCongAdmin;