const attachCookies = ({ res, token }) => {
  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    // If is production we sent it to secure
    secure: process.env.NODE_ENV === "production",
  });
};

export default attachCookies;
