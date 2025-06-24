

export const EmailTemplates = {
  otp: (otp: string) => ({
    subject: "Verify your Nanis sign-up",
    text: `We have received a sign-up attempt with the following code: ${otp}. Please enter it in the browser window where you started signing up for Nanis.`,
    html: `
      <div style="background-color:#f9f8fc; padding:40px 20px; display:flex; justify-content:center; font-family:sans-serif;">
        <div style="max-width:500px; background:white; border-radius:12px; padding:40px 32px; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          
          <img src="https://yourdomain.com/logo.png" alt="Nanis" style="width:48px; height:48px; margin-bottom:20px;" />

          <h2 style="font-size:22px; color:#111; margin-bottom:10px;">Verify your Nanis sign-up</h2>

          <p style="font-size:15px; color:#555; margin:0 0 20px;">
            We have received a sign-up attempt with the following code. Please enter it in the browser window where you started signing up for Nanis.
          </p>

          <div style="margin:30px auto; padding:16px; background-color:#f3f3f3; border-radius:8px; font-size:32px; font-weight:bold; color:#222; letter-spacing:2px; max-width:200px;">
            ${otp}
          </div>

          <p style="font-size:14px; color:#888; margin-top:20px;">
            If you did not attempt to sign up but received this email, please disregard it.<br />
            The code will remain active for 10 minutes.
          </p>

          <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

          <p style="font-size:13px; color:#aaa;">
            Nanis, an effortless identity solution with all the features you need.
          </p>

          <div style="margin-top:16px;">
            <a href="https://discord.com/" style="margin:0 8px;"><img src="https://img.icons8.com/ios-filled/24/999999/discord-logo.png"/></a>
            <a href="https://github.com/" style="margin:0 8px;"><img src="https://img.icons8.com/ios-filled/24/999999/github.png"/></a>
            <a href="https://twitter.com/" style="margin:0 8px;"><img src="https://img.icons8.com/ios-filled/24/999999/twitter.png"/></a>
            <a href="mailto:support@nanis.com" style="margin:0 8px;"><img src="https://img.icons8.com/ios-filled/24/999999/new-post.png"/></a>
          </div>

          <p style="font-size:11px; color:#ccc; margin-top:16px;">© ${new Date().getFullYear()} Nanis. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  welcome: (name: string) => ({
    subject: "Welcome to Nanis!",
    text: `Hi ${name}, welcome to Nanis. We're glad to have you here!`,
    html: `
      <div style="font-family: sans-serif; font-size: 15px;">
        <p>Hi ${name},</p>
        <p>Welcome to <strong>Nanis</strong>! We're thrilled to have you.</p>
        <p>If you have any questions, just reply to this email—we're always happy to help.</p>
        <br/>
        <p>Cheers,<br/>The Nanis Team</p>
      </div>
    `
  })
};

