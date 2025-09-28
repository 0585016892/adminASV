import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Form, InputGroup, Dropdown } from "react-bootstrap";
import { FiMessageCircle, FiX, FiSend, FiMoreHorizontal } from "react-icons/fi";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const ChatWidget = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào 👋! Mình có thể giúp gì cho bạn hôm nay?" },
  ]);
  const [input, setInput] = useState("");
  const [coupons, setCoupons] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll chat xuống dưới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  // Lấy danh sách coupon từ backend
  useEffect(() => {
    axios.get(`${API_URL}/assistant/coupons`)
      .then(res => {
        if (res.data.success) setCoupons(res.data.coupons);
      })
      .catch(err => console.error(err));
  }, []);

  const formatCurrency = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString("vi-VN", { minimumFractionDigits: 0 }) + " ₫";
  };

  const handleSend = async (customInput) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;

    const newMessage = { from: "user", text: textToSend, time: new Date() };
    setMessages(prev => [...prev, newMessage]);
    setInput("");

    const typingMsgId = Date.now();
    setMessages(prev => [...prev, { from: "bot", text: "Đang soạn tin...", typing: true, id: typingMsgId }]);

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      let answer = "";

      if (textToSend.toLowerCase().includes("gửi mã") && textToSend.toLowerCase().includes("cho khách")) {
        const regex = /gửi mã\s+["']?(.+?)["']?\s+cho khách hàng/i;
        const match = textToSend.match(regex);

        if (!match || !match[1]) {
          answer = "⚠️ Không tìm thấy tên mã giảm giá. Vui lòng chọn lại.";
        } else {
          const couponName = match[1].trim();
          await axios.post(`${API_URL}/assistant/send-coupon-email`, { couponName });
          answer = "✅ Đã gửi email cho tất cả khách hàng!";
        }
      } else {
        const res = await axios.post(`${API_URL}/assistant/ask`, { question: textToSend });
        answer = res.data.answer || "Xin lỗi, mình chưa hiểu 🥲";
        if (res.data.revenue) answer = `${res.data.revenue} (${formatCurrency(res.data.revenue)})`;
      }

      const typingDelay = Math.min(answer.length * 50, 2000);
      await delay(typingDelay);

      setMessages(prev =>
        prev.map(m => m.id === typingMsgId ? { from: "bot", text: answer, time: new Date() } : m)
      );

    } catch {
      setMessages(prev =>
        prev.map(m => m.id === typingMsgId ? { from: "bot", text: "⚠️ Server lỗi, vui lòng thử lại sau.", time: new Date() } : m)
      );
    }
  };
  const suggestions = [
    { text: "Doanh thu hôm nay" },
    { text: "Doanh thu tháng này" },
    { text: "Đơn hàng trong tuần." },
  ];

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}>
      {!isOpen && (
        <Button variant="primary" className="rounded-circle p-3 shadow" onClick={() => setIsOpen(true)}>
          <FiMessageCircle size={22} />
        </Button>
      )}

      {isOpen && (
        <Card style={{ width: "300px", height: "400px", borderRadius: "15px" }} className="shadow">
          <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
            <span>💬 Trợ lí Âm Sắc Màu</span>
            <Button variant="light" size="sm" className="p-0 d-flex align-items-center justify-content-center" onClick={() => setIsOpen(false)}>
              <FiX />
            </Button>
          </Card.Header>

          <Card.Body style={{ overflowY: "auto", padding: "10px", backgroundColor: "#f5f5f5" }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.25 }}
                  className={`d-flex mb-2 ${msg.from === "user" ? "justify-content-end" : "justify-content-start"}`}
                >
                  {msg.from === "bot" && (
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                         style={{ width: "28px", height: "28px", fontSize: "14px" }}>🤖</div>
                  )}
                  <div className="p-2 rounded"
                       style={{
                         maxWidth: "70%",
                         backgroundColor: msg.from === "user" ? "#0d6efd" : "#ffffff",
                         color: msg.from === "user" ? "#fff" : "#000",
                         borderRadius: msg.from === "user" ? "15px 15px 0 15px" : "15px 15px 15px 0",
                         fontStyle: msg.typing ? "italic" : "normal",
                         opacity: msg.typing ? 0.7 : 1
                       }}>
                    {msg.text}
                    <div style={{ fontSize: "10px", color: "#888", textAlign: "right", marginTop: "2px" }}>
                      {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Card.Body>

          <Card.Footer className="p-2 bg-white">
            <InputGroup>
              <Form.Control
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />

              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-suggestions" style={{ marginRight: "2px" }}>
                  <FiMoreHorizontal />
                </Dropdown.Toggle>

                <Dropdown.Menu style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {suggestions.map((s, idx) => (
                    <Dropdown.Item key={idx} onClick={() => handleSend(s.text)}>
                      {s.text}
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                  <p>
                    Gửi mã giảm giá cho tất cả khách hàng
                  </p>
                    {coupons
                      .filter(c => c.description === "0" && Number(c.quantity) > 0  &&  new Date(c.end_date) >= new Date())
                      .map((c, idx) => (
                        <Dropdown.Item
                          key={idx}
                          onClick={() => handleSend(`Gửi mã "${c.code}" cho khách hàng`)}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <span>🎟️ {c.code}</span>
                          <span className="badge bg-success">{c.discount_type === "percent"
                                    ? `${Number(c.discount_value)}%`
                                    : `${Number(c.discount_value).toLocaleString("vi-VN")} VND`}</span>
                        </Dropdown.Item>
                      ))
                    }
                    {coupons.filter(c => c.description === "0" && Number(c.quantity) > 0).length === 0 && (
                      <Dropdown.Item disabled>Không có mã giảm giá khả dụng</Dropdown.Item>
                    )}
                </Dropdown.Menu>
              </Dropdown>

              <Button variant="primary" onClick={() => handleSend()}>
                <FiSend />
              </Button>
            </InputGroup>
          </Card.Footer>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;
