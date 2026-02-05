import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) { }

  async sendUserConfirmation(user: any, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to SIM-SAPRAS! Confirm your Email',
      html: `
        <h3>Hello ${user.username},</h3>
        <p>Please click below to confirm your email</p>
        <p><a href="${url}">Confirm</a></p>
      `,
    });
    this.logger.log(`Sending confirmation email to ${user.email}`);
  }

  async sendForgotPassword(user: any, token: string) {
    const url = `http://localhost:3001/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password - SIM-SAPRAS',
      html: `
           <h3>Halo ${user.fullName || user.username},</h3>
           <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
           <ul>
             <li><b>Username:</b> ${user.username}</li>
             <li><b>Role:</b> ${user.role}</li>
           </ul>
           <p>Klik link berikut untuk mengatur password baru:</p>
           <p><a href="${url}" style="background-color:#3b82f6;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a></p>
           <p>Link ini berlaku selama 1 jam.</p>
           <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        `
    });
    this.logger.log(`Sending reset password email to ${user.email}`);
  }

  async sendProcurementNotification(email: string, title: string, status: string, notes?: string) {
    if (!email) {
      this.logger.warn('No email provided for notification');
      return;
    }

    let subject = `Update Status Pengadaan: ${title}`;
    let color = status === 'APPROVED' ? 'green' : (status === 'REJECTED' ? 'red' : 'blue');
    let statusText = status === 'APPROVED' ? 'DISETUJUI' : (status === 'REJECTED' ? 'DITOLAK' : status);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        html: `
            <h3>Status Pengadaan Diperbarui</h3>
            <p>Halo,</p>
            <p>Usulan pengadaan Anda dengan judul:</p>
            <p style="background-color:#f3f4f6;padding:10px;border-radius:5px;font-weight:bold;">${title}</p>
            <p>Telah diperbarui menjadi: <b style="color:${color};font-size:16px;">${statusText}</b></p>
            
            ${notes ? `
            <div style="margin-top:10px;border-left:4px solid ${color};padding-left:10px;">
              <p style="margin:0;font-weight:bold;">Catatan Admin:</p>
              <p style="margin:5px 0 0 0;font-style:italic;">"${notes}"</p>
            </div>
            ` : ''}
            
            <p style="margin-top:20px;">Silakan login ke aplikasi untuk melihat detail selengkapnya.</p>
        `
      });
      this.logger.log(`Sending procurement notification to ${email}`);
    } catch (e) {
      this.logger.error(`Failed to send email to ${email}: ${e.message}`);
    }
  }
}
