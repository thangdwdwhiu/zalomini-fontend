import {  useContext } from 'react'
import '../../assets/styles/styles.css'
import { AuthContext } from '../../context/AuthContext'
export default function Robot() {
    const {user} = useContext(AuthContext)
    return (
        <>
        <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>

    <div class="robotContainer">
        <div class="robot">
            <div class="antenna"></div>
            <div class="robot-head">
                <div class="eyes">
                    <div class="eye"></div>
                    <div class="eye"></div>
                </div>
                <div class="mouth"></div>
            </div>
            <div class="robot-body">
                <div class="body-detail"></div>
            </div>
            <div class="arms">
                <div class="arm left"></div>
                <div class="arm right"></div>
            </div>
        </div>

        <div class="message-box">
            <h2>Xin chào {user?.fullname} ! 👋</h2>
            <p>Chưa có cuộc trò chuyện nào được chọn. Hãy chọn hoặc bắt đầu một cuộc trò chuyện mới nhé!</p>
            <div class="emoji">💬✨</div>
        </div>
    </div>
        </>
    )
}