import React, { useRef } from "react";
import { Link, useNavigate  } from 'react-router-dom';
import axios from 'axios';

function Example01() {

    const textIdRef = useRef(null);
    const textPWRef = useRef(null);
    const textNAMERef = useRef(null);
    const textEMAILRef = useRef(null);
    const navigate = useNavigate();

    const onClick = () => {
        const textbox = {
            inTextID: textIdRef.current.value,
            inTextPW: textPWRef.current.value,
            inTextNAME: textNAMERef.current.value,
            inTextEMAIL: textEMAILRef.current.value,
        };

        axios.post("http://localhost:4000/signup", textbox,{
            headers: {
                "content-type": "application/json",
            },
        })
            .then((res) => {
                alert(res.data.text);
                navigate("/");
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
            <input name="text_id" ref={textIdRef} placeholder='아이디'></input>
            <input name="text_pw" ref={textPWRef} placeholder='비밀번호'></input>
            <input name="text_name" ref={textNAMERef} placeholder='이름'></input>
            <input name="text_email" ref={textEMAILRef} placeholder='email'></input>
            <button onClick={onClick}>전송</button>
        </div>
    );
}

export default Example01;