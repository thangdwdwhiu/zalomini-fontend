import { useContext, useState } from 'react';
import styles from '../home.module.css'
import { AuthContext } from '../../../context/AuthContext';

export default function ChatListContact({data,active,read, ...props}) {
  
    const {user}  = useContext(AuthContext)  
    
    
    const {user_id, avatar,fullname,  status, last_message, is_read, last_time, sender_id_last} = data
    console.log(`user contact ${user.user_id}, ${user_id}`);
    return (
        <>
<div  className={`${active && 'bg-secondary'}  ${styles.contact} `} {...props} >
        <i
        className={`bi bi-dot ms-1 fs-2 ${
          status === "online" ? "text-success" : "text-secondary"
        }`}
      ></i>
  <img src={avatar} alt={fullname} />
  <div className={styles.info}>
    <div className={styles.name}>
      {fullname}
    </div>
    <div className={styles.message}>
        {
          user.user_id === sender_id_last && (<strong>Bạn : </strong>)
        }
      {read ? last_message : <strong>{last_message}</strong>}
    </div>
  </div>
  <div className={styles.time}>{last_time ? formatRelativeTime(last_time) : 'bạn bè'}</div>
</div>

        </>
    )
}
function formatRelativeTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = (now - time) / 1000; // giây

  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    time.getDate() === yesterday.getDate() &&
    time.getMonth() === yesterday.getMonth() &&
    time.getFullYear() === yesterday.getFullYear()
  ) {
    return `Hôm qua ${time.getHours()}:${time.getMinutes().toString().padStart(2, "0")}`;
  }

  return `${time.getDate().toString().padStart(2, "0")}/${(time.getMonth() + 1)
    .toString()
    .padStart(2, "0")} ${time.getHours()}:${time.getMinutes().toString().padStart(2, "0")}`;
}

