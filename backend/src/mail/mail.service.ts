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

  async sendForgotPassword(email: string, token: string) {
    const url = `http://localhost:3000/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Password Request',
      html: `
           <h3>Reset Password</h3>
           <p>Click here to reset your password:</p>
           <p><a href="${url}">Reset Password</a></p>
        `
    });
    this.logger.log(`Sending reset password email to ${email}`);
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
            <h3>Status Usulan Pengadaan Diperbarui</h3>
            <p>Usulan <b>"${title}"</b> statusnya kini: <b style="color:${color}">${statusText}</b>.</p>
            ${notes ? `<p>Catatan: ${notes}</p>` : ''}
            <p>Silakan login ke aplikasi untuk detailnya.</p>
        `
      });
      this.logger.log(`Sending procurement notification to ${email}`);
    } catch (e) {
      this.logger.error(`Failed to send email to ${email}: ${e.message}`);
    }
  }
}
