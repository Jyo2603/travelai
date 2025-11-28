export function estimateBudget(destination: any, preferences: any) {
  const days = Number(preferences.tripDuration) || 3;

  // 1. Region-based multipliers
  const regionMultipliers: Record<string, number> = {
    Europe: 2.2,
    USA: 2.5,
    MiddleEast: 1.4,
    SoutheastAsia: 0.8,
    SouthAsia: 0.6,
    EastAsia: 1.3,
    Australia: 2.0,
    Africa: 1.1,
    Default: 1.0,
  };

  const country: string = destination.country || '';
  let region: keyof typeof regionMultipliers = 'Default';

  if (/France|Italy|Germany|Switzerland|Austria|UK|Spain/.test(country)) region = 'Europe';
  if (/USA|Canada/.test(country)) region = 'USA';
  if (/UAE|Oman|Qatar|Saudi/.test(country)) region = 'MiddleEast';
  if (/Thailand|Vietnam|Malaysia|Indonesia|Singapore|Philippines/.test(country))
    region = 'SoutheastAsia';
  if (/India|Nepal|Sri Lanka|Bangladesh/.test(country)) region = 'SouthAsia';
  if (/Japan|South Korea|China/.test(country)) region = 'EastAsia';
  if (/Australia|New Zealand/.test(country)) region = 'Australia';
  if (/South Africa|Kenya|Tanzania|Egypt/.test(country)) region = 'Africa';

  const multiplier = regionMultipliers[region];

  // 2. Base cost
  let flightBase = 12000 * multiplier;
  let stayPerNight = 4000 * multiplier;
  let foodPerDay = 1500 * multiplier;
  let activitiesPerDay = 1200 * multiplier;

  // 3. Hotel preference adjustments
  if (/5 Star/.test(preferences.hotelPreference)) stayPerNight *= 2.3;
  if (/4 Star/.test(preferences.hotelPreference)) stayPerNight *= 1.7;
  if (/3 Star/.test(preferences.hotelPreference)) stayPerNight *= 1.3;

  // 4. Travel style adjustments
  if (/Family/.test(preferences.travelStyle)) {
    foodPerDay *= 1.6;
    activitiesPerDay *= 1.4;
  }
  if (/Group/.test(preferences.travelStyle)) {
    stayPerNight *= 0.8;
  }

  // Final Calculations
  const flight = Math.round(flightBase);
  const stay = Math.round(stayPerNight * days);
  const food = Math.round(foodPerDay * days);
  const activities = Math.round(activitiesPerDay * days);
  const total = flight + stay + food + activities;

  return { flight, stay, food, activities, total };
}
