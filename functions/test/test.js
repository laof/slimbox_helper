exports.handler = async (event, context) => {
  const today = new Date().toLocaleString("zh-cn", {
    timeZone: "Asia/Shanghai",
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ date: today }),
  };
};
