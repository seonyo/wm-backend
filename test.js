const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0000', // MySQL 비밀번호
  database: 'wm', // 데이터베이스 이름
});

// MySQL 연결
db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 오류:', err);
    throw err;
  }
  console.log('MySQL 데이터베이스에 연결되었습니다.');
});

// POST 요청을 처리하는 엔드포인트
app.post('/api/sendUserInfo', (req, res) => {
  const { name, email, profileImage } = req.body;

  // 사용자 정보를 데이터베이스에 저장 또는 업데이트합니다.
  // 이미 존재하는 사용자인지 확인하고, 존재하지 않으면 새로운 사용자로 추가합니다.
  db.query(
    'INSERT INTO userinfo (nickname, email, profile_picture_url) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nickname=?, email=?, profile_picture_url=?',
    [name, email, profileImage, name, email, profileImage],
    (err, result) => {
      if (err) {
        console.error('사용자 정보 저장 또는 업데이트 중 오류 발생:', err);
        res.status(500).json({ error: '사용자 정보를 처리하는 중 오류가 발생했습니다.' });
      } else {
        console.log('사용자 정보 저장 또는 업데이트 완료');
        res.status(200).json({ message: '사용자 정보를 저장 또는 업데이트했습니다.' });
      }
    }
  );
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
