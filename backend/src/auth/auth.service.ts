import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private prisma: PrismaService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check approval status
    if (!user.isApproved) {
      throw new UnauthorizedException('Account pending approval by Admin');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
      }
    };
  }

  async register(registerDto: any) {
    // Check if user exists
    const existing = await this.usersService.findOne(registerDto.username);
    if (existing) {
      throw new UnauthorizedException('Username already exists');
    }

    // Create user (defaults: role=GUEST, isApproved=false)
    const newUser = await this.usersService.create(registerDto);

    const { password, ...result } = newUser;
    return result;
  }

  async changePassword(userId: string, changePasswordDto: any) {
    const user = await this.usersService.findOne(changePasswordDto.username);
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid current password');

    return this.usersService.update(userId, { password: changePasswordDto.newPassword });
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Find user by email
    const user = await this.prisma.user.findFirst({ where: { email } });

    // Always return success message (security: don't reveal if email exists)
    if (!user) {
      return { message: 'Jika email terdaftar, link reset password akan dikirim' };
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save to database
    await this.prisma.passwordReset.create({
      data: {
        email,
        token,
        expiresAt,
      }
    });

    // Send email with user details
    try {
      await this.mailService.sendForgotPassword(user, token);
    } catch (e) {
      console.error('Failed to send email:', e);
    }

    return { message: 'Jika email terdaftar, link reset password akan dikirim' };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new BadRequestException('Token dan password baru wajib diisi');
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new BadRequestException('Password harus minimal 8 karakter, mengandung huruf dan angka.');
    }

    // Find valid token
    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetRecord) {
      throw new BadRequestException('Token tidak valid atau sudah kadaluarsa');
    }

    // Find user
    const user = await this.prisma.user.findFirst({ where: { email: resetRecord.email } });
    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('Password baru tidak boleh sama dengan password lama.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Mark token as used
    await this.prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true }
    });

    return { message: 'Password berhasil direset. Silakan login dengan password baru.' };
  }
}

