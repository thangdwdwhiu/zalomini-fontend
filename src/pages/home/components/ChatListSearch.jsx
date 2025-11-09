import { useEffect, useState, useContext, memo } from "react";
import styles from '../home.module.css'
import { AuthContext } from "../../../context/AuthContext";

const url = import.meta.env.VITE_API_URL;
export default memo ( function ChatListSearch({setUserChat, setActiveContact}){
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const { logout, toast } = useContext(AuthContext)

  // ✅ Auto search sau 100ms khi gõ
  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch();
    }, 100);
    return () => clearTimeout(delay);
  }, [keyword]);

  // ✅ Hàm tìm kiếm bạn bè
  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    const kw = keyword.trim();
    if (!kw) {
      setResults([]); // clear kết quả khi xoá hết
      return;
    }

    try {
      const res = await fetch(
        `${url}/friends/search?keyword=${encodeURIComponent(kw)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if(res.status === 401)
      {
        logout()
        return
      }

      const data = await res.json();
      if (data.success) {
        setResults(data.users);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("❌ Lỗi tìm kiếm:", err);
    }
  };


  const handleChat = (u) => {
    setUserChat(u)
    setActiveContact(u.user_id)
    setKeyword('')
  };

  const handleStop = () => {
    toast.warning("⚠️ Hai bạn chưa là bạn bè!")
  };
  // ✅ Gửi lời mời kết bạn
  const handleAddFriend = async (receiverID) => {
    try {
      const res = await fetch(`${url}/friends/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverID }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      if (data.success) {
        // Có thể cập nhật lại danh sách
        setResults((prev) =>
          prev.map((u) =>
            u.user_id === receiverID ? { ...u, relationship_status: "pending" } : u
          )
        );
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("❌ Lỗi gửi lời mời:", err);
    }
  };
  return (
    <form
      className={`input-group ${styles.searchBar}`}
      onSubmit={handleSearch}
    >
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="form-control"
        type="text"
        placeholder="Tìm kiếm bạn bè..."
      />
      <button onClick={()=> handleChat(results.find((item) => item.relationship_status === "accepted"))} type="submit" className="input-group-text btn">
        <i className="bi bi-search"></i>
      </button>

      <div className={`mt-4 ${styles.searchContainer}`}>
        {results.length > 0 ? (
          <ul className="list-unstyled">
            {results.map((u) => (
              <li
                key={u.user_id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (u.relationship_status === "accepted") handleChat(u);
                  else handleStop();
                }}
                className="border-bottom py-2 d-flex align-items-center gap-2"
                style={{ cursor: "pointer" }}
              >
                <img
                  src={u.avatar || "/default-avatar.png"}
                  alt="avatar"
                  width="40"
                  height="40"
                  className="rounded-circle"
                />

                <div>
                  <div className="fw-semibold">{u.fullname}</div>
                  <div className="text-muted small">{u.phone}</div>
                </div>

                {/* ✅ Cột trạng thái / nút hành động */}
                <div style={{ marginLeft: "auto" }}>
                  {!u.relationship_status && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // ⛔ chặn lan click ra cha
                        handleAddFriend(u.user_id);
                      }}
                      className="btn"
                    >
                      <i
                        style={{ color: "blue" }}
                        className="bi bi-person-plus"
                      ></i>
                    </button>
                  )}

                  {u.relationship_status === "accepted" && (
                    <span style={{ color: "green" }}>Bạn bè</span>
                  )}

                  {u.relationship_status === "pending" && (
                    <span style={{ color: "orange", marginLeft: 'auto' }}>Đang chờ...</span>
                  )}

                  {u.relationship_status === "block" && (
                    <span style={{ color: "red" }}>Đã chặn</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          keyword && <p className="text-muted">Không có kết quả</p>
        )}
      </div>
    </form>

  )
})