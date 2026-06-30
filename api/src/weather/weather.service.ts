import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WeatherData {
  city: string;
  description: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('OPENWEATHER_API_KEY');
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric',
        },
      });

      const data = response.data;

      return {
        city: data.name,
        description: data.weather[0].description,
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      };
    } catch (err) {
      this.logger.error(`Failed to fetch weather for city: ${city}`, err);
      throw err;
    }
  }
}
