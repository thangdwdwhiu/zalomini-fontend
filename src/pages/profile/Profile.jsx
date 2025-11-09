import {  useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import ProfileHeader from "./components/ProfileHeader";
import styles from './profile.module.css'
import ProfileStats from "./components/ProfileStats";

const url = import.meta.env.VITE_API_URL;

export default function Profile() {
  const { id } = useParams(); // id từ URL
  const { user, toast, logout } = useContext(AuthContext); // user hiện tại
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    


  // Nếu params.id không tồn tại → dùng user.id
  const profileId = id || user?.user_id;

  useEffect(() => {
  if (!profileId) {
    setError("Không có user hợp lệ để hiển thị profile");
    setLoading(false);
    return;
  }

  const getProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${url}/users/profile/${profileId}`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        toast.error("Có lỗi xảy ra khi lấy profile");
        setLoading(false);
        logout()
        return;
      }

      const data = await res.json();
      console.log("API response:", data); // Debug xem field nào chứa profile
      if (data.success && data.profile) {
        setProfile(data.profile);
      } else {
        toast.error("Không lấy được profile");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  getProfile();
}, [profileId]);


  if (loading) return <p>Đang tải...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
       <div className={`${styles.profileContainer} container`}>
                 <ProfileHeader profile={profile} isOwner={user.user_id === profileId} />
                 <ProfileStats profile={profile} />

       </div>
  );
}
