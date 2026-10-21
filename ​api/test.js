module.exports = (req, res) => {
  return res.status(200).json({
    status: 'online',
    message: 'Test API works perfectly!',
    timestamp: new Date().toISOString()
  });
};
