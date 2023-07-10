exports.signUpEmail = (firstName, verificationLink) => {
  return `
    <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 14px;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8f8f8;
        border-radius: 5px;
      }
      h1 {
        font-size: 24px;
        color: #2b7858;
      }
      p {
        margin-top: 10px;
      }
      .link {
        display: inline-block;
        padding: 10px 20px;
        background-color: #34c759;
        color: #ffff;
        text-decoration: none;
        border-radius: 3px;
      }
      .link:hover{
        background-color: #3b9c55;
        color: #ffff;

      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome to our platform!</h1>
      <p>Hello ${firstName},</p>
      <p>We're excited to have you on board. To complete your registration, please click the link below to verify your email address:</p>
      <a class="link" href="${verificationLink}">Verify Email Address</a>
      <p>This quick step helps us ensure the security of your account and allows you to receive important updates from us. If you have any questions or need assistance, feel free to contact our support team at support@dlsms.com.</p>
      <p>Thank you for joining us!</p>
      <p>Best, Regard<br>Augustine F. Ngobie<br>Senior Software Engineer<br>Distance Learning Student Monitoring System(DLSMS)</p>
    </div>
  </body>
</html>
    `;
};
