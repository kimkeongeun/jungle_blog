const express = require('express');
const path = require('path');
const app = express();
const port = 4000;

const saltRounds = 10;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // JWT 패키지 추가
const cors = require("cors");
const bodyParser = require("body-parser");

const db = require('./db');

const conn = db.init();
db.connect(conn);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'your_secret_key'; // 비밀 키 설정

// app.get('/', (req, res) => {
//   res.send('하이');
// });

app.post("/signup", (req, res) => {
  const text1 = req.body.inTextID;
  const text2 = req.body.inTextPW;
  const text3 = req.body.inTextNAME;
  const text4 = req.body.inTextEMAIL;

  console.log(req.body);
  const user = { id: text1, name: text3, email: text4, password: text2 };

  conn.query("SELECT * FROM users WHERE id = ?", [user.id], function (err, results) {
    if (err) {
      console.error("조회 오류:", err);
      return res.status(500).send({ text: "조회 오류 발생" });
    }

    if (results.length > 0) {
      console.log("이미 존재하는 아이디:", user.id);
      return res.status(404).send({ text: "이미 존재하는 아이디입니다." });
    } else {
      // 비밀번호 해시 생성
      bcrypt.hash(user.password, saltRounds, (err, hash) => {
        if (err) {
          console.error("해시 생성 오류:", err);
          return res.status(500).send({ text: "해시 생성 오류 발생" });
        }

        // 해시된 비밀번호로 사용자 정보를 데이터베이스에 삽입
        conn.query('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
          [user.id, user.name, user.email, hash],
          function (err, results) {
            if (err) {
              console.error("삽입 오류:", err);
              return res.status(500).send({ text: "삽입 오류" });
            } else {
              console.log("삽입 성공, 새로 생성된 ID:", user.id);
              return res.send({ text: "성공" });
            }
          }
        );
      });
    }
  });
});

app.post("/login", (req, res) => {
  const text1 = req.body.inTextID;
  const text2 = req.body.inTextPW;

  console.log(req.body);
  const user = { id: text1, password: text2 };

  conn.query("SELECT * FROM users WHERE id = ?", [user.id], function (err, results) {
    if (err) {
      console.error("조회 오류:", err);
      return res.status(500).send({ text: "조회 오류 발생" });
    }

    if (results.length === 0) {
      return res.status(404).send({ text: "아이디가 없습니다??" });
    } else {
      console.log(results[0].password);
      console.log(user.password);

      bcrypt.compare(user.password, results[0].password, (err, isMatch) => {
        if (err) {
          console.error("조회 오류2:", err);
          return res.status(500).send({ text: "조회 오류 발생" });
        }

        if (isMatch) {
          // JWT 생성
          const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });

          console.log('로그인 성공!');
          return res.json({ text: "로그인 성공", token }); // 토큰 포함하여 응답
        } else {
          console.log('비밀번호 불일치');
          return res.status(404).send({ text: "비밀번호가 일치하지 않습니다." });
        }
      });
    }
  });
});



app.post("/post", (req, res) => {
  const text1 = req.body.inID;
  const text2 = req.body.inTitle;
  const text3 = req.body.inContent;

  console.log(req.body);
  const user = { id: text1, title: text2, content: text3 };
  console.log(text1);

  conn.query('INSERT INTO posts (title, author_id, content) VALUES (?, ?, ?)',
    [user.title, user.id, user.content],
    function (err, results) {
      if (err) {
        console.error("삽입 오류:", err);
        return res.status(500).send({ text: "쓰기 오류" });
      } else {
        console.log("게시글 생성")
        return res.send({ text: "게시글 작성 완료" });
      }
    }
  );
});


// 작성자 이름을 가져오는 예시 함수
async function getAuthorName(authorId) {
  return new Promise((resolve, reject) => {
      conn.query("SELECT * FROM users WHERE id = ?", [authorId], function (err, results) {
          if (err || results.length === 0) {
              reject(null); // 작성자를 찾지 못했거나 오류 발생
          } else {
              resolve(results[0].name); // 첫 번째 결과의 이름 반환
          }
      });
  });
}


app.get("/posts", async (req, res) => { // async 추가
  conn.query("SELECT * FROM posts", async (err, results) => { // async 추가
    if (err) {
      console.error("조회 오류:", err);
      return res.status(500).send({ success: false, message: "조회 오류 발생" });
    }

    if (results.length === 0) {
      return res.send({ success: true, message: "게시물이 없습니다.", data: [] });
    }

    // 여기에서 await 사용 가능
    const modifiedResults = await Promise.all(results.map(async (post) => {
      const authorName = post.author_id ? await getAuthorName(post.author_id) : "Unknown Author"; // 작성자 이름
      
      
      return {
        post_id: post.post_id,
        title: post.title,
        content: post.content,
        authorName: authorName, // 작성자 이름
        createdDate: post.created_at.toISOString().split('T')[0] // 생성 날짜 (YYYY-MM-DD)
      };
    }));

    return res.send({ success: true, data: modifiedResults });
  });
});

app.post('/delete-post', (req, res) => {
  const id = req.body.index;

  // 데이터 검증
  if (!id) {
      return res.status(400).send({ success: false, text: '게시물 ID가 없습니다.' });
  }

  console.log("들어옴");
  console.log(id);

  const sql2 = 'DELETE FROM comments WHERE post_id = ?';

  conn.query(sql2, id, (err, result) =>{
    if (err) {
      console.error('DB 삭제 오류:', err);
      return res.status(500).send({ success: false, text: 'DB 삭제 중 오류가 발생했습니다.' });
    }
  })

  // SQL 쿼리
  const sql = 'DELETE FROM posts WHERE post_id = ?';
  conn.query(sql, id, (err, result) => {
      if (err) {
          console.error('DB 삭제 오류:', err);
          return res.status(500).send({ success: false, text: 'DB 삭제 중 오류가 발생했습니다.' });
      }

      // 삭제된 행 수 확인
      if (result.affectedRows === 0) {
          return res.status(404).send({ success: false, text: '게시물이 존재하지 않습니다.' });
      }
      console.log("ㅌㅔ스트");
      return res.send({ text: "게시글이 성공적으로 삭제되었습니다." });
  });
});

app.post("/update-post", (req, res) => {
  const text1 = req.body.inPostID;
  const text2 = req.body.inTitle;
  const text3 = req.body.inContent;

  const user = { post_id: text1, title: text2, content: text3 };

  const sql = 'UPDATE posts SET title = ?, content = ? WHERE post_id = ?';
  conn.query(sql, [user.title, user.content, user.post_id,],
    function (err, results) {
      if (err) {
        console.error("삽입 오류:", err);
        return res.status(500).send({ text: "쓰기 오류" });
      } else {
        console.log("게시글 수정");
        return res.send({ text: "게시글 수정 완료" });
      }
    }
  );
});



app.post("/comment", (req, res) => {
  const text1 = req.body.inPost;
  const text2 = req.body.inAuthor;
  const text3 = req.body.inContent;

  console.log(req.body);
  const user = { post_id: text1, author_id: text2, content: text3 };

  const sql = 'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)';
  conn.query(sql,
    [user.post_id, user.author_id, user.content],
    function (err, results) {
      if (err) {
        console.error("삽입 오류:", err);
        return res.status(500).send({ text: "쓰기 오류" });
      } else {
        console.log("댓글 생성")
        return res.send({ text: "댓글 작성 완료" });
      }
    }
  );
});

app.post('/delete-comment', (req, res) => {
  const id = req.body.commentIndex;

  // 데이터 검증
  if (!id) {
      return res.status(400).send({ success: false, text: '댓글 ID가 없습니다.' });
  }

  // SQL 쿼리
  const sql = 'DELETE FROM comments WHERE comment_id = ?';
  conn.query(sql, id, (err, result) => {
      if (err) {
          console.error('DB 삭제 오류:', err);
          return res.status(500).send({ success: false, text: 'DB 삭제 중 오류가 발생했습니다.' });
      }

      // 삭제된 행 수 확인
      if (result.affectedRows === 0) {
          return res.status(404).send({ success: false, text: '댓글이 존재하지 않습니다.' });
      }
      return res.send({ text: "댓글이 성공적으로 삭제되었습니다." });
  });
});

app.get("/comments", async (req, res) => { // async 추가
  const sql = "SELECT * FROM comments WHERE post_id = ?";

  conn.query(sql, req.query.index, async (err, results) => { 
    if (err) {
      console.error("조회 오류:", err);
      return res.status(500).send({ success: false, message: "조회 오류 발생" });
    }

    if (results.length === 0) {
      return res.send({ success: true, message: "댓글이 없습니다.", data: [] });
    }

    // 여기에서 await 사용 가능
    const modifiedResults = await Promise.all(results.map(async (com) => {
      const authorName = com.author_id ? await getAuthorName(com.author_id) : "Unknown Author"; // 작성자 이름
      
      
      return {
        comment_id: com.comment_id,
        post_id: com.post_id,
        content: com.content,
        authorName: authorName, // 작성자 이름
        createdDate: com.created_at.toISOString().split('T')[0] // 생성 날짜 (YYYY-MM-DD)
      };
    }));

    return res.send({ success: true, data: modifiedResults });
  });
});


app.listen(port, function () {
  console.log(`listening on ${port}`);
});
