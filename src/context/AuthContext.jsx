import { useEffect, useState, createContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
import { ToastContainer, toast } from "react-toastify";

const url = import.meta.env.VITE_API_URL;
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socket = useRef(null);

  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem("userData");
      const now = Date.now();
      const exp = 1000 * 60 * 60 * 2;

      if (userData) {
        const parsed = JSON.parse(userData);
        if (now - parsed.time < exp) {
          setUser(parsed.user);
        } else {
          localStorage.removeItem("userData");
          navigate("/login", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }

      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const login = async (username, password) => {
    try {
      const res = await fetch(`${url}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        localStorage.setItem(
          "userData",
          JSON.stringify({ user: data.data, time: Date.now() })
        );
        navigate("/", { replace: true });
      } else {
        console.warn("❌ Sai tài khoản:", data.message);
        // alert(data.message);
        toast.error(data.message)
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err.message);
    }
  };

  const validateRegister = (fullname, username, password, phone) => {
    if (!/^[\p{L}\s]{3,50}$/u.test(fullname))
      return "Họ và tên chỉ chứa chữ cái và khoảng trắng (3–50 ký tự)";
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username))
      return "Tên đăng nhập chỉ chứa chữ và số (3–20 ký tự)";
    if (password.length < 6)
      return "Mật khẩu phải có ít nhất 6 ký tự";
    if (!/^0\d{9,10}$/.test(phone))
      return "Số điện thoại không hợp lệ";
    return null;
  };

  const register = async (fullname, username, password, phone) => {
    const error = validateRegister(fullname, username, password, phone);
    if (error) throw new Error(error);

    try {
      const res = await fetch(`${url}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullname, username, password, phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error("❌ Lỗi đăng ký:", err);
      throw new Error(err.message || "Lỗi máy chủ");
    }
  };

  const logout = async () => {
    // 🔥 Disconnect socket trước khi logout
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }

    localStorage.removeItem("userData");
    setUser(null);
    navigate("/login", { replace: true });

    try {
      const res = await fetch(`${url}/users/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) 
        toast.success("đăng xuất thành công")
      else
        toast.error(data.message)
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleSetUser = (userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify({ user: userData, time: Date.now() }));
  };

  // 🔥 QUAN TRỌNG: Chỉ khởi tạo socket KHI ĐÃ CÓ USER
  useEffect(() => {
    if (!user) {
      // Nếu không có user, disconnect socket (nếu đang connect)
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      return;
    }

    // ✅ Khởi tạo socket SAU KHI LOGIN
    console.log('🔌 Đang kết nối socket cho user:', user.fullname);
    
    socket.current = io("http://localhost:3000", {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    // ✅ Khi connect thành công → JOIN ROOM
    socket.current.on("connect", () => {
      console.log("✅ Socket connected:", socket.current.id);
      socket.current.emit("join", user.fullname); // 🔥 JOIN ROOM
    });

    socket.current.on("connected", (message) => {
      console.log("📡", message);
    });

    socket.current.on("message", (message) => {
      alert(`Đã nhận tin nhắn: ${message}`);
    });

    socket.current.on("unauthorized", (error) => {
      console.error("🚫 Unauthorized:", error);
      alert(error);
      logout();
    });

    socket.current.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server chủ động disconnect → thử kết nối lại
        socket.current.connect();
      }
    });

    socket.current.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    // Cleanup khi user thay đổi hoặc component unmount
    return () => {
      if (socket.current) {
        socket.current.off("connect");
        socket.current.off("connected");
        socket.current.off("message");
        socket.current.off("unauthorized");
        socket.current.off("disconnect");
        socket.current.off("error");
        socket.current.disconnect();
      }
    };
  }, [user]); // 🔥 Dependency: user

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, socket, handleSetUser, toast }}>
      <ToastContainer />
      {children}

    </AuthContext.Provider>
  );
};