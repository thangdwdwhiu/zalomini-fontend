import { memo, useState, useEffect, useContext, useCallback, useRef } from "react";
import styles from "../home.module.css";
import { AuthContext } from "../../../context/AuthContext";
import ChatListSearch from "./ChatListSearch";
import ChatListContact from "./ChatListContact";
import Conversation from "./conversation/Conversation";
import Robot from "../../../components/robot/Robot";

const url = import.meta.env.VITE_API_URL;

export default memo(function ChatList() {
  const { logout, socket, user, toast } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [userChat, setUserChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeContact, setActiveContact] = useState();
  const [soundEnabled, setSoundEnabled] = useState(true); // Bật/tắt âm thanh

  const API_URL = import.meta.env.VITE_API_URL;
  const conversationRef = useRef();
  const notificationSoundRef = useRef(null);

  // 🔔 Khởi tạo Audio object
  useEffect(() => {
    // Cách 1: Dùng file âm thanh từ public folder
    // notificationSoundRef.current = new Audio('/sounds/notification.mp3');
    
    // Cách 2: Dùng âm thanh mặc định từ data URL (không cần file)
    notificationSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE'); // Âm thanh ngắn
    
    notificationSoundRef.current.volume = 0.5; // Âm lượng 50%
  }, []);

  // 🔊 Hàm phát âm thanh
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && notificationSoundRef.current) {
      notificationSoundRef.current.currentTime = 0; // Reset về đầu
      notificationSoundRef.current.play().catch(err => {
        console.warn('Không thể phát âm thanh:', err);
      });
    }
  }, [soundEnabled]);

  // 🔹 Lắng nghe tin nhắn mới từ socket
  useEffect(() => {
    const handleNewMessage = (message) => {
      // ✅ Xác định ID của người còn lại trong cuộc trò chuyện
      const otherUserId = message.sender_id === user.user_id 
          ? message.receiver_id 
          : message.sender_id;

      // 🔔 Phát âm thanh nếu tin nhắn KHÔNG phải do mình gửi
      if (message.sender_id !== user.user_id) {
        playNotificationSound();
        toast.success(`tin nhắn mới`)
        
        // 📢 Hiển thị browser notification (nếu được phép)
        if (Notification.permission === 'granted' && document.hidden) {
          const contact = contacts.find(c => c.user_id === otherUserId);
          new Notification(contact?.fullname || 'Tin nhắn mới', {
            body: message.message_type === 'image' ? '📷 Đã gửi một ảnh' : message.content,
            icon: contact?.avatar || '/default-avatar.png',
            tag: `msg-${otherUserId}`, // Tránh spam nhiều notification
          });
        }
      }

      // ✅ Cập nhật contact đúng người và sắp xếp lại
      setContacts((prev) => {
        const updated = prev.map((c) =>
          c.user_id === otherUserId
            ? {
                ...c,
                sender_id_last: message.sender_id,
                last_message: message.message_type === 'image' ? '[Ảnh]' : message.content,
                last_time: new Date().toISOString(),
                is_read: message.receiver_id === user.user_id ? 0 : c.is_read,
              }
            : c
        );
        
        return updated.sort((a, b) => new Date(b.last_time) - new Date(a.last_time));
      });

      // ✅ Gọi addMessage (đã có logic lọc bên trong)
      if (conversationRef.current) {
        conversationRef.current.addMessage(message);
      }
    };

    socket.current.on("newMessage", handleNewMessage);
    return () => socket.current.off("newMessage", handleNewMessage);
  }, [socket, user.user_id, playNotificationSound, contacts]);

  // 📢 Yêu cầu quyền notification khi component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 🔹 Lấy danh sách contacts
  const getContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/messages/contacts`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) return logout();

      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
      } else {
        console.warn("⚠️ API:", data.message || "Không có dữ liệu");
      }
    } catch (err) {
      console.error("⌠Lỗi lấy danh sách liên hệ:", err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL, logout]);

  useEffect(() => {
    getContacts();
  }, [getContacts]);

  // 🔹 Chọn người chat
  const handleChat = useCallback(async (contact) => {
    setUserChat(contact);
    setActiveContact(contact.user_id);

    try {
      const res = await fetch(`${url}/messages/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friendID: contact.user_id }),
      });

      if (res.status === 401) return logout();

      const data = await res.json();
      if (data.success) {
        setContacts(prev =>
          prev.map(c =>
            c.user_id === contact.user_id
              ? { ...c, is_read: 1 }
              : c
          )
        );
      }
    } catch (e) {
      console.error(e.message);
    }
  }, [logout]);

  return (
    <div className="w-100 h-100 d-flex">
      {/* LEFT SIDEBAR */}
      <div className={styles.contentLeft}>
        {/* Nút bật/tắt âm thanh */}
        <div className="d-flex align-items-center justify-content-between p-2">
          <h5 className="mb-0">Tin nhắn</h5>
          <button 
            style={{textDecoration: 'none'}}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-sm btn-link"
            title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          >
           Thông báo <i className={`bi ${soundEnabled ? 'bi-volume-up-fill' : 'bi-volume-mute-fill'}`}></i>
          </button>
        </div>
        
        <ChatListSearch setUserChat={setUserChat} setActiveContact={setActiveContact} />
        <div
          className="d-flex flex-column align-items-center mt-3 w-100 px-2"
          style={{ overflowY: "auto", scrollbarWidth: "none" }}
        >
          {loading ? (
            <div className="text-secondary mt-3">Đang tải danh sách...</div>
          ) : contacts.length > 0 ? (
            contacts.map((item) => (
              <ChatListContact
                key={item.user_id}
                data={item}
                active={activeContact === item.user_id}
                onClick={() => handleChat(item)}
              />
            ))
          ) : (
            <div className="text-secondary mt-3">Chưa có liên hệ nào</div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.contentRight}>
        {userChat ? (
          <Conversation ref={conversationRef} setContacts={setContacts} friendData={userChat} />
        ) : (
          <Robot />
        )}
      </div>
    </div>
  );
});