import { memo, useContext, useRef, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from '../home.module.css'
import ModalContact from "./setting/ModalContact";
import '../../../assets/styles/styles.css'

const url = import.meta.env.VITE_API_URL

export default memo(function Setting() {
    const { user, logout, handleSetUser, toast } = useContext(AuthContext)
    const [modalChangeFullname, setModalChangeFullname] = useState(false)
    const [userNew, setUserNew] = useState({ passwordNew: '', fullnameNew: '' })
    const [modalContact, setModalContact] = useState(false)
    const [modalAvatar, setModalAvatar] = useState(false)
    const imgRef = useRef(null)

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (!userNew.passwordNew || userNew.passwordNew.length < 6) {
            alert('Mật khẩu phải từ 6 kí tự trở lên')
            return
        }
        console.log(userNew.passwordNew);

        try {
            const res = await fetch(`${url}/users/changePassword`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ passwordNew: userNew.passwordNew }),
                    credentials: 'include'
                }


            )
            if (res.status === 401) {
                logout()
                return
            }
            const data = await res.json()
            if (data.success) {
                alert(data.message + ':' + userNew.passwordNew)
                setUserNew((pre) => ({ ...pre, passwordNew: '' }))
                setModalChangeFullname(false)
                return
            }
            alert(data.message)
        }
        catch (e) {
            console.log(e.message);

        }
    }
    //set fullname

    const handleChangeFullame = async (e) => {
        e.preventDefault()

        if (!/^[\p{L}\s]{3,50}$/u.test(userNew.fullnameNew)) {
            alert('Họ và tên chỉ chứa chữ cái và khoảng trắng (3–50 ký tự)')
        }
        console.log(userNew.fullnameNew);

        try {
            const res = await fetch(`${url}/users/changeFullname`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullnameNew: userNew.fullnameNew }),
                    credentials: 'include'
                }


            )
            if (res.status === 401) {
                logout()
                return
            }
            if (res.status === 400) {
                alert('Dữ liệu nhập vào không hợp lẹ')
                return
            }
            const data = await res.json()
            if (data.success) {
                handleSetUser({ ...user, fullname: userNew.fullnameNew })
                toast.success(data.message)

                setModalChangeFullname(false)
                return
            }
             toast.error(data.message)

        }
        catch (e) {
            console.log(e.message);

        }
    }
    //set user
    const handleChange = (e) => {
        const { name, value } = e.target
        setUserNew((pre) => ({ ...pre, [name]: value }))
    }
    //dong contact
    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            setModalContact(false)
        }
    }
    const handleUpload = () =>{
            imgRef.current.click()
    }

    //change avatar
    const handleFileChange = async (e) => {
    
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng ảnh
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file JPG, JPEG hoặc PNG');
        return;
    }

    // Giới hạn dung lượng (ví dụ 2MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn, tối đa 5MB');
        return;
    }

    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(`${url}/users/uploadAvatar`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (res.status === 401) {
            logout();
            return;
        }

        const data = await res.json();
        if (data.success) {
            handleSetUser({ ...user, avatar: data.avatar }); 
            toast.success(data.message)
            setModalAvatar(false);

        } else {
             toast.error(data.message)

        }
    } catch (error) {
        console.log(error);
        toast.error(error.message)

    }
};



    return (
        <>
            <div className={styles.settingContainer}>
                <div onClick={() => setModalAvatar(true)} className={styles.avatar} style={{
                    width: '80px',
                    height: '80px',
                }}>
                    <img style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',

                    }} src={user.avatar} alt="" />
                    <div className={styles.eye}>
                        <i className="bi bi-eye fs-2"></i>
                    </div>
                    {
                        modalAvatar && (
                            <div className="overlay d-flex flex-column ">
                                <img style={{
                                    width: '80%',
                                    height: '80%',
                                    objectFit: 'cover',
                                    borderRadius: '10px',

                                }} src={user.avatar} alt="" />

                                    <div className="mt-2 d-flex gap-2">
                                            <input onChange={handleFileChange} ref={imgRef} type="file" style={{display: 'none'}} name="image" />
                                            <button onClick={handleUpload} className="btn btn-secondary ">Thay ảnh đại diện</button>
                                            <button onClick={(e) => {e.stopPropagation(); setModalAvatar(false)}} className="btn btn-danger">hủy</button>
                                    </div>
                            </div>
                        )
                    }
                </div>

                <div>
                    {!modalChangeFullname ? (<>
                        <strong style={{ marginRight: '5px' }}>{user.fullname}   </strong>
                        <i onClick={() => setModalChangeFullname(true)} style={{ cursor: 'pointer' }} className="bi bi-pen"></i></>) :
                        (<>
                            <div className="input-group">
                                <button onClick={(e) => { e.stopPropagation(); setModalChangeFullname(false) }} className="btn"><i className="bi bi-x text-danger"></i></button>
                                <input onChange={handleChange} value={userNew.fullnameNew} className="form-control w-25" type="text" name="fullnameNew" id="" placeholder={user.fullname} />
                                <button onClick={handleChangeFullame} type="submit" className="input-group-text"><i className="bi bi-check-square text-success"></i></button>
                            </div>
                            <br />
                            <div className="input-group">
                                <button onClick={(e) => { e.stopPropagation(); setModalChangeFullname(false) }} className="btn"><i className="bi bi-x text-danger"></i></button>
                                <input onChange={handleChange} value={userNew.passwordNew} className="form-control w-25" type="text" name="passwordNew" id="" placeholder="Mật khẩu" />
                                <button onClick={handleChangePassword} type="submit" className="input-group-text"><i className="bi bi-check-square text-success"></i></button>
                            </div>
                        </>
                        )}
                </div>
                <small>{user.phone}</small>
                <button onClick={() => setModalContact(true)} className="btn btn-primary w-25"><i className="bi bi-telephone-forward-fill text-white"> Liên hệ</i></button>
                <button className={`btn  btn-danger w-25`} onClick={logout} >logout</button>
            </div>

            {
                modalContact && <ModalContact onClick={handleClose} />
            }
        </>
    )
})


