import { memo, useContext, useState } from "react";
import styles from './home.module.css'
import { AuthContext } from "../../context/AuthContext";
import ChatList from "./components/ChatList";
import Friend from "./components/Friend";
import Setting from "./components/Setting";
import Group from "../group/Group";
import { useNavigate } from "react-router-dom";

export default memo(function Home() {
  const { user } = useContext(AuthContext)
  const [tabActive, setTabActive] = useState('chat')
  const tabs = [
  { key: 'chat', element: (<ChatList setTabActive={setTabActive}  />), name: 'nhắn tin', icon: (<i className="bi bi-messenger fs-3"></i>) },
  { key: 'friend', element: (<Friend setTabActive={setTabActive} />), name: 'bạn bè', icon: (<i className="bi bi-people-fill fs-3"></i>) },
  { key: 'setting', element: <Setting/>, name: 'cài đặt', icon: (<i className="bi bi-gear fs-3"></i>) },
  { key: 'group', element: <Group />, name: 'nhóm', icon: (<i className="bi bi-people-fill fs-3"></i>) },
]
  const navigate = useNavigate()
  return (

    <>
      <div className="container-fluid d-flex">
        <div style={{ height: '100vh' }} className={styles.iconChat}>
          <img onClick={() => navigate('/profile')} style={{ width: '50px', height: '50px', borderRadius: '50%' }} src={user.avatar} alt="avatar" />
          {tabs.map((item) => (
            <button key={item.key} onClick={() => setTabActive(item.key)} className={`btn text-white ${tabActive === item.key && 'active'}`}>{item.icon} <sup>{item.name}</sup></button>
          ))}
        </div>

        <div className={styles.mainContent}>
          <div className={styles.sideBar}>
            <span>zalo mini của {user?.fullname}</span>
          </div>

            {
              tabs.find((item) => item.key === tabActive).element
            }


        </div>
      </div>
    </>
  )
})