export function getProsCons(destination: any) {
  const name = (destination?.name || '').toLowerCase();
  const country = (destination?.country || '').toLowerCase();
  const highlights = (destination?.highlights || []).join(' ').toLowerCase();
  const description = (destination?.description || '').toLowerCase();
  const combined = `${name} ${country} ${highlights} ${description}`;

  let pros = [];
  let cons = [];

  // Specific destination patterns
  if (name.includes('zermatt') || combined.includes('matterhorn')) {
    pros = ['Iconic Matterhorn views', 'World-class skiing and snowboarding', 'Charming alpine village atmosphere'];
    cons = ['Very expensive accommodation', 'Weather-dependent activities', 'Limited nightlife options'];
  }
  else if (name.includes('lapland') || combined.includes('northern lights')) {
    pros = ['Magical Northern Lights experience', 'Unique winter activities (husky sledding)', 'Authentic Sami culture'];
    cons = ['Extremely cold temperatures', 'Limited daylight in winter', 'Remote location, expensive to reach'];
  }
  else if (combined.includes('thailand') || combined.includes('bangkok')) {
    pros = ['Affordable luxury accommodations', 'Amazing street food and cuisine', 'Rich temples and culture'];
    cons = ['Hot and humid climate', 'Language barriers in rural areas', 'Tourist scams in popular areas'];
  }
  else if (combined.includes('japan') || combined.includes('tokyo')) {
    pros = ['Efficient transportation system', 'Unique blend of tradition and modernity', 'Exceptional food quality'];
    cons = ['Language barriers for non-Japanese speakers', 'High cost of living', 'Crowded public spaces'];
  }
  else if (combined.includes('maldives') || combined.includes('seychelles')) {
    pros = ['Crystal clear waters and pristine beaches', 'Luxury overwater accommodations', 'Perfect for romantic getaways'];
    cons = ['Very expensive destination', 'Limited cultural experiences', 'Vulnerable to weather changes'];
  }
  else {
    // Generate pros based on destination characteristics
    if (combined.includes('beach') || combined.includes('coast') || combined.includes('island')) {
      pros.push('Beautiful beaches and coastal views');
      cons.push('Can be crowded during peak season');
    }
    
    if (combined.includes('mountain') || combined.includes('hill') || combined.includes('trek')) {
      pros.push('Great for adventure and trekking');
      cons.push('May require physical fitness');
    }
    
    if (combined.includes('culture') || combined.includes('heritage') || combined.includes('temple') || combined.includes('historic')) {
      pros.push('Rich cultural and historical sites');
      cons.push('Limited modern entertainment options');
    }
    
    if (combined.includes('city') || combined.includes('urban') || combined.includes('metropolitan')) {
      pros.push('Excellent shopping and dining options');
      cons.push('Higher costs and urban pollution');
    }
    
    if (combined.includes('nature') || combined.includes('wildlife') || combined.includes('forest')) {
      pros.push('Amazing wildlife and natural beauty');
      cons.push('Limited luxury accommodations');
    }
    
    if (combined.includes('romantic') || combined.includes('honeymoon') || combined.includes('couple')) {
      pros.push('Perfect for romantic getaways');
      cons.push('May be expensive for couples');
    }

    // Add some general pros/cons if none matched
    if (pros.length === 0) {
      pros.push('Good weather during visit season', 'Plenty of sightseeing options', 'Great local cuisine');
    }
    
    if (cons.length === 0) {
      cons.push('Can get crowded during holidays', 'Language barriers possible', 'Limited budget options');
    }
  }

  // Ensure we have at least 2-3 items each
  const allPros = [
    ...pros,
    'Friendly local people',
    'Good transportation connectivity',
    'Safe for tourists',
    'Great photo opportunities',
    'Unique local experiences'
  ];
  
  const allCons = [
    ...cons,
    'Weather can be unpredictable',
    'Tourist traps in popular areas',
    'Seasonal price variations',
    'Limited English signage',
    'Booking required in advance'
  ];

  return {
    pros: allPros.slice(0, 3),
    cons: allCons.slice(0, 3)
  };
}
