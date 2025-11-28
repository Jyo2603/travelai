const WEATHER_PRESETS: Record<string, { temp: string; season: string; bestMonths: string }> = {
  default: {
    temp: '27°C',
    season: 'Warm & Pleasant',
    bestMonths: 'October–March',
  },
};

export function getWeatherSnapshot(countryOrCity: string) {
  const key = (countryOrCity || '').toLowerCase();
  const preset = WEATHER_PRESETS[key] || WEATHER_PRESETS.default;
  return preset;
}
