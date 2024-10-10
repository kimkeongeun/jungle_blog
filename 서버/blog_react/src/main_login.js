import React, { useRef } from "react";
import { Link, useNavigate  } from 'react-router-dom';
import axios from 'axios';

function Main_login() {

    const textIdRef = useRef(null);
    const textPWRef = useRef(null);
    const navigate = useNavigate();

    const onClick = () => {
        const textbox = {
            inTextID: textIdRef.current.value,
            inTextPW: textPWRef.current.value,
        };

        axios.post("http://localhost:4000/login", textbox, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                alert(response.data.text);
                localStorage.clear()
                localStorage.setItem('id', textbox.inTextID)
                localStorage.setItem('token', response.data.token)
                navigate("/main");
            })
            .catch((error) => {
                if (error.response) {
                    // 서버에서 응답이 왔지만 오류 상태 코드
                    alert(error.response.data.text);
                } else {
                    // 서버에서 응답이 없거나 다른 오류
                    alert("로그인 중 오류가 발생했습니다.");
                }
            });
    };

    return (
        <div>
            <div>로그인</div>
            <input name="text_id" ref={textIdRef} placeholder='아이디'></input>
            <input name="text_pw" ref={textPWRef} placeholder='비밀번호'></input>
            <button onClick={onClick}>전송</button>

            <Link to="/signup">
                <button>
                    회원가입
                </button>
            </Link>
        </div>
    );
}

export default Main_login;
