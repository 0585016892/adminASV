import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
const URL_WEB = process.env.REACT_APP_WEB_URL; // Cập nhật URL nếu khác

const socket = io(`${URL_WEB}`); // Đổi lại nếu chạy production

const ChatUser = () => {
  const API_URL = process.env.REACT_APP_API_URL; // Cập nhật URL nếu khác

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [unreadUsers, setUnreadUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "online" | "offline"

  // Lọc user theo search term
  const filteredUsers = users.filter((user) =>
    (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lọc theo trạng thái online/offline
  const displayedUsers = filteredUsers.filter((user) => {
    if (filterStatus === "online") return onlineUsers.includes(user);
    if (filterStatus === "offline") return !onlineUsers.includes(user);
    return true;
  });

  // Cập nhật selectedUserRef mỗi lần selectedUser thay đổi
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Lắng nghe cập nhật danh sách online users từ server
  useEffect(() => {
    socket.on("update_online_users", (onlineList) => {
      setOnlineUsers(onlineList);
    });

    return () => socket.off("update_online_users");
  }, []);

  // Đăng ký socket và lắng nghe tin nhắn
  useEffect(() => {
    socket.emit("register", "admin");

    const handleMessage = (msg) => {
      const sender = msg.sender;
      msg.timestamp = msg.timestamp || new Date().toISOString();

      setMessages((prev) => {
        const userMsgs = prev[sender] || [];
        const isDuplicate = userMsgs.some(
          (m) =>
            m.content === msg.content &&
            m.sender === msg.sender &&
            m.receiver === msg.receiver &&
            m.timestamp === msg.timestamp
        );
        if (isDuplicate) return prev;
        return {
          ...prev,
          [sender]: [...userMsgs, msg],
        };
      });

      if (sender !== "admin" && sender !== selectedUserRef.current) {
        setUnreadUsers((prev) =>
          prev.includes(sender) ? prev : [...prev, sender]
        );
      }
    };

    socket.on("receive_private_message", handleMessage);
    return () => socket.off("receive_private_message", handleMessage);
  }, []);

  // Lấy danh sách user từ API
  useEffect(() => {
    axios.get(`${API_URL}/chat`).then((res) => setUsers(res.data));
  }, []);

  // Auto scroll khi có tin nhắn mới hoặc đổi user chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedUser]);
  useEffect(() => {
    socket.on("update_online_users", (onlineList) => {
      setOnlineUsers(onlineList);
    });

    return () => socket.off("update_online_users");
  }, []);
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

  const renderAvatar = (username) => {
    const letter =
      typeof username === "string" && username.length > 0
        ? username.charAt(0).toUpperCase()
        : "?";

    return (
      <div
        className="rounded-circle d-flex align-items-center justify-content-center me-2"
        style={{
          width: "35px",
          height: "35px",
          backgroundColor: "#8282cf",
          color: "white",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        {letter}
      </div>
    );
  };
  function formatMessage(content) {
    // Tự động phát hiện URL và tạo thẻ <a> có màu xanh
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const linkedText = content.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">${url}</a>`
    );

    // Đổi xuống dòng nếu có \n
    return linkedText.replace(/\n/g, "<br/>");
  }
  return (
    <div className="container-fluid mt-md-4 h-100vh" style={{ paddingLeft: "35px" }}>
      <div className="row flex-grow-1 shadow rounded overflow-hidden">
        {/* Sidebar */}
        <div className="p-2">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="p-2 d-flex gap-2 justify-content-center">
          <button
            className={`btn btn-sm ${
              filterStatus === "all" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setFilterStatus("all")}
          >
            Tất cả
          </button>
          <button
            className={`btn btn-sm ${
              filterStatus === "online" ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() => setFilterStatus("online")}
          >
            Online
          </button>
          <button
            className={`btn btn-sm ${
              filterStatus === "offline"
                ? "btn-secondary"
                : "btn-outline-secondary"
            }`}
            onClick={() => setFilterStatus("offline")}
          >
            Offline
          </button>
        </div>
        <div className="col-md-3 vh-100 bg-light border-end d-flex flex-column">
          <h5 className="text-center py-3 border-bottom">
            👥 Danh sách người dùng
          </h5>
          <div className="flex-grow-1 overflow-auto px-3">
            {displayedUsers.length === 0 && (
              <p className="text-muted text-center mt-3">Không có user nào</p>
            )}
            {displayedUsers.map((user) => (
              <div
                key={user.userId}
                className={`d-flex align-items-center justify-content-between p-2 mb-2 rounded ${
                  user.userId === selectedUser
                    ? "bg-primary text-white"
                    : "bg-white"
                }`}
                style={{ cursor: "pointer", border: "1px solid #ddd" }}
                onClick={() => handleSelectUser(user.userId)}
              >
                <div className="d-flex align-items-center">
                  {renderAvatar(user)}

                  {/* Chấm trạng thái online/offline */}
                  <span
                    className="rounded-circle me-2"
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: onlineUsers
                        .map((u) => u.toString())
                        .includes(user.userId.toString())
                        ? "#28a745"
                        : "#6c757d",
                      display: "inline-block",
                    }}
                  ></span>
                  <span>{user.full_name}</span>
                </div>
                {unreadUsers.includes(user.userId) && (
                  <span
                    className="badge bg-danger rounded-circle"
                    style={{ width: "10px", height: "10px" }}
                  ></span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat box */}
        <div className="col-md-9 vh-100  d-flex flex-column bg-white">
          <div className="p-3 border-bottom bg-light">
            <h5>
              💬 Đang chat với khách hàng
              {selectedUser || "Chọn user để bắt đầu"}
            </h5>
          </div>
          <div
            className="flex-grow-1 overflow-auto p-3"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            {(messages[selectedUser] || []).map((msg, index) => {
              const time = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={index}
                  className={`d-flex ${
                    msg.sender === "admin" || msg.sender === "bot"
                      ? "justify-content-end"
                      : "justify-content-start"
                  } mb-3`}
                >
                  {msg.sender !== "admin" && renderAvatar(msg.sender)}
                  <div>
                    {msg.sender === "bot" && (
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        🤖 Trả lời tự động
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-4 shadow-sm ${
                        msg.sender === "admin"
                          ? "bg-success text-white"
                          : "bg-white"
                      }`}
                      style={{}}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(msg.content),
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.75rem",
                          marginTop: "4px",
                          opacity: 0.6,
                          textAlign: msg.sender === "admin" ? "right" : "left",
                        }}
                      >
                        {time}
                      </div>
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Product"
                          style={{
                            width: "20%",
                            borderRadius: "10px",
                            marginTop: "5px",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {selectedUser && (
            <div className="p-3 border-top d-flex gap-2 bg-light">
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="btn btn-primary" onClick={sendMessage}>
                Gửi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatUser;
