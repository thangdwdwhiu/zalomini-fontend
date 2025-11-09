import { memo } from "react";
import styles from './login.module.css'
import { useState } from "react";
import ButtonNext from "../../components/button/ButtonNext";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
export default memo(function Login() {
    const [selected, setSelected] = useState('login')
  
    return (
        <>
            <div className={`container ${styles.form}`}>
                <h2 style={{ color: '#097c28ff', textAlign: 'center' }}>Zalo mini</h2>
                <select className="form-select bg-danger" value={selected} onChange={(e) => setSelected(e.target.value)}>
                    <option value="login">login</option>
                    <option value="register">register</option>
                </select>

                {
                    selected === 'login' && <LoginForm />
                }
                {
                    selected === 'register' && <RegisterForm setSelected={setSelected} />
                }
            </div>
        </>
    )
})

const LoginForm = () => {
    const [userData, setUserData] = useState({username: '', password: ''})
    const [show, setShow] = useState(false)
    const {login} = useContext(AuthContext)

    const handleChange = (e) =>{
        const {name, value} = e.target
        setUserData((pre) => ({...pre,[name]: value}))
    }
    const handlelogin = () =>{
        console.log(userData)
        login(userData.username, userData.password)

        

    }
    return (<>
        <form className={styles.formControl}>
            <label className="form-lable">
                Tên đăng nhập hoặc số điện thoại :
            </label>
            <input type="text" value={userData.username} onChange={handleChange} name="username" className="form-control" />
            <label>Mật khẩu : </label>
            <div className="input-group">
                <input value={userData.password} onChange={handleChange} type={show ? 'text' : 'password'} name="password" className="form-control" />
                <span className="input-group-text">
                    <i style={{cursor: 'pointer'}} onClick={() => setShow(!show)} className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </span>

            </div>



            <ButtonNext type={'button'} onClick={handlelogin} />

        </form>
    </>)
}

const RegisterForm = ({setSelected}) => {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    phone: "",
    fullname: "",
  });

  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register, toast } = useContext(AuthContext);

  // Hàm validate chung
  const validate = ({ username, password, phone, fullname }) => {
    if (!username.trim() || !password.trim() || !phone.trim() || !fullname.trim()) {
      return "Vui lòng điền đầy đủ thông tin";
    }
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
      return "Username chỉ chứa chữ và số, từ 3-20 ký tự";
    }
if (!/^[\p{L}\s]{3,50}$/u.test(fullname)) {
  return "Họ và tên chỉ được chứa chữ cái và khoảng trắng (3–50 ký tự)";
}

    if (password.length < 6) {
      return "Mật khẩu phải ít nhất 6 ký tự";
    }
    if (!/^0\d{9,10}$/.test(phone)) {
      return "Số điện thoại không hợp lệ";
    }
    return null; 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((pre) => ({ ...pre, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("");
    setSuccess("");

    // 1️⃣ Kiểm tra lỗi
    const errorMsg = validate(userData);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

try {
  const result = await register(
    userData.fullname,
    userData.username,
    userData.password,
    userData.phone
  );

  toast.success('Đăng kí thành công!')
  setSuccess(result.message || "Đăng ký thành công!");
  setTimeout(() => setSelected("login"), 1500);
} catch (err) {
  
  alert(err.message || "lỗi máy chủ")
}
  };

  return (
    <form className={styles.formControl} onSubmit={(e) => e.preventDefault()}>
      <label>Tên đầy đủ:</label>
      <input
        type="text"
        name="fullname"
        value={userData.fullname}
        onChange={handleChange}
        className="form-control"
      />

      <label>Tên đăng nhập:</label>
      <input
        type="text"
        name="username"
        value={userData.username}
        onChange={handleChange}
        className="form-control"
      />

      <label>Số điện thoại:</label>
      <input
        type="text"
        name="phone"
        value={userData.phone}
        onChange={handleChange}
        className="form-control"
      />

      <label>Mật khẩu:</label>
      <div className="input-group">
        <input
          type={show ? "text" : "password"}
          name="password"
          value={userData.password}
          onChange={handleChange}
          className="form-control"
        />
        <span className="input-group-text">
          <i
            style={{ cursor: "pointer" }}
            onClick={() => setShow(!show)}
            className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}
          ></i>
        </span>
      </div>

      {error && <p style={{ color: "red", marginTop: "5px" }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: "5px" }}>{success}</p>}

      <ButtonNext type="submit" onClick={handleRegister} text="Đăng ký" />
    </form>
  );
}