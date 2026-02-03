import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
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

  async forgotPassword(email: string) {
    // Mock implementation
    console.log(`Reset password requested for ${email}`);
    return { message: 'If email exists, reset link sent' };
  }
}
