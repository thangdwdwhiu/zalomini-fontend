import { memo, useContext, useEffect, useState, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import styles from '../../home.module.css';
import { AuthContext } from "../../../../context/AuthContext";
import LoadingHeart from "../../../../components/loading/loadingHeart";
import { useNavigate } from "react-router-dom";
import video from '../../../../assets/img/goku.mp4'

const url = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 30; // Số tin nhắn mỗi lần tải

export default memo(forwardRef(function Conversation({ friendData, setContacts }, ref) {
    const { user, logout } = useContext(AuthContext);
    const { user_id, avatar, fullname, status } = friendData;

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    
    const timeLoading = useRef();
    const imgRef = useRef(null);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const navigate = useNavigate();
    const isFirstLoad = useRef(true);
    const previousScrollHeight = useRef(0);

    // 🔹 Cho phép cha gọi các hàm trong con
    useImperativeHandle(ref, () => ({
        addMessage: (msg) => {
            // ✅ CHỈ thêm tin nhắn nếu thuộc cuộc trò chuyện hiện tại
            if (msg.sender_id === user_id || msg.receiver_id === user_id) {
                setMessages(prev => [...prev, msg]);
            }
        }
    }), [user_id]);

    // Scroll xuống cuối khi messages thay đổi (chỉ cho tin nhắn mới)
    useEffect(() => {
        if (!loadingMore) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length]);

    // Lấy danh sách tin nhắn với phân trang
    const getConversations = async (currentOffset = 0, isLoadMore = false) => {
        try {
            const res = await fetch(
                `${url}/messages/conversations/${user_id}?limit=${PAGE_SIZE}&offset=${currentOffset}`,
                {
                    method: 'GET',
                    credentials: 'include'
                }
            );
            
            if (res.status === 401) return logout();
            const data = await res.json();
            
            if (data.success) {
                if (isLoadMore) {
                    // Thêm tin nhắn cũ vào đầu danh sách
                    setMessages(prev => [...data.messages, ...prev]);
                } else {
                    // Load lần đầu
                    setMessages(data.messages);
                }
                setHasMore(data.pagination.hasMore);
                setOffset(currentOffset + data.messages.length);
            }
        } catch (e) {
            console.error("Lỗi khi tải tin nhắn:", e.message);
        }
    };

    // Load ban đầu
    useEffect(() => {
        const init = async () => {
            setMessages([]);
            setOffset(0);
            setHasMore(true);
            isFirstLoad.current = true;
            
            await getConversations(0, false);
            timeLoading.current = setTimeout(() => setLoading(false), 300);
        };
        init();
        return () => clearTimeout(timeLoading.current);
    }, [user_id]);

    // Xử lý scroll để load thêm tin nhắn cũ
    const handleScroll = async () => {
        const container = chatContainerRef.current;
        if (!container || loadingMore || !hasMore) return;

        // Kiểm tra nếu scroll gần đến đỉnh (50px)
        if (container.scrollTop < 50) {
            setLoadingMore(true);
            previousScrollHeight.current = container.scrollHeight;
            
            await getConversations(offset, true);
            
            // Giữ vị trí scroll sau khi load xong
            setTimeout(() => {
                const newScrollHeight = container.scrollHeight;
                container.scrollTop = newScrollHeight - previousScrollHeight.current;
                setLoadingMore(false);
            }, 100);
        }
    };

    // Scroll xuống cuối khi load lần đầu
    useEffect(() => {
        if (isFirstLoad.current && messages.length > 0) {
            chatEndRef.current?.scrollIntoView({ behavior: "instant" });
            isFirstLoad.current = false;
        }
    }, [messages.length]);

    // Gửi tin nhắn
    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim() && !image) return;

        const formData = new FormData();
        formData.append("from", user?.user_id);
        formData.append("to", user_id);
        formData.append("text", text);
        if (image) formData.append("image", image);

        try {
            const res = await fetch(`${url}/messages/send`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (res.status === 401) return logout();
            const data = await res.json();
            if (data.success) {
                const newMessages = Array.isArray(data.data) ? data.data : [data.data];
                setMessages(prev => [...prev, ...newMessages]);
                setText('');
                setImage(null);

                setContacts(prev =>
                    prev.map(c =>
                        c.user_id === user_id
                            ? { ...c, sender_id_last: user.user_id, last_message: text || '[Ảnh]', last_time: new Date().toISOString() }
                            : c
                    )
                );
            } else {
                console.warn(data.message);
            }
        } catch (e) {
            console.error("Lỗi gửi tin:", e.message);
        }
    };

    const handleSelectImg = () => imgRef.current.click();
    const handleChooseImg = (e) => setImage(e.target.files[0]);

    //goi video
  
    const openVideo = useCallback(() => {
    // 🔥 Mở cửa sổ rỗng (không mở file mp4!)
    const videoWindow = window.open(
        "",
        "VideoPopup",
        "width=800,height=600,left=300,top=200,resizable=yes"
    );

    if (!videoWindow) return;

    // Ghi HTML vào popup
    videoWindow.document.open();
    videoWindow.document.write(`
        <html>
        <head>
            <title>Video</title>
            <style>
                body {
                    margin: 0;
                    background: #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                video {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
            </style>
        </head>
        <body>
<video autoplay muted controls>
    <source src="${video}" type="video/mp4">
</video>

        </body>
        </html>
    `);
    videoWindow.document.close();
}, []);


    return (
        <>
            {/* Header bạn chat */}
            <div className="d-flex align-items-center justify-content-between p-2" style={{ height: '60px' }}>
                <div className="d-flex align-items-center">
                    <img 
                        onClick={() => navigate(`/profile/${user_id}`)} 
                        src={avatar} 
                        style={{ width: 45, height: 45, borderRadius: '50%', marginRight: 8, cursor: 'pointer' }} 
                    />
                    <b>{fullname}</b>
                    <span className={`ms-2 ${status === "online" ? "text-success" : ""}`}>
                        {status === "online" ? "online" : "offline"}
                    </span>
                    <button onClick={openVideo} className="btn"><i className="bi bi-camera-video"></i></button>
                </div>
            </div>

            {/* Chat container */}
            <div className={`w-100 ${styles.conversation}`}>
                {loading ? (
                    <LoadingHeart />
                ) : (
                    <div 
                        ref={chatContainerRef}
                        className={styles.chatContainer}
                        onScroll={handleScroll}
                    >
                        {/* Loading indicator khi tải thêm */}
                        {loadingMore && (
                            <div className="text-center py-2">
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Hiển thị thông báo nếu đã hết tin nhắn */}
                        {!hasMore && messages.length > 0 && (
                            <div className="text-center text-muted py-2" style={{ fontSize: '0.85rem' }}>
                                Đã hiển thị tất cả tin nhắn
                            </div>
                        )}

                        {messages.map((item) => (
                            <MessageTag key={item.message_id || Math.random()} data={{ ...item, avatar }} user={user} />
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}

                {/* Hiển thị ảnh preview */}
                {image && (
                    <div className="p-2 text-center">
                        <img
                            src={URL.createObjectURL(image)}
                            alt="preview"
                            style={{ maxHeight: 150, borderRadius: 10 }}
                        />
                        <button onClick={() => setImage(null)} className="btn btn-sm btn-danger ms-2">
                            Xóa ảnh
                        </button>
                    </div>
                )}

                {/* Input gửi tin */}
                <form className="input-group" onSubmit={handleSend}>
                    <button type="button" onClick={handleSelectImg} className="input-group-text">
                        <i className="bi bi-images"></i>
                    </button>
                    <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleChooseImg} />
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="form-control"
                        type="text"
                        placeholder="Nhập tin nhắn..."
                    />
                    <button type="submit" className="input-group-text btn bg-primary">
                        <i className="bi bi-send text-white"></i>
                    </button>
                </form>
            </div>
        </>
    );
}));

const MessageTag = ({ data, user }) => {
    const { sender_id, content, sent_at, avatar, is_read, message_type } = data;
    const isMe = sender_id === user.user_id;
    return (
        <div className={`${styles.message} ${isMe ? styles.me : styles.friend}`}>
            <div className={styles.content}>
                {!isMe && (
                    <img src={avatar} style={{ height: 30, width: 30, borderRadius: "50%", marginRight: 5 }} />
                )}
                <div>
                    {message_type === "text" && <div>{content}</div>}
                    {message_type === "image" && (
                        <img src={content} alt="img" style={{ maxWidth: 200, borderRadius: 10, marginTop: 5 }} />
                    )}
                </div>
            </div>
            <div className={styles.time}>
                {new Date(sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {is_read && <i className="ms-1 bi bi-eye"></i>}
            </div>
        </div>
    );
};