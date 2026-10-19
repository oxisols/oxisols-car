export default function handler(request, response) {
  response.status(200).json({ message: "테슬라 제어 서버가 정상적으로 작동 중입니다!" });
}
