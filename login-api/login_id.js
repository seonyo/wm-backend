const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

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

    // user_info 테이블 생성
    db.query(`
        CREATE TABLE IF NOT EXISTS userinfo (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nickname VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            profile_picture_url VARCHAR(255),
            kakao_id INT(255) UNIQUE
        )
    `, (err, result) => {
        if (err) {
            console.error('테이블 생성 중 오류 발생:', err);
        } else {
            console.log('user_info 테이블이 생성되었습니다.');
        }
    });
});

// 회원가입 API
app.post('/signup', (req, res) => {
    const { profile_image, name, email, kakao_id } = req.body;

    if (!name) {
        res.status(400).json({ message: '이름은 필수 입력 사항입니다.' });
        return;
    }

    // 이미 등록된 사용자인지 확인
    db.query('SELECT * FROM userinfo WHERE kakao_id = ?', [kakao_id], (err, results) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: '가입 중 오류가 발생했습니다.' });
        } else if (results.length > 0) {
            res.status(409).json({ message: '이미 가입한 사용자입니다.' });
        } else {
            // 사용자 정보를 user_info 테이블에 추가
            db.query('INSERT INTO userinfo (profile_picture_url, name, email, kakao_id) VALUES (?, ?, ?, ?)', [profile_image, name, email, kakao_id], (err, result) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ message: '가입 중 오류가 발생했습니다.' });
                } else {
                    res.status(201).json({ message: '가입 성공' });
                }
            });
        }
    });
});

// 로그인 API (카카오 ID로 사용자 찾기)
app.post('/login', (req, res) => {
    const { kakao_id, profile_image, nickname, email } = req.body;

    // 데이터베이스에서 해당 kakao_id로 사용자 찾기
    db.query('SELECT * FROM userinfo WHERE kakao_id = ?', [kakao_id], (err, results) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
        } else if (results.length > 0) {
            // 이미 존재하는 사용자인 경우, 프로필 정보를 업데이트
            const user_id = results[0].id;
            db.query('UPDATE userinfo SET profile_picture_url = ?, name = ?, email = ? WHERE id = ?', [profile_image, nickname, email, user_id], (err, updateResult) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
                } else {
                    res.status(200).json({ message: '로그인 성공', user_id });
                }
            });
        } else {
            // 새로운 사용자인 경우, 사용자 정보를 추가
            db.query('INSERT INTO userinfo (profile_picture_url, name, email, kakao_id) VALUES (?, ?, ?, ?)', [profile_image, nickname, email, kakao_id], (err, insertResult) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
                } else {
                    res.status(200).json({ message: '로그인 성공', user_id: insertResult.insertId });
                }
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
