import { memo, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";

const url  = import.meta.env.VITE_API_URL
export default memo (function ProfileStats ({profile}) {
    const {phone, mount_friends, user_id} = profile
    const {toast, logout} = useContext(AuthContext)
    const [hasFriends, setHasFriends] = useState([])
    const [modalView, setModalView] = useState(false)
    const getHasFriends = async () =>{
        try{
            const res = await fetch(`${url}/users/hasFriends/${user_id}`, 
                {
                    method: 'GET',
                    credentials: 'include'
                }
            )

            if (res.status === 401)
            {
                logout()
                return
            }
            const data = await res.json()
            if (data.success) {
                    setHasFriends(data.friends)
                    return
            }
            toast.error(data.message)
        }
        catch (e) {
            console.log(e.message);
            
        }
    }
    useEffect(() =>{
            getHasFriends()
    }, [])
    const handleViewFriends = () =>{
            setModalView((pre) => !pre)
    }
    return (
        <>
         <i><i className="bi bi-info-circle"> </i>Thông tin cá nhân</i>
         <span>phone: {phone}</span>
         <span>bạn bè: {mount_friends} <button onClick={handleViewFriends} className="btn"><i  className="bi bi-eye-fill"></i></button></span>
         {
            modalView &&
            (<ModalViewFriends hasFriends={hasFriends}  />)
         }
        </>
    )
})


const ModalViewFriends = ({hasFriends}) =>{
    return (<>
        <div className="row row-cols-2 row-cols-md-4 row-cols-lg-4 gap-2">
            {
                hasFriends.map((item) => (
                    <>
                    <div key={item.friend_id} className="col">
                                <div style={{backgroundColor: '#f0effe', borderRadius: '5px', padding: '5px'}} className="d-flex align-items-center gap-2">
                                    <img style={{width: '30px', height: '30px', borderRadius: '50%'}} src={item.avatar} alt="" />
                                    <span>{item.fullname}</span>
                                </div>
                    </div>
                    </>
                ))
            }
        </div>
    </>)
}