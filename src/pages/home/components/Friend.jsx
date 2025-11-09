import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { memo } from "react";
import { AuthContext } from "../../../context/AuthContext";
import FriendCard from "./friendCard";
import { useNavigate } from "react-router-dom";


export default memo(function Friend({setTabActive}) {


    const url = import.meta.env.VITE_API_URL
    const [friends, setFriends] = useState([])
    const { logout, toast } = useContext(AuthContext)
    const [selected, setSelected] = useState('friend')
    const [requests, setRequests] = useState([])
    const navigate = useNavigate()

    const getFriends = async () => {
        try {
            const res = await fetch(`${url}/friends`, {
                method: 'GET',
                credentials: 'include'
            })
            if (res.status === 401) {
                logout()
                return
            }
            const data = await res.json()

            if (data.success) {
                setFriends(data.friends)
                return
            }
            alert(data.message)
            console.log(data.message);

        }
        catch (e) {
            console.log(e.message);

        }
    }
    const getRequests = async () => {
        try {
            const res = await fetch(`${url}/friends/requests`, {
                method: 'GET',
                credentials: 'include'
            })
            if (res.status === 401) {
                logout()
                return
            }
            const data = await res.json()

            if (data.success) {
                setRequests(data.requests)
                return
            }
            alert(data.message)
            console.log(data.message);

        }
        catch (e) {
            console.log(e.message);

        }
    }



    const handleAccept = async (id) => {
        try {
            const res = await fetch(`${url}/friends/accept/${id}`, {
                method: 'POST',
                credentials: 'include'
            })
            if (res.status === 401) {
                logout()
                return
            }
            const data = await res.json()

            if (data.success) {
                const acceptedUser = requests.find((item) => item.user_id === id)
                setRequests((pre) => pre.filter((item) => item.user_id != id))

                if (acceptedUser) {
                    setFriends((prev) => [...prev, acceptedUser])
                }
                toast.success(data.message)
                return

            }
            alert(data.message)
            console.log(data.message);

        }
        catch (e) {
            console.log(e.message);

        }
    }
    //xoa ban
    const handleDeleteFriend = async (id, fullname) =>{
        if (!window.confirm(`Hủy kết bạn với ${fullname}`))
            return
        try {
            const res = await fetch(`${url}/friends/delete/${id}`, {
                method: 'POST',
                credentials: 'include'
            })
            if (res.status === 401) {
                logout()
                return
            }
            const data = await res.json()

            if (data.success) {
                    setFriends((prev) => prev.filter((item) => item.user_id != id))
                    toast.success(data.message)
                return

            }
            alert(data.message)
            console.log(data.message);

        }
        catch (e) {
            console.log(e.message);

        }
    }
    //chan ban 
        const handleBlockFriend = async (id, fullname) =>{
        if (!window.confirm(`chặn ${fullname}`))
        {
            return
        }

        try {
            const res = await fetch(`${url}/friends/block/${id}`, {
                method: 'POST',
                credentials: 'include'
            })
            if (res.status === 401) {
                logout()
                return
            }
            const data = await res.json()

            if (data.success) {
                    setFriends((prev) => prev.filter((item) => item.user_id != id))
                    toast.success(data.message)
                return

            }
            alert(data.message)
            console.log(data.message);

        }
        catch (e) {
            console.log(e.message);

        }
    }
    //huy loi moi ket ban
        const handleReject = async (id) =>{
       
        try {
            const res = await fetch(`${url}/friends/reject/${id}`, {
                method: 'POST',
                credentials: 'include'
            })
            if (res.status === 401) {
                logout()
                return
            }
            const data = await res.json()

            if (data.success) {
                    setFriends((prev) => prev.filter((item) => item.user_id != id))
                return

            }
            console.log(data.message);

        }
        catch (e) {
            console.log(e.message);

        }
    } 

    //loading api khi mount
    useEffect(() => {
        const fetchFriend = async () => {
            await Promise.all([
                getFriends(),
                getRequests()
            ])

        }
        fetchFriend()

    }, [])

    return (<>
        <select onChange={(e) => setSelected(e.target.value)} value={selected} style={{ margin: '0 auto', marginTop: '10px', backgroundColor: '#2c6a84ff' }} className="form-select w-25" >
            <option value="friend">bạn bè</option>
            <option value="request">lời mời</option>
        </select>
        <div className="row row-cols-sm-1 row-cols-1 row-cols-md-3 row-cols-lg-4 p-3 g-3">

            {selected === 'friend' &&
                friends.map((item, index) => (<FriendCard key={index} userData={item}>
                    <button onClick={() => setTabActive('chat')} className="btn"><i className="bi text-white bi-messenger fs-3"></i></button>
                    <button onClick={() => handleDeleteFriend(item.user_id, item.fullname)} className="btn"><i className="bi text-white bi-person-check fs-3"></i></button>
                    <button onClick={() => handleBlockFriend(item.user_id, item.fullname)} className="btn"><i className="bi bi-person-exclamation fs-3 text-danger"></i></button>
                </FriendCard>))
            }
            {
                selected === 'request' &&
                requests.map((item, index) => (<FriendCard key={index} userData={item}>
                    <button onClick={() => handleAccept(item.user_id)} className="btn"><i className="bi bi-check fs-3 text-white"></i></button>
                    <button onClick={() => handleReject(item.user_id)} className="btn"><i className="bi bi-person-x-fill text-danger fs-3"></i></button>
                </FriendCard>))
            }

        </div>
    </>)
})