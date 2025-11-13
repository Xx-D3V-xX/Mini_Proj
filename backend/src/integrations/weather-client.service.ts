import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WeatherClientService {
  constructor(private readonly config: ConfigService) {}

  async current(lat = 19.076, lng = 72.8777) {
    const mode = (this.config.get('WEATHER_MODE') ?? 'mock').toLowerCase();
    if (mode === 'live' || mode === 'api') {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
      const { data } = await axios.get(url);
      const temperature = data?.current_weather?.temperature ?? null;
      return {
        summary: 'Live weather snapshot',
        advice: temperature && temperature > 34 ? 'High heat expected; schedule outdoor plans for evening.' : 'Weather looks fine. Keep hydrated.',
        status: data?.current_weather?.weathercode ?? 'live',
        temperature_c: temperature,
        humidity: 70,
        icon: 'live',
      };
    }
    // mock fallback
    return {
      summary: 'Mock: Warm with coastal breeze',
      advice: 'Carry water; plan indoor in afternoon heat.',
      status: 'mock',
      temperature_c: 29,
      humidity: 78,
      icon: 'sun',
    };
  }
}
