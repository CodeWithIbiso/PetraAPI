export const confirmationEmail = ({ to, code }) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email Address</title>
         
      </head>
      <body>
        <h1>Verify Your Email Address</h1>
        <p>Dear ${to},</p>
        <p>Thank you for creating an account with us! To ensure the security of your account, we require all users to verify their email address.</p>
        <p>Please use the code below to verify your email address:</p>
        <h3>${code}</h3>
        <p>Please note that this code will expire in 5 minutes. If you did not register for an account with us, please disregard this email.</p>
        <p>Thank you for choosing Petra. If you have any questions or concerns, please do not hesitate to contact us.</p>
      </body>
    </html>
    `;
};

export const passwordResetEmail = ({ to, code }) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email Address</title>
       
    </head>
    <body>
      <h1>Verify Your Email Address</h1>
      <p>Dear ${to},</p>
      <p>We received a request to reset your password for your Petra account. If you did not request a password reset, please ignore this email.</p>
      <p>To reset your password, please enter the five-digit code below in the appropriate field on the password reset page</p>
      <h3>${code}</h3>
      <p>Please note that this code will expire in 5 minutes. If you have any issues resetting your password, please contact our support team.</p>
      <p>Thank you for using Petra.</p>
    </body>
  </html>
  `;
};
