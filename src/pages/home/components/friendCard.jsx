import { Children } from "react";
import { memo } from "react";
import { useNavigate } from "react-router-dom";


export default memo(function FriendCard({userData, children}){
    const {user_id, fullname, phone, avatar} = userData
    const navigate = useNavigate()
    
    return(
        <>
        <div className="col">
                <div style={{borderRadius: '10px',boxShadow: '0 2px #231010ff', backgroundColor: '#7d7dc2ff'}} className="text-white d-flex flex-column g-2 align-items-center p-2 w-100">
                <img onClick={() => navigate(`/profile/${user_id}`)} style={{height: '50px', width: '50px', borderRadius: '50%'}} src={avatar} alt="" />
                <strong>{fullname}</strong>
                <span>{phone}</span>
                <div className="d-flex align-items-center">
                        {children}
                </div>
        </div>
        </div>

        </>
    )
})