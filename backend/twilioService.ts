import twilio, { Twilio } from 'twilio';
interface TwilioConfig {
  accountSid: string;
  authToken: string;
  verifyServiceSid: string;
}

class TwilioService {
  private accountSid: string;
  private authToken: string;
  private verifyServiceSid: string;
  private client: Twilio | null = null;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '';

    // Initialize client if creds available
    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
    }
  }

  async sendOTP(phoneNumber: string, name: string = 'User'): Promise<boolean> {
    try {
      const formatted = this.formatPhoneNumber(phoneNumber);
      console.log('Sending OTP to phone:', formatted);

      if (!this.client) {
        this.client = twilio(this.accountSid, this.authToken);
      }

      const res = await this.client.verify.v2.services(this.verifyServiceSid)
        .verifications
        .create({ to: formatted, channel: 'sms' });

      console.log('Twilio OTP sent successfully, SID:', res.sid);
      return true;
    } catch (error: any) {
      console.error('Twilio Verify send failed:', {
        message: error?.message,
        code: error?.code,
        moreInfo: error?.moreInfo,
        status: error?.status
      });
      return false;
    }
  }

  async verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const formatted = this.formatPhoneNumber(phoneNumber);
      console.log('Verifying OTP for phone:', formatted, 'with code:', code);
      
      if (!this.client) {
        this.client = twilio(this.accountSid, this.authToken);
      }

      const check = await this.client.verify.v2.services(this.verifyServiceSid)
        .verificationChecks
        .create({ to: formatted, code });

      console.log('Twilio verification result:', check.status);
      return check.status === 'approved';
    } catch (error: any) {
      console.error('Twilio Verify check failed:', {
        message: error?.message,
        code: error?.code,
        moreInfo: error?.moreInfo,
        status: error?.status
      });
      return false;
    }
  }

  async makeCall(phoneNumber: string, salonName: string): Promise<boolean> {
    try {
      const formatted = this.formatPhoneNumber(phoneNumber);

      if (!this.client) {
        this.client = twilio(this.accountSid, this.authToken);
      }

      // Get Twilio phone number from environment
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!fromNumber) {
        throw new Error('TWILIO_PHONE_NUMBER not configured');
      }

      // Make call with TwiML to say a message
      const call = await this.client.calls.create({
        to: formatted,
        from: fromNumber,
        twiml: `<Response><Say>Hello, this is ${salonName}. Your turn is coming up. Please check your phone for details.</Say></Response>`
      });

      return true;
    } catch (error: any) {
      console.error('Twilio call failed:', error?.message || error);
      throw error;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // If it starts with 0, replace with country code (assuming India +91)
    if (cleaned.startsWith('0')) {
      cleaned = '91' + cleaned.substring(1);
    }

    // If it doesn't start with country code, add India code for 10-digit numbers
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }

    // Ensure it has + prefix for E.164
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }
}

export default new TwilioService();
