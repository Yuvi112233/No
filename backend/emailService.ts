import { Resend } from 'resend';

class EmailService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('RESEND_API_KEY is not set in environment variables');
      throw new Error('RESEND_API_KEY is required');
    }

    this.resend = new Resend(apiKey);
  }

  async sendOTP(email: string, otp: string, name: string = 'User'): Promise<boolean> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'AltQ <team@altq.in>', // Use your verified domain or resend.dev for testing
        to: [email],
        subject: 'AltQ - Email Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <style>
              @media only screen and (max-width: 600px) {
                .email-container {
                  padding: 10px !important;
                }
                .email-content {
                  padding: 20px !important;
                }
                .logo-text {
                  font-size: 28px !important;
                }
                .subtitle {
                  font-size: 11px !important;
                  letter-spacing: 0.5px !important;
                }
                .title {
                  font-size: 20px !important;
                }
                .message-text {
                  font-size: 14px !important;
                }
                .otp-code {
                  font-size: 32px !important;
                  letter-spacing: 6px !important;
                  padding: 20px 25px !important;
                }
                .info-box {
                  padding: 12px 15px !important;
                  font-size: 13px !important;
                }
                .security-note {
                  padding: 12px !important;
                  font-size: 12px !important;
                }
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f0fdfa;">
            <div class="email-container" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);">
              <div class="email-content" style="background-color: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(20, 184, 166, 0.15); border: 1px solid #99f6e4;">
                <!-- Header with Gradient -->
                <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #5eead4;">
                  <div style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    <h1 class="logo-text" style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; color: #14b8a6;">AltQ</h1>
                  </div>
                  <p class="subtitle" style="color: #0f766e; margin: 8px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">Smart Queue Management</p>
                </div>
                
                <!-- Title -->
                <h2 class="title" style="color: #0f766e; margin-bottom: 15px; font-size: 22px; font-weight: 700; text-align: center;">Email Verification</h2>
                
                <!-- Message -->
                <p class="message-text" style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
                  Hi <strong style="color: #0f766e;">${name}</strong>,<br><br>
                  Thank you for registering with AltQ! To complete your account setup, please verify your email address using the code below:
                </p>
                
                <!-- OTP Box with Gradient Border -->
                <div style="text-align: center; margin: 25px 0;">
                  <div style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 3px; border-radius: 12px; display: inline-block; box-shadow: 0 8px 24px rgba(20, 184, 166, 0.25); max-width: 100%;">
                    <div style="background-color: white; padding: 20px 30px; border-radius: 10px;">
                      <span class="otp-code" style="font-size: 36px; font-weight: 900; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 8px; font-family: 'Courier New', monospace; color: #14b8a6; display: inline-block;">${otp}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Info Box -->
                <div class="info-box" style="background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%); border-left: 4px solid #14b8a6; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #0f766e; font-size: 13px; line-height: 1.6; margin: 0;">
                    ⏱️ This verification code will expire in <strong>5 minutes</strong>.<br>
                    🔒 If you didn't request this verification, please ignore this email.
                  </p>
                </div>
                
                <!-- Security Note -->
                <div class="security-note" style="background-color: #f8fafc; padding: 14px; border-radius: 8px; margin-top: 20px;">
                  <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                    🛡️ <strong>Security Tip:</strong> Never share this code with anyone. AltQ will never ask for your verification code.
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 25px;">
                  <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0; line-height: 1.5;">
                    This is an automated message from <strong style="color: #0f766e;">AltQ</strong>.<br>
                    Please do not reply to this email.
                  </p>
                </div>
              </div>
              
              <!-- Bottom Branding -->
              <div style="text-align: center; margin-top: 15px;">
                <p style="color: #64748b; font-size: 10px; margin: 0;">
                  © 2025 AltQ. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('Resend email error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendPasswordReset(email: string, resetToken: string, name: string = 'User'): Promise<boolean> {
    try {
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

      return true;
    } catch (error) {
      console.error('Resend service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();