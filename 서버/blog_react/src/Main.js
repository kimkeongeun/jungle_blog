import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate  } from 'react-router-dom';
import axios from 'axios';


function AllPosts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        // API 요청
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:4000/posts');
                
                if (response.data.success) {
                    setPosts(response.data.data); // 수정된 부분
                } else {
                    console.error('Failed to fetch posts:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []); // 컴포넌트가 마운트될 때 한 번만 실행

    return (
        <div>
            <div>게시글 보기</div>
            <div>조회목록</div>
            {Array.isArray(posts) && posts.length > 0 ? (
                posts.map(post => (
                    <li key={post.post_id}>
                        <h2>제목 : {post.title}</h2>
                        <p>작성자 id : {post.authorName}</p>
                        <p>작성일 : {post.createdDate}</p>
                        <p>내용 : {post.content}</p>
                    </li>
                ))
            ) : (
                <p>게시글을 불러오는 중입니다...</p>
            )}
        </div>
    );
}

function CreatePost(){

    const titleRef = useRef(null);
    const contentRef = useRef(null);
    const navigate = useNavigate();

    const onClick = () => {
        const textbox = {
            inID : localStorage.getItem("id"),
            inTitle: titleRef.current.value,
            inContent: contentRef.current.value,
        };

        axios.post("http://localhost:4000/post", textbox, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                alert(response.data.text);
                navigate("/main");
            })
            .catch((error) => {
                if (error.response) {
                    // 서버에서 응답이 왔지만 오류 상태 코드
                    alert(error.response.data.text);
                } else {
                    // 서버에서 응답이 없거나 다른 오류
                    alert("게시글 작성 실패");
                }
            });
    };

    return (
        <div>
            <div>게시글쓰기</div>
            <input name="title" ref={titleRef} placeholder='제목'></input>
            <input name="content" ref={contentRef} placeholder='내용'></input>
            <button onClick={onClick}>전송</button>
        </div>
    );
}

function Main() {


    const token = localStorage.getItem('token');

    if (!token) {
        return (
            <div>
                <p>로그인이 필요합니다</p>
                <Link to="/">
                    <button>로그인 하러가기</button>
                </Link>
            </div>
        );
    }

    const onClick = () => {
        localStorage.clear()
    }



    return (
        <div>
            <p>로그인 성공</p>
            <Link to="/">
                <button onClick={onClick}>로그아웃</button>
            </Link>
            <CreatePost></CreatePost>
            <AllPosts></AllPosts>
        </div>

    );
}

export default Main;