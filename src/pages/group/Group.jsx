import { memo, useState } from "react";
import styles from './groups.module.css'

export default memo (function Group() {
    const [groupContacts, setGroupContacts] = useState([])
    return (
        <>
            <div className={`container-fluid h-100`}>
                    <div className={`${styles.createGroup}`}>
                                <button style={{color: 'blue'}} className="btn "><i className=" bi bi-plus-square"></i> Tạo nhóm</button>
                    </div>
                    <hr />
                    <strong>Nhóm đã tham gia : </strong> <span>{groupContacts?.length}</span>
                    <div className={styles.groupList}>
                            {
                                groupContacts.map((item) => (<></>))
                            }
                    </div>
            </div>
        </>
    )
})