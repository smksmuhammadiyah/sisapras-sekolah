import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { emailLayout } from './templates/email-layout';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(user: any, token: string) {
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://simsapras-smksmuh.vercel.app';
    const url = `${frontendUrl}/auth/confirm?token=${token}`;
    const content = `
      <h2>Selamat Datang di SIM-SAPRAS!</h2>
      <p>Halo <strong>${user.username}</strong>,</p>
      <p>Terima kasih telah bergabung dengan Sistem Informasi Manajemen Sarana dan Prasarana SMKS Muhammadiyah 80.</p>
      <p>Silakan konfirmasi alamat email Anda dengan menekan tombol di bawah ini:</p>
      <div style="text-align: center;">
        <a href="${url}" class="btn">Konfirmasi Email</a>
      </div>
      <p>Jika tombol tidak berfungsi, Anda bisa menyalin link berikut ke browser Anda:</p>
      <p style="font-size: 12px; color: #64748b; word-break: break-all;">${url}</p>
    `;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Konfirmasi Akun SIM-SAPRAS',
      html: emailLayout(content, 'Konfirmasi pendaftaran akun SIM-SAPRAS Anda'),
    });
    this.logger.log(`Sending confirmation email to ${user.email}`);
  }

  async sendForgotPassword(user: any, token: string) {
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://simsapras-smksmuh.vercel.app';
    const url = `${frontendUrl}/reset-password?token=${token}`;
    const preview = `Permintaan reset password untuk akun ${user.username}`;

    const content = `
      <h2>Atur Ulang Password</h2>
      <p>Halo <strong>${user.fullName || user.username}</strong>,</p>
      <p>Kami menerima permintaan untuk mengatur ulang password akun Anda.</p>
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px;"><strong>Detail Akun:</strong></p>
        <p style="margin: 4px 0 0 0; font-size: 14px;">Username: ${user.username}</p>
        <p style="margin: 4px 0 0 0; font-size: 14px;">Role: ${user.role}</p>
      </div>
      <p>Silakan klik tombol di bawah ini untuk membuat password baru:</p>
      <div style="text-align: center;">
        <a href="${url}" class="btn">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini dengan aman.</p>
    `;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password - SIM-SAPRAS',
      html: emailLayout(content, preview),
    });
    this.logger.log(`Sending reset password email to ${user.email}`);
  }

  async sendProcurementNotification(
    email: string,
    title: string,
    status: string,
    notes?: string,
  ) {
    if (!email) {
      this.logger.warn('No email provided for notification');
      return;
    }

    const subject = `Update Status Pengadaan: ${title}`;
    const color =
      status === 'APPROVED'
        ? '#10b981'
        : status === 'REJECTED'
          ? '#ef4444'
          : '#3b82f6';
    const bgColor =
      status === 'APPROVED'
        ? '#ecfdf5'
        : status === 'REJECTED'
          ? '#fef2f2'
          : '#eff6ff';
    const statusText =
      status === 'APPROVED'
        ? 'DISETUJUI'
        : status === 'REJECTED'
          ? 'DITOLAK'
          : status;

    const content = `
      <h2>Status Pengadaan Diperbarui</h2>
      <p>Halo,</p>
      <p>Usulan pengadaan Anda telah diproses oleh Admin dengan hasil sebagai berikut:</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600;">Judul Usulan</p>
        <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0f172a;">${title}</p>
        
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600;">Status Terbaru</p>
        <span class="badge" style="background-color: ${bgColor}; color: ${color}; padding: 6px 16px;">${statusText}</span>
      </div>

      ${
        notes
          ? `
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: #92400e; font-size: 14px;">Catatan Admin:</p>
        <p style="margin: 0; color: #b45309; font-style: italic;">"${notes}"</p>
      </div>
      `
          : ''
      }
      
      <p>Silakan login ke aplikasi dashboard untuk melihat rincian lengkap atau melakukan langkah selanjutnya.</p>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'https://simsapras-smksmuh.vercel.app'}/dashboard" class="btn">Buka Dashboard</a>
      </div>
    `;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        html: emailLayout(
          content,
          `Usulan pengadaan "${title}" telah ${statusText}`,
        ),
      });
      this.logger.log(`Sending procurement notification to ${email}`);
    } catch (e) {
      this.logger.error(`Failed to send email to ${email}: ${e.message}`);
    }
  }
}
