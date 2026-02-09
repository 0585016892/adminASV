import React, { useState, useEffect, useRef } from "react";
import { 
  Button, Card, Input, Avatar, 
 Dropdown, Space, Typography, ConfigProvider 
} from "antd";
import { 
  MessageFilled, CloseOutlined, SendOutlined, 
  EllipsisOutlined, RobotOutlined, GiftOutlined, LineChartOutlined 
} from "@ant-design/icons";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

const { Text } = Typography;

const ChatWidget = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào 👋! Mình là trợ lý Âm Sắc Màu, mình có thể giúp gì cho bạn?", time: dayjs() },
  ]);
  const [input, setInput] = useState("");
  const [coupons, setCoupons] = useState([]);
  const messagesEndRef = useRef(null);
  const widgetRef = useRef(null); // Ref để xác định vị trí hiện Menu

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);

  useEffect(() => {
    axios.get(`${API_URL}/assistant/coupons`)
      .then(res => { if (res.data.success) setCoupons(res.data.coupons); })
      .catch(err => console.error(err));
  }, [API_URL]);

  const handleSend = async (customInput) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { from: "user", text: textToSend, time: dayjs() }]);
    setInput("");

    const typingMsgId = Date.now();
    setMessages(prev => [...prev, { from: "bot", text: "Đang soạn tin...", typing: true, id: typingMsgId }]);

    try {
      let answer = "";
      if (textToSend.toLowerCase().includes("gửi mã") && textToSend.toLowerCase().includes("cho khách")) {
        const couponName = textToSend.match(/["']?(.+?)["']?\s+cho khách hàng/i)?.[1]?.trim();
        if (!couponName) {
          answer = "⚠️ Không tìm thấy tên mã giảm giá.";
        } else {
          await axios.post(`${API_URL}/assistant/send-coupon-email`, { couponName });
          answer = `✅ Đã gửi email mã "${couponName}" thành công!`;
        }
      } else {
        const res = await axios.post(`${API_URL}/assistant/ask`, { question: textToSend });
        answer = res.data.answer || "Xin lỗi, mình chưa hiểu 🥲";
      }

      setMessages(prev => prev.map(m => m.id === typingMsgId ? { from: "bot", text: answer, time: dayjs() } : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === typingMsgId ? { from: "bot", text: "⚠️ Lỗi kết nối.", time: dayjs() } : m));
    }
  };

  // Cấu trúc Menu
  const items = [
    { key: '1', label: 'Doanh thu hôm nay', icon: <LineChartOutlined />, onClick: () => handleSend("Doanh thu hôm nay") },
    { key: '2', label: 'Đơn hàng trong tuần', icon: <LineChartOutlined />, onClick: () => handleSend("Đơn hàng trong tuần") },
    { key: 'd1', type: 'divider' },
    ...coupons
      .filter(c => c.description === "0" && Number(c.quantity) > 0 && new Date(c.end_date) >= new Date())
      .map((c, i) => ({
        key: `cp-${i}`,
        icon: <GiftOutlined style={{ color: '#f5222d' }} />,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: 160 }}>
            <span>{c.code}</span>
            <Text type="success" size="small">{c.discount_type === "percent" ? `${c.discount_value}%` : 'Giảm đ'}</Text>
          </div>
        ),
        onClick: () => handleSend(`Gửi mã "${c.code}" cho khách hàng`)
      }))
  ];

  return (
    <ConfigProvider theme={{ token: { primaryColor: '#1890ff' } }}>
      <div ref={widgetRef} style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 9999 }}>
        
        <AnimatePresence>
          {!isOpen && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Button 
                type="primary" shape="circle" 
                icon={<MessageFilled style={{ fontSize: 24 }} />} 
                style={{ width: 60, height: 60, boxShadow: "0 4px 15px rgba(24,144,255,0.4)" }} 
                onClick={() => setIsOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <Card
                title={<Space><Avatar size="small" icon={<RobotOutlined />} /> <Text strong>Trợ lý Âm Sắc Màu</Text></Space>}
                extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} />}
                style={{ width: 320, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                bodyStyle={{ padding: 0 }}
              >
                <div style={{ height: 350, overflowY: "auto", padding: 12, background: "#f5f5f5" }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                      <div style={{
                        padding: "8px 12px", borderRadius: 12, fontSize: 13,
                        backgroundColor: msg.from === "user" ? "#1890ff" : "#fff",
                        color: msg.from === "user" ? "#fff" : "#000",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                      }}>{msg.text}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: 10, borderTop: "1px solid #eee" }}>
                  <Space.Compact style={{ width: '100%' }}>
                    {/* CHỖ NÀY QUAN TRỌNG: Thêm getPopupContainer */}
                    <Dropdown 
                      menu={{ items }} 
                      trigger={['click']} 
                      placement="topLeft"
                      getPopupContainer={() => widgetRef.current} 
                    >
                      <Button icon={<EllipsisOutlined />} />
                    </Dropdown>
                    <Input 
                      placeholder="Hỏi gì đó..." 
                      value={input} 
                      onChange={e => setInput(e.target.value)} 
                      onPressEnter={() => handleSend()}
                    />
                    <Button type="primary" icon={<SendOutlined />} onClick={() => handleSend()} />
                  </Space.Compact>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ConfigProvider>
  );
};

export default ChatWidget;