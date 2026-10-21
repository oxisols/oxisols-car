export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { vin, command, payload } = req.body;
  // Vercel 환경 변수에 등록된 Tesla Access Token 사용 (또는 요청 본문에서 전달)
  const accessToken = req.body.accessToken || process.env.TESLA_ACCESS_TOKEN;

  if (!vin || !command) {
    return res.status(400).json({ error: 'Missing required parameters (vin, command)' });
  }

  try {
    // Tesla Fleet API 공식 엔드포인트 호출 (북미/유럽 등 리전에 맞게 도메인 조정)
    const teslaResponse = await fetch(`https://fleet-api.prd.na.cloud.tesla.com/api/1/vehicles/${vin}/command/${command}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload || {})
    });

    const data = await teslaResponse.json();
    return res.status(teslaResponse.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
