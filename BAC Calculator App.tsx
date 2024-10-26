import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BACCalculator = () => {
  const [userInfo, setUserInfo] = useState({
    weight: '',
    height: '',
    gender: '',
    drinks: [],
    units: 'imperial',
    targetBAC: '0.08' // Default to legal limit
  });

  const BACLevels = {
    '0.02': 'Slight mood changes, relaxation',
    '0.05': 'Lowered inhibitions, mild impairment',
    '0.08': 'Legal intoxication limit - unsafe to drive',
    '0.10': 'Significant impairment of coordination',
    '0.15': 'DANGER: High intoxication'
  };

  // Conversion functions
  const convertToMetric = {
    weight: (lbs) => lbs * 0.453592,
    height: (inches) => inches * 2.54
  };

  const convertToImperial = {
    weight: (kg) => kg * 2.20462,
    height: (cm) => cm * 0.393701
  };

  const calculateDrinksForBAC = (targetBAC) => {
    if (!userInfo.weight || !userInfo.height || !userInfo.gender) return null;

    let weightInKg = userInfo.units === 'imperial' 
      ? convertToMetric.weight(parseFloat(userInfo.weight))
      : parseFloat(userInfo.weight);
    
    let heightInCm = userInfo.units === 'imperial'
      ? convertToMetric.height(parseFloat(userInfo.height))
      : parseFloat(userInfo.height);

    const heightInMeters = heightInCm / 100;
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const bmiAdjustment = bmi > 25 ? 0.85 : (bmi < 18.5 ? 1.15 : 1);
    const genderConstant = userInfo.gender === 'male' ? 0.68 : 0.55;

    // Calculate grams of alcohol needed for target BAC
    const weightInGrams = weightInKg * 1000;
    const targetAlcohol = (targetBAC * weightInGrams * genderConstant * bmiAdjustment) / 100;

    // Calculate equivalent drinks (rough estimates)
    return {
      beers: Math.ceil(targetAlcohol / 0.54),   // 12oz of 4.5% beer
      wines: Math.ceil(targetAlcohol / 0.6),    // 5oz of 12% wine
      shots: Math.ceil(targetAlcohol / 0.6)     // 1.5oz of 40% liquor
    };
  };

  const calculateCurrentBAC = () => {
    if (!userInfo.weight || !userInfo.height || !userInfo.gender) return 0;

    let weightInKg = userInfo.units === 'imperial' 
      ? convertToMetric.weight(parseFloat(userInfo.weight))
      : parseFloat(userInfo.weight);
    
    let heightInCm = userInfo.units === 'imperial'
      ? convertToMetric.height(parseFloat(userInfo.height))
      : parseFloat(userInfo.height);

    const heightInMeters = heightInCm / 100;
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const bmiAdjustment = bmi > 25 ? 0.85 : (bmi < 18.5 ? 1.15 : 1);
    const genderConstant = userInfo.gender === 'male' ? 0.68 : 0.55;
    
    let totalAlcohol = userInfo.drinks.reduce((acc, drink) => {
      switch(drink.type) {
        case 'beer': return acc + (0.54 * drink.count);
        case 'wine': return acc + (0.6 * drink.count);
        case 'shot': return acc + (0.6 * drink.count);
        default: return acc;
      }
    }, 0);
    
    const weightInGrams = weightInKg * 1000;
    const calculatedBAC = ((totalAlcohol * 100) / (weightInGrams * genderConstant * bmiAdjustment)) - (0.015 * 1);
    
    return Math.max(0, calculatedBAC);
  };

  const getUnitLabel = (type) => {
    const labels = {
      imperial: { weight: 'lbs', height: 'inches' },
      metric: { weight: 'kg', height: 'cm' }
    };
    return labels[userInfo.units][type];
  };

  const handleUnitChange = (newUnit) => {
    const convertedValues = {
      ...userInfo,
      units: newUnit,
      weight: userInfo.weight ? (
        newUnit === 'metric' 
          ? convertToMetric.weight(userInfo.weight).toFixed(1)
          : convertToImperial.weight(userInfo.weight).toFixed(1)
      ) : '',
      height: userInfo.height ? (
        newUnit === 'metric'
          ? convertToMetric.height(userInfo.height).toFixed(1)
          : convertToImperial.height(userInfo.height).toFixed(1)
      ) : ''
    };
    setUserInfo(convertedValues);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Alert variant="warning" className="mb-6">
        <span className="font-bold">⚠️ Important Safety Information</span>
        <AlertDescription>
          This tool is for educational purposes only. Never drink and drive.
          If you need help, call 800-662-4357 (SAMHSA's National Helpline).
          You must be of legal drinking age to consume alcohol.
        </AlertDescription>
      </Alert>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Responsible Drinking Calculator</h1>
        
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded ${userInfo.units === 'imperial' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => handleUnitChange('imperial')}
            >
              Imperial (US)
            </button>
            <button
              className={`px-4 py-2 rounded ${userInfo.units === 'metric' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => handleUnitChange('metric')}
            >
              Metric
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Weight ({getUnitLabel('weight')})</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={userInfo.weight}
                onChange={(e) => setUserInfo({...userInfo, weight: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-2">Height ({getUnitLabel('height')})</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={userInfo.height}
                onChange={(e) => setUserInfo({...userInfo, height: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Gender</label>
            <select
              className="w-full p-2 border rounded"
              value={userInfo.gender}
              onChange={(e) => setUserInfo({...userInfo, gender: e.target.value})}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Target BAC Level</label>
            <select
              className="w-full p-2 border rounded"
              value={userInfo.targetBAC}
              onChange={(e) => setUserInfo({...userInfo, targetBAC: e.target.value})}
            >
              {Object.entries(BACLevels).map(([level, description]) => (
                <option key={level} value={level}>
                  {level}% - {description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => {
                const newDrinks = [...userInfo.drinks, { type: 'beer', count: 1 }];
                setUserInfo({...userInfo, drinks: newDrinks});
              }}
            >
              🍺 Add Beer
            </button>
            <button
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded"
              onClick={() => {
                const newDrinks = [...userInfo.drinks, { type: 'wine', count: 1 }];
                setUserInfo({...userInfo, drinks: newDrinks});
              }}
            >
              🍷 Add Wine
            </button>
            <button
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => {
                const newDrinks = [...userInfo.drinks, { type: 'shot', count: 1 }];
                setUserInfo({...userInfo, drinks: newDrinks});
              }}
            >
              🥃 Add Shot
            </button>
          </div>

          {userInfo.drinks.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Your Drinks:</h3>
              <div className="space-y-2">
                {userInfo.drinks.map((drink, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="capitalize">{drink.type}</span>
                    <button
                      className="px-2 py-1 bg-red-100 text-red-600 rounded"
                      onClick={() => {
                        const newDrinks = userInfo.drinks.filter((_, i) => i !== index);
                        setUserInfo({...userInfo, drinks: newDrinks});
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userInfo.weight && userInfo.height && userInfo.gender && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">Current BAC: {calculateCurrentBAC().toFixed(3)}%</h3>
                <p className="text-sm text-gray-600">
                  This is an estimate only. Actual BAC can vary based on many factors including
                  metabolism, time since last meal, medications, and overall health.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-bold mb-2">Estimated Drinks to Reach {userInfo.targetBAC}% BAC:</h3>
                {(() => {
                  const estimates = calculateDrinksForBAC(parseFloat(userInfo.targetBAC));
                  return estimates ? (
                    <div className="space-y-2">
                      <p>🍺 Beers (12oz, 4.5%): {estimates.beers} drinks</p>
                      <p>🍷 Wine (5oz, 12%): {estimates.wines} drinks</p>
                      <p>🥃 Shots (1.5oz, 40%): {estimates.shots} drinks</p>
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ Warning: These are estimates for total drinks. Consuming this many drinks quickly is dangerous.
                        Always drink slowly and responsibly.
                      </p>
                    </div>
                  ) : null
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-bold mb-2">Resources for Help:</h3>
        <ul className="list-disc pl-5">
          <li>SAMHSA's National Helpline: 800-662-4357</li>
          <li>Alcoholics Anonymous: aa.org</li>
          <li>National Association for Addiction Professionals: naadac.org</li>
        </ul>
      </div>
    </div>
  );
};

export default BACCalculator;
