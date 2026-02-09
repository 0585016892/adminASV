import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { 
  Layout, List, Avatar, Input, Button, Badge, 
  Tag, Typography, Space,  Empty 
} from "antd";
import { 
  SearchOutlined, 
  SendOutlined, 
  UserOutlined, 
  MessageOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

const URL_WEB = process.env.REACT_APP_WEB_URL;
const API_URL = process.env.REACT_APP_API_URL;
const socket = io(`${URL_WEB}`);

const ChatUser = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [unreadUsers, setUnreadUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(null);

  // LOGIC GIỮ NGUYÊN
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    socket.emit("register", "admin");
    socket.on("update_online_users", (onlineList) => setOnlineUsers(onlineList));
    socket.on("receive_private_message", (msg) => {
      const sender = msg.sender;
      msg.timestamp = msg.timestamp || new Date().toISOString();
      setMessages((prev) => {
        const userMsgs = prev[sender] || [];
        if (userMsgs.some((m) => m.timestamp === msg.timestamp)) return prev;
        return { ...prev, [sender]: [...userMsgs, msg] };
      });
      if (sender !== "admin" && sender !== selectedUserRef.current) {
        setUnreadUsers((prev) => prev.includes(sender) ? prev : [...prev, sender]);
      }
    });
    return () => socket.off("receive_private_message");
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/chat`).then((res) => setUsers(res.data));
  }, [API_URL]);

  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUnreadUsers((prev) => prev.filter((u) => u !== user));
    if (!messages[user]) {
      axios.get(`${API_URL}/chat/conversation/${user}`).then((res) => {
        const msgs = res.data.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp || new Date().toISOString(),
        }));
        setMessages((prev) => ({ ...prev, [user]: msgs }));
      });
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedUser) return;
    const msg = {
      sender: "admin",
      receiver: selectedUser,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    socket.emit("send_private_message", msg);
    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), msg],
    }));
    setInput("");
  };

  // UI HELPERS
  const formatMessage = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlRegex, (url) => 
      `<a href="${url}" target="_blank" style="color:#1890ff; text-decoration: underline;">${url}</a>`
    ).replace(/\n/g, "<br/>");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase().trim());
    const isOnline = onlineUsers.includes(user.userId.toString());
    
    if (!matchesSearch) return false;
    if (filterStatus === "online") return isOnline;
    if (filterStatus === "offline") return !isOnline;
    return true;
  });

  return (
    <Layout style={{ height: "calc(100vh - 40px)", background: "#fff", borderRadius: 16, overflow: "hidden", margin: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      {/* Sidebar - List Users */}
      <Sider width={320} theme="light" style={{ borderRight: "1px solid #f0f0f0" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0" }}>
          <Title level={4} style={{ color: "#1890ff", marginBottom: 16 }}>
            <MessageOutlined /> Hội thoại
          </Title>
          <Input
            placeholder="Tìm khách hàng..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ borderRadius: 8, marginBottom: 12 }}
          />
          <Space wrap size={4}>
            <Button size="small" type={filterStatus === "all" ? "primary" : "default"} onClick={() => setFilterStatus("all")}>Tất cả</Button>
            <Button size="small" type={filterStatus === "online" ? "primary" : "default"} onClick={() => setFilterStatus("online")} icon={<CheckCircleOutlined />}>Online</Button>
            <Button size="small" type={filterStatus === "offline" ? "primary" : "default"} onClick={() => setFilterStatus("offline")}>Offline</Button>
          </Space>
        </div>

        <List
          className="chat-user-list"
          style={{ height: "calc(100% - 140px)", overflowY: "auto", padding: "8px" }}
          dataSource={filteredUsers}
          renderItem={(user) => {
            const isOnline = onlineUsers.includes(user.userId.toString());
            const isSelected = user.userId === selectedUser;
            return (
              <List.Item
                onClick={() => handleSelectUser(user.userId)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  cursor: "pointer",
                  marginBottom: 4,
                  border: "none",
                  backgroundColor: isSelected ? "#e6f7ff" : "transparent",
                  transition: "all 0.3s"
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot status={isOnline ? "success" : "default"} offset={[-2, 32]}>
                      <Avatar 
                        style={{ backgroundColor: isSelected ? "#1890ff" : "#ccc" }}
                        icon={<UserOutlined />}
                      >
                        {user.full_name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  }
                  title={<Text strong={isSelected} style={{ color: isSelected ? "#1890ff" : "inherit" }}>{user.full_name}</Text>}
                  description={
                    <Space size={4}>
                      {isOnline ? <Tag color="success" style={{ fontSize: 10, lineHeight: '16px' }}>Online</Tag> : <Text type="secondary" style={{ fontSize: 12 }}>Offline</Text>}
                    </Space>
                  }
                />
                {unreadUsers.includes(user.userId) && <Badge count="!" style={{ backgroundColor: '#ff4d4f' }} />}
              </List.Item>
            );
          }}
        />
      </Sider>

      {/* Main Chat Content */}
      <Layout style={{ background: "#fff" }}>
        <Content style={{ display: "flex", flexDirection: "column" }}>
          {/* Chat Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
            {selectedUser ? (
              <Space>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {users.find(u => u.userId === selectedUser)?.full_name}
                  </Title>
                  <Text type="secondary" size="small">
                    {onlineUsers.includes(selectedUser.toString()) ? "Đang hoạt động" : "Ngoại tuyến"}
                  </Text>
                </div>
              </Space>
            ) : (
              <Text type="secondary">Vui lòng chọn một hội thoại để bắt đầu</Text>
            )}
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f0f2f5" }}>
            {!selectedUser ? (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Empty description="Chưa có tin nhắn nào" />
              </div>
            ) : (
              (messages[selectedUser] || []).map((msg, i) => {
                const isAdmin = ["admin", "bot"].includes(msg.sender);
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start", marginBottom: 16 }}>
                    {!isAdmin && <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8, marginTop: 4 }} />}
                    <div style={{ maxWidth: "70%" }}>
                      <div style={{
                        padding: "10px 16px",
                        borderRadius: isAdmin ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                        background: isAdmin ? "#1890ff" : "#fff",
                        color: isAdmin ? "#fff" : "#000",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                      }}>
                        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4, textAlign: isAdmin ? "right" : "left" }}>
                        {dayjs(msg.timestamp).format("HH:mm")}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          {selectedUser && (
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  size="large"
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPressEnter={sendMessage}
                  autoFocus
                />
                <Button 
                  size="large" 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={sendMessage}
                  disabled={!input.trim()}
                >
                  Gửi
                </Button>
              </Space.Compact>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChatUser;