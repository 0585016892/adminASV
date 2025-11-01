import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaSearch, FaPaperPlane } from "react-icons/fa";

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
        setUnreadUsers((prev) =>
          prev.includes(sender) ? prev : [...prev, sender]
        );
      }
    });

    return () => socket.off("receive_private_message");
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/chat`).then((res) => setUsers(res.data));
  }, []);

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

  const formatMessage = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content
      .replace(
        urlRegex,
        (url) =>
          `<a href="${url}" target="_blank" style="color:#0d6efd;">${url}</a>`
      )
      .replace(/\n/g, "<br/>");
  };

  const renderAvatar = (username) => {
  // Xử lý nếu không phải string
  let name = "";

  if (typeof username === "string") {
    name = username;
  } else if (typeof username === "object" && username !== null) {
    // Nếu là object, thử lấy các thuộc tính thường gặp
    name = username.full_name || username.name || username.username || "";
  }

  const firstChar = name?.charAt?.(0)?.toUpperCase?.() || "?";

  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
      style={{
        width: 40,
        height: 40,
        backgroundColor: "#0d6efd",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "1rem",
      }}
    >
      {firstChar}
    </div>
  );
};


  const filteredUsers = users.filter((user) =>
    (user.full_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim())
  );

  const displayedUsers = filteredUsers.filter((user) => {
    if (filterStatus === "online")
      return onlineUsers.includes(user.userId.toString());
    if (filterStatus === "offline")
      return !onlineUsers.includes(user.userId.toString());
    return true;
  });

  return (
    <div className="d-flex flex-column flex-md-row vh-100 bg-light m-md-2">
      {/* Sidebar */}
      <div
        className="col-12 col-md-3 border-end bg-white shadow-sm d-flex flex-column ms-md-3"
        style={{ borderRadius: "16px 0 0 16px", minWidth: "250px", maxHeight: "100vh" }}
      >
        <div className="p-3 border-bottom">
          <h5 className="fw-bold text-primary mb-3">💬 Hộp thoại khách hàng</h5>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mt-2 d-flex gap-2 flex-wrap justify-content-center">
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
        </div>

        <div className="flex-grow-1 overflow-auto px-3 py-2">
          {displayedUsers.length === 0 && (
            <p className="text-muted text-center mt-4">
              Không tìm thấy người dùng
            </p>
          )}
          {displayedUsers.map((user) => (
            <div
              key={user.userId}
              onClick={() => handleSelectUser(user.userId)}
              className={`d-flex align-items-center justify-content-between p-2 rounded-3 mb-2 ${
                user.userId === selectedUser
                  ? "bg-info bg-opacity-25 border border-info"
                  : "bg-white"
              }`}
              style={{ cursor: "pointer", transition: "0.3s" }}
            >
              <div className="d-flex align-items-center">
                {renderAvatar(user.full_name)}
                <div>
                  <strong className={user.userId === selectedUser ? "text-primary" : ""}>
                    {user.full_name}
                  </strong>
                  <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                    {onlineUsers.includes(user.userId.toString())
                      ? "Đang hoạt động"
                      : "Không hoạt động"}
                  </div>
                </div>
              </div>
              {unreadUsers.includes(user.userId) && (
                <span className="badge bg-danger rounded-pill">!</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat box */}
      <div
        className="col-12 col-md-9 d-flex flex-column bg-white shadow-sm"
        style={{ borderRadius: "0 16px 16px 0", maxHeight: "100vh" }}
      >
        <div className="p-3 border-bottom bg-light d-flex align-items-center">
          <h5 className="mb-0 text-secondary">
            {selectedUser
              ? `💬 Chat với ${users.find((u) => u.userId === selectedUser)?.full_name || "Khách"}`
              : "Chọn một người để bắt đầu trò chuyện"}
          </h5>
        </div>

        <div className="flex-grow-1 overflow-auto p-4 bg-light">
          {(messages[selectedUser] || []).map((msg, i) => {
            const time = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={i}
                className={`d-flex mb-3 ${
                   ["admin", "bot"].includes(msg.sender) ? "justify-content-end" : "justify-content-start"
                }`}
              >
                {msg.sender !== "admin" && renderAvatar(msg.sender)}
                <div>
                  <div
                    className={`p-3 rounded-4 shadow-sm ${
                     ["admin", "bot"].includes(msg.sender)
                        ? "bg-primary text-white"
                        : "bg-white text-dark"
                    }`}
                    style={{ maxWidth: "100%" }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(msg.content),
                      }}
                    />
                    <div
                      style={{
                        fontSize: "0.75rem",
                        textAlign: msg.sender === "admin" ? "right" : "left",
                        opacity: 0.7,
                        marginTop: "6px",
                      }}
                    >
                      {time}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {selectedUser && (
          <div className="p-3 border-top bg-white d-flex align-items-center gap-2 flex-nowrap">
            <input
              type="text"
              className="form-control rounded-pill flex-grow-1"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="btn btn-primary rounded-circle flex-shrink-0"
              style={{ width: 45, height: 45 }}
              onClick={sendMessage}
            >
              <FaPaperPlane />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUser;
