import { memo } from "react";
import styles from  '../../home.module.css'
import '../../../../assets/styles/styles.css'

export default memo (function ModalContact({...props}) {


    return (
        <>
                <div {...props} className={styles.overlay}>
                    <div  className={`${styles.modalContact} d-flex flex-column p-2 g-3`}>
                        <h2><i style={{color: 'blue'}} className="bi bi-info"></i>Thông tin ứng dụng </h2>
                        <span>Zalo mini</span>
                        <span>Được phát triển bởi: Đào Xuân Thắng</span>
                        <i>Phiên bản: v1</i>
                        <a href="https://www.facebook.com/profile.php?id=61577274811218&locale=vi_VN">Báo lỗi</a>
                    </div>
                </div>
        </>
    )
})