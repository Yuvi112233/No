import { Resend } from 'resend';

class EmailService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('RESEND_API_KEY is not set in environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('RESEND')));
      throw new Error('RESEND_API_KEY is required');
    }

    this.resend = new Resend(apiKey);
    console.log('Resend email service initialized successfully');
  }

  async sendOTP(email: string, otp: string, name: string = 'User'): Promise<boolean> {
    try {
      console.log(`Attempting to send email OTP to: ${email}`);

      const { data, error } = await this.resend.emails.send({
        from: 'AltQ <team@altq.in>', // Use your verified domain or resend.dev for testing
        to: [email],
        subject: 'AltQ - Email Verification Code',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);">
            <div style="background-color: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(20, 184, 166, 0.15); border: 1px solid #99f6e4;">
              <!-- Header with Gradient -->
              <div style="text-align: center; margin-bottom: 35px; padding-bottom: 25px; border-bottom: 2px solid #5eead4;">
                <div style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                  <h1 style="margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -1px;">AltQ</h1>
                </div>
                <p style="color: #0f766e; margin: 8px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Smart Queue Management</p>
              </div>
              
              <!-- Title -->
              <h2 style="color: #0f766e; margin-bottom: 20px; font-size: 24px; font-weight: 700;">Email Verification</h2>
              
              <!-- Message -->
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Hi <strong style="color: #0f766e;">${name}</strong>,<br><br>
                Thank you for registering with AltQ! To complete your account setup, please verify your email address using the code below:
              </p>
              
              <!-- OTP Box with Gradient Border -->
              <div style="text-align: center; margin: 35px 0;">
                <div style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 3px; border-radius: 12px; display: inline-block; box-shadow: 0 8px 24px rgba(20, 184, 166, 0.25);">
                  <div style="background-color: white; padding: 25px 40px; border-radius: 10px;">
                    <span style="font-size: 36px; font-weight: 900; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                  </div>
                </div>
              </div>
              
              <!-- Info Box -->
              <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%); border-left: 4px solid #14b8a6; padding: 16px 20px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #0f766e; font-size: 14px; line-height: 1.6; margin: 0;">
                  ⏱️ This verification code will expire in <strong>5 minutes</strong>.<br>
                  🔒 If you didn't request this verification, please ignore this email.
                </p>
              </div>
              
              <!-- Security Note -->
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 25px;">
                <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
                  🛡️ <strong>Security Tip:</strong> Never share this code with anyone. AltQ will never ask for your verification code.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="border-top: 2px solid #e2e8f0; padding-top: 25px; margin-top: 35px;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
                  This is an automated message from <strong style="color: #0f766e;">AltQ</strong>.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </div>
            
            <!-- Bottom Branding -->
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #64748b; font-size: 11px; margin: 0;">
                © 2025 AltQ. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Resend email error:', error);
        return false;
      }

      console.log('Email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendPasswordReset(email: string, resetToken: string, name: string = 'User'): Promise<boolean> {
    try {
      console.log(`Attempting to send password reset email to: ${email}`);

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;

      const { data, error } = await this.resend.emails.send({
        from: 'AltQ <team@altq.in>',
        to: [email],
        subject: 'AltQ - Password Reset Request',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);">
            <div style="background-color: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(20, 184, 166, 0.15); border: 1px solid #99f6e4;">
              <!-- Header with Gradient -->
              <div style="text-align: center; margin-bottom: 35px; padding-bottom: 25px; border-bottom: 2px solid #5eead4;">
                <div style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                  <h1 style="margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -1px;">AltQ</h1>
                </div>
                <p style="color: #0f766e; margin: 8px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Smart Queue Management</p>
              </div>
              
              <!-- Title -->
              <h2 style="color: #0f766e; margin-bottom: 20px; font-size: 24px; font-weight: 700;">Password Reset Request</h2>
              
              <!-- Message -->
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Hi <strong style="color: #0f766e;">${name}</strong>,<br><br>
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- Reset Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 24px rgba(20, 184, 166, 0.25); transition: transform 0.2s;">
                  Reset Password
                </a>
              </div>
              
              <!-- Alternative Link -->
              <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 25px 0; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #14b8a6; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <!-- Info Box -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #991b1b; font-size: 14px; line-height: 1.6; margin: 0;">
                  ⏱️ This password reset link will expire in <strong>1 hour</strong>.<br>
                  🔒 If you didn't request this reset, please ignore this email or contact support if you have concerns.
                </p>
              </div>
              
              <!-- Security Note -->
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 25px;">
                <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
                  🛡️ <strong>Security Tip:</strong> Never share your password reset link with anyone. AltQ will never ask for your password.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="border-top: 2px solid #e2e8f0; padding-top: 25px; margin-top: 35px;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
                  This is an automated message from <strong style="color: #0f766e;">AltQ</strong>.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </div>
            
            <!-- Bottom Branding -->
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #64748b; font-size: 11px; margin: 0;">
                © 2025 AltQ. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Resend password reset email error:', error);
        return false;
      }

      console.log('Password reset email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('Password reset email sending failed:', error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      // Test the connection by attempting to get API key info
      const { data, error } = await this.resend.apiKeys.list();

      if (error) {
        console.error('Resend connection failed:', error);
        return false;
      }

      console.log('Resend service is ready');
      return true;
    } catch (error) {
      console.error('Resend service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();