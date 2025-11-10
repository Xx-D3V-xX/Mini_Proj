import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WeatherClientService {
  constructor(private readonly config: ConfigService) {}

  async current(lat = 19.076, lng = 72.8777) {
    const mode = this.config.get('WEATHER_MODE') ?? 'mock';
    if (mode === 'live') {
      const apiKey = this.config.get('WEATHER_API_KEY');
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
      const { data } = await axios.get(url);
      return {
        status: data.current_weather.weathercode,
        description: 'Live weather snapshot',
        temperature_c: data.current_weather.temperature,
        humidity: 70,
        icon: 'live',
      };
    }
    return {
      status: 'mock',
      description: 'Humid with coastal breeze',
      temperature_c: 29,
      humidity: 78,
      icon: 'sun',
    };
  }
}
