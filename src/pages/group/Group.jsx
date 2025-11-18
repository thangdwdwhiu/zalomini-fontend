import { memo, useContext, useRef, useState } from "react";
import styles from './groups.module.css';
import groupDefault from '../../assets/img/group.jpg';
import { AuthContext } from "../../context/AuthContext";

const url = import.meta.env.VITE_API_URL
export default memo(function Group() {
    const [groupContacts, setGroupContacts] = useState([]);
    const [groupName, setGroupName] = useState("");
    const avatarRef = useRef(null);
    const {toast, logout}  = useContext(AuthContext)
    const [modalAvatar, setModalAvatar] = useState(false)


    const handleCreateGroup = async () => {
        try {
            const avatarFile = avatarRef.current?.files[0];

            if (!groupName.trim())
            {
                toast.error('tên không được để trống')
                return
            }


            const formData = new FormData();
            formData.append("groupName", groupName);
            formData.append("image", avatarFile);

            const res = await fetch(`${url}/groups/create`, {
                method: "POST",
                body: formData,
                credentials: 'include'
            });
            

            if (res.status == 401)
            {
                logout()
                return
            }

            const data = await res.json();
            if (data.success) {
                toast.success(data.message)
                setGroupContacts((prev) => [...prev, data]);
                return
            }
            toast.error(data.message)
            
        }
        catch (e) {
            console.log(e.message);
        }
    };

    const handleSelectImg = () => {
        avatarRef.current?.click();
    };

    return (
        <div style={{ position: "relative" }} className="container-fluid h-100">
            <div className={styles.createGroup}>
                <button className="btn" style={{ color: "blue" }} onClick={() => setModalAvatar((pre) => !pre)}>
                    {modalAvatar ? (<i className="bi bi-x-circle text-danger"> Hủy</i>) : (<i className="bi bi-plus-square"> Tạo nhóm</i>)}
                </button>
            </div>

            <hr />

            <strong>Nhóm đã tham gia: </strong>
            <span>{groupContacts.length}</span>

            <div className={styles.groupList}>
                {groupContacts.map((item) => (
                    <div key={item.group_id}>
                        {item.group_name}
                    </div>
                ))}
            </div>
            { modalAvatar &&

           ( <div className={styles.modalCreateGroup}>
                <input
                    ref={avatarRef}
                    style={{ display: "none" }}
                    type="file"
                    accept="image/*"
                />

                <div className="d-flex align-items-center">
                    <img
                        onClick={handleSelectImg}
                        style={{ width: "70px", height: "70px", borderRadius: "50%", cursor: "pointer" }}
                        src={groupDefault}
                        alt=""
                    />

                    <input
                        className="form-control ms-4"
                        type="text"
                        placeholder="Đặt tên nhóm"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleCreateGroup}
                    className="btn btn-primary"
                    style={{ width: "100px", margin: "auto" }}
                >
                    Tạo nhóm
                </button>
            </div>)}
        </div>
    );
});
