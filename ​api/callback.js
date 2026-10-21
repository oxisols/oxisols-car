export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).json({ error: 'Authorization failed', details: error });
  }

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    const tokenResponse = await fetch('https://auth.tesla.com/oauth2/v3/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.TESLA_CLIENT_ID,
        client_secret: process.env.TESLA_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.TESLA_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to exchange token', 
        details: tokenData 
      });
    }

    // 성공 시 토큰 반환 (실제 운영 시 DB 저장 또는 안전한 자동화 연동 처리)
    return res.status(200).json({
      message: 'Tesla OAuth Authentication Successful!',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in
    });

  } catch (err) {
    console.error('OAuth Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
