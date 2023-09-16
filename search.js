const http = require('http');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const hostname = 'localhost';
const port = 3000;

const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'wm'
});

const corsOptions = {
  origin: 'http://127.0.0.1:5500', // 클라이언트의 웹 주소에 맞게 설정
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static('public')); // 정적 파일을 제공할 디렉터리 설정

// MySQL 연결
db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 오류:', err);
    throw err;
  }
  console.log('MySQL 데이터베이스에 연결되었습니다.');

  db.query(`DROP TABLE IF EXISTS user_info`, (err, result) => {
    if (err) {
      console.log(err);
      db.end();
      return;
    }
    console.log('테이블 삭제 완료');
  });

  // user_info 테이블 생성
  db.query(`
    CREATE TABLE user_info (
      id INT AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      profile_picture_url VARCHAR(255),
      PRIMARY KEY(id)
    )
  `, (err, result) => {
    if (err) {
      console.error('테이블 생성 중 오류 발생:', err);
      db.end();
      return;
    }
    console.log('user_info 테이블이 생성되었습니다.');
  });
});

// POST 요청 처리
app.post('/search', (req, res) => {
  try {
    // 검색어 가져오기
    const searchTerm = req.body.searchTerm;

    // MySQL에서 검색 쿼리와 일치하는 항목을 찾기
    db.query(
      `SELECT * FROM info WHERE CONCAT(facility_name, sido_name, sigungu_code, road_address, longitude, providing_agency_code) LIKE ?`,
      [`%${searchTerm}%`],
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        // 결과를 클라이언트에게 반환
        res.json(results);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 서버 생성 및 실행
const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
