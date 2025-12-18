import { calculateTransportation, getCountryCode } from './transportationCalculator.js';

async function testTransportationCalculator() {
  console.log('Testing Transportation Calculator...\n');

  // Test 1: Paris - Short distance (should be walking)
  console.log('Test 1: Paris - Short distance (Eiffel Tower -> Trocadero)');
  const test1 = await calculateTransportation(
    { lat: 48.8584, lng: 2.2945, name: 'Eiffel Tower' },
    { lat: 48.8631, lng: 2.2876, name: 'Trocadéro Gardens' },
    'Paris',
    'FR'
  );
  console.log('Result:', test1);
  console.log('Expected: Walking, ~10 min, ~0.6 km, Free\n');

  // Test 2: Paris - Medium distance (should be transit)
  console.log('Test 2: Paris - Medium distance (Eiffel Tower -> Louvre)');
  const test2 = await calculateTransportation(
    { lat: 48.8584, lng: 2.2945, name: 'Eiffel Tower' },
    { lat: 48.8606, lng: 2.3376, name: 'Louvre Museum' },
    'Paris',
    'FR'
  );
  console.log('Result:', test2);
  console.log('Expected: Transit, ~15-20 min, ~2.8 km, €1.90\n');

  // Test 3: Tokyo - Metro city
  console.log('Test 3: Tokyo - Medium distance (Shibuya -> Harajuku)');
  const test3 = await calculateTransportation(
    { lat: 35.6595, lng: 139.7004, name: 'Shibuya Crossing' },
    { lat: 35.6702, lng: 139.7026, name: 'Harajuku Station' },
    'Tokyo',
    'JP'
  );
  console.log('Result:', test3);
  console.log('Expected: Transit, ~10-15 min, ~1.5 km, ¥200-400\n');

  // Test 4: Non-metro city (should use taxi)
  console.log('Test 4: Bali - Medium distance (no metro)');
  const test4 = await calculateTransportation(
    { lat: -8.6500, lng: 115.1333, name: 'Ubud Palace' },
    { lat: -8.5069, lng: 115.2625, name: 'Seminyak Beach' },
    'Bali',
    'default'
  );
  console.log('Result:', test4);
  console.log('Expected: Taxi, ~30-40 min, ~15 km, ~$25-30\n');

  // Test 5: Country code detection
  console.log('Test 5: Country code detection');
  const codes = [
    { city: 'Paris', expected: 'FR' },
    { city: 'Tokyo', expected: 'JP' },
    { city: 'New York', expected: 'US' },
    { city: 'Singapore', expected: 'SG' },
    { city: 'Kuala Lumpur', expected: 'MY' },
    { city: 'Bangkok', expected: 'TH' },
  ];

  codes.forEach(({ city, expected }) => {
    const code = getCountryCode(city);
    const status = code === expected ? 'PASS' : 'FAIL';
    console.log(`${status} ${city}: ${code} (expected: ${expected})`);
  });

  console.log('\nAll tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testTransportationCalculator().catch(console.error);
}

export { testTransportationCalculator };
