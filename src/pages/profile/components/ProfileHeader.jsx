import { memo } from "react";
import styles  from '../profile.module.css'

export default memo (function ProfileHeader({profile, isOwner}) {
    const {avatar, fullname} = profile
    console.log(fullname);
    
    const handleEdit = () =>{
     
    }
    return (
        <>
                <div className="w-100 mb-5">
                            <div className={styles.cover}>
                                <button onClick={() => window.history.back()} className={`styles.goBack btn`}><i className="bi bi-caret-left-fill text-blue"> go back</i></button>
                                <img src={avatar} alt="" className={styles.avatar} />
                                <strong className={styles.fullname}>{fullname} {isOwner && (<button onClick={handleEdit} className="btn">
                                    <i style={{color: 'blue'}} className="bi bi-person-fill-gear "></i>
                                </button>)}</strong>
                            </div>
                           
                </div> 
                <hr />       
        </>
    )
})