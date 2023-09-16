const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors'); // cors 미들웨어 추가

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors()); // CORS 미들웨어를 추가하여 모든 도메인에서의 요청 허용 (개발용)

// MySQL 데이터베이스 설정
const db = mysql.createConnection({
    host: 'localhost', // MySQL 호스트
    user: 'root',      // MySQL 사용자
    password: '0000',  // MySQL 비밀번호
    database: 'wm'     // 사용할 데이터베이스 이름
});


// 데이터베이스 연결
db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 오류:', err);
        throw err;
    }
    console.log('MySQL 데이터베이스에 연결되었습니다.');

    // likes 테이블 생성
    db.query(`
        CREATE TABLE IF NOT EXISTS likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            store_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err, result) => {
        if (err) {
            console.error('테이블 생성 중 오류 발생:', err);
        } else {
            console.log('likes 테이블이 생성되었습니다.');
        }
    });
});

// 찜 추가 및 찜 목록 조회 API
// 찜 추가 및 찜 목록 조회 API
app.post('/like', (req, res) => {
    const { user_id, store_id } = req.body;

    if (!user_id || !store_id) {
        res.status(400).json({ message: 'user_id와 store_id는 필수 입력 사항입니다.' });
        return;
    }

    // 사용자 및 상점 정보는 각각 userinfo 및 info 테이블에서 가져오기
    db.query('SELECT id FROM userinfo WHERE id = ?', [user_id], (err, userResults) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: '사용자 정보 조회 중 오류가 발생했습니다.' });
            return;
        }

        db.query('SELECT id FROM info WHERE id = ?', [store_id], (err, storeResults) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ message: '상점 정보 조회 중 오류가 발생했습니다.' });
                return;
            }

            if (userResults.length === 0) {
                res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
                return;
            }

            if (storeResults.length === 0) {
                res.status(404).json({ message: '상점을 찾을 수 없습니다.' });
                return;
            }

            // 찜 추가
            db.query('INSERT INTO likes (user_id, store_id) VALUES (?, ?)', [user_id, store_id], (err, result) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ message: '찜 추가 중 오류가 발생했습니다.' });
                } else {
                    // 찜 추가 성공
                    res.status(201).json({ message: '찜 추가 성공' });
                }
            });
        });
    });
});


// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});