import { memo } from "react";
import styles from '../groups.module.css'
export default memo(function GroupCard({group}) {
    const {group_id,	group_name,	group_avatar,	created_by,	created_at,	} = group

    return (
        <>
        <div className={`${styles.groupCard}`}>
            <img src={group_avatar}  />
            <strong>{group_name}</strong>
        </div>
        </>
    )
})