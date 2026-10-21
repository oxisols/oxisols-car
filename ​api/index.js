module.exports = (req, res) => {
  return res.status(200).json({
    status: 'online',
    service: 'Tesla Fleet API Bridge',
    timestamp: new Date().toISOString()
  });
};
