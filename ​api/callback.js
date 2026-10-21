// api/callback.js
export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code not found' });
  }

  // 브라우저 화면에 인가 코드(Code)를 출력하여 Tasker나 사용자가 복사할 수 있게 함
  return res.status(200).send(`
    <html>
      <head><title>Tesla Auth Success</title></head>
      <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h2>테슬라 인증 성공</h2>
        <p>아래의 인가 코드(Authorization Code)를 복사하세요:</p>
        <textarea style="width: 80%; height: 120px; padding: 10px; font-size: 14px;" readonly>${code}</textarea>
      </body>
    </html>
  `);
}
