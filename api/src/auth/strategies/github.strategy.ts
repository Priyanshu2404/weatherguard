import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID', 'placeholder'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET', 'placeholder'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL', 'http://localhost:3000/api/auth/github/callback'),
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: unknown) => void,
  ): Promise<void> {
    const { id, displayName, username, emails, photos } = profile;
    const email = emails?.[0]?.value ?? '';
    const avatar = photos?.[0]?.value ?? null;

    const user = await this.usersService.findOrCreate({
      email,
      name: displayName || username || email,
      avatar,
      provider: 'github',
      providerId: id,
    });

    done(null, user);
  }
}
