'use client'

import React, { useState } from 'react'
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Slider } from "./components/ui/slider"
import { Beer, Wine, GlassWater } from 'lucide-react'

interface Drink {
  type: 'beer' | 'wine' | 'shot'
  count: number
}

export default function BACCalculator() {
  const [userInfo, setUserInfo] = useState({
    weight: '',
    height: '',
    gender: '',
    drinks: [] as Drink[],
    units: 'imperial',
    targetBAC: '0.08'
  })

  const BACLevels = {
    '0.02': 'Slight mood changes, relaxation',
    '0.05': 'Lowered inhibitions, mild impairment',
    '0.08': 'Legal intoxication limit - unsafe to drive',
    '0.10': 'Significant impairment of coordination',
    '0.15': 'DANGER: High intoxication'
  }

  const convertToMetric = {
    weight: (lbs: number) => lbs * 0.453592,
    height: (inches: number) => inches * 2.54
  }

  const convertToImperial = {
    weight: (kg: number) => kg * 2.20462,
    height: (cm: number) => cm * 0.393701
  }

  const calculateDrinksForBAC = (targetBAC: number) => {
    if (!userInfo.weight || !userInfo.height || !userInfo.gender) return null

    let weightInKg = userInfo.units === 'imperial' 
      ? convertToMetric.weight(parseFloat(userInfo.weight))
      : parseFloat(userInfo.weight)
    
    let heightInCm = userInfo.units === 'imperial'
      ? convertToMetric.height(parseFloat(userInfo.height))
      : parseFloat(userInfo.height)

    const heightInMeters = heightInCm / 100
    const bmi = weightInKg / (heightInMeters * heightInMeters)
    const bmiAdjustment = bmi > 25 ? 0.85 : (bmi < 18.5 ? 1.15 : 1)
    const genderConstant = userInfo.gender === 'male' ? 0.68 : 0.55

    const weightInGrams = weightInKg * 1000
    const targetAlcohol = (targetBAC * weightInGrams * genderConstant * bmiAdjustment) / 100

    return {
      beers: Math.ceil(targetAlcohol / 0.54),
      wines: Math.ceil(targetAlcohol / 0.6),
      shots: Math.ceil(targetAlcohol / 0.6)
    }
  }

  const calculateCurrentBAC = () => {
    if (!userInfo.weight || !userInfo.height || !userInfo.gender) return 0

    let weightInKg = userInfo.units === 'imperial' 
      ? convertToMetric.weight(parseFloat(userInfo.weight))
      : parseFloat(userInfo.weight)
    
    let heightInCm = userInfo.units === 'imperial'
      ? convertToMetric.height(parseFloat(userInfo.height))
      : parseFloat(userInfo.height)

    const heightInMeters = heightInCm / 100
    const bmi = weightInKg / (heightInMeters * heightInMeters)
    const bmiAdjustment = bmi > 25 ? 0.85 : (bmi < 18.5 ? 1.15 : 1)
    const genderConstant = userInfo.gender === 'male' ? 0.68 : 0.55
    
    let totalAlcohol = userInfo.drinks.reduce((acc, drink) => {
      switch(drink.type) {
        case 'beer': return acc + (0.54 * drink.count)
        case 'wine': return acc + (0.6 * drink.count)
        case 'shot': return acc + (0.6 * drink.count)
        default: return acc
      }
    }, 0)
    
    const weightInGrams = weightInKg * 1000
    const calculatedBAC = ((totalAlcohol * 100) / (weightInGrams * genderConstant * bmiAdjustment)) - (0.015 * 1)
    
    return Math.max(0, calculatedBAC)
  }

  const getUnitLabel = (type: 'weight' | 'height') => {
    const labels = {
      imperial: { weight: 'lbs', height: 'inches' },
      metric: { weight: 'kg', height: 'cm' }
    }
    return labels[userInfo.units as 'imperial' | 'metric'][type]
  }

  const handleUnitChange = (newUnit: 'imperial' | 'metric') => {
    const convertedValues = {
      ...userInfo,
      units: newUnit,
      weight: userInfo.weight ? (
        newUnit === 'metric' 
          ? convertToMetric.weight(parseFloat(userInfo.weight)).toFixed(1)
          : convertToImperial.weight(parseFloat(userInfo.weight)).toFixed(1)
      ) : '',
      height: userInfo.height ? (
        newUnit === 'metric'
          ? convertToMetric.height(parseFloat(userInfo.height)).toFixed(1)
          : convertToImperial.height(parseFloat(userInfo.height)).toFixed(1)
      ) : ''
    }
    setUserInfo(convertedValues)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-purple-700 dark:text-purple-300">Get Drunk With Me</CardTitle>
          <CardDescription>Calculate your BAC and drink responsibly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 mb-4">
            <Button
              variant={userInfo.units === 'imperial' ? 'default' : 'outline'}
              onClick={() => handleUnitChange('imperial')}
              className={userInfo.units === 'imperial' ? 'bg-purple-500 hover:bg-purple-600' : 'text-purple-700 border-purple-300 hover:bg-purple-100'}
            >
              Imperial (US)
            </Button>
            <Button
              variant={userInfo.units === 'metric' ? 'default' : 'outline'}
              onClick={() => handleUnitChange('metric')}
              className={userInfo.units === 'metric' ? 'bg-purple-500 hover:bg-purple-600' : 'text-purple-700 border-purple-300 hover:bg-purple-100'}
            >
              Metric
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Weight ({getUnitLabel('weight')})</label>
              <Input
                type="number"
                value={userInfo.weight}
                onChange={(e) => setUserInfo({...userInfo, weight: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Height ({getUnitLabel('height')})</label>
              <Input
                type="number"
                value={userInfo.height}
                onChange={(e) => setUserInfo({...userInfo, height: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <Select
              value={userInfo.gender}
              onValueChange={(value) => setUserInfo({...userInfo, gender: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Target BAC Level</label>
            <Select
              value={userInfo.targetBAC}
              onValueChange={(value) => setUserInfo({...userInfo, targetBAC: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Target BAC" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BACLevels).map(([level, description]) => (
                  <SelectItem key={level} value={level}>
                    {level}% - {description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                const newDrinks = [...userInfo.drinks, { type: 'beer', count: 1 }]
                setUserInfo({...userInfo, drinks: newDrinks})
              }}
              className="bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
            >
              <Beer className="mr-2 h-4 w-4" /> Add Beer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const newDrinks = [...userInfo.drinks, { type: 'wine', count: 1 }]
                setUserInfo({...userInfo, drinks: newDrinks})
              }}
              className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
            >
              <Wine className="mr-2 h-4 w-4" /> Add Wine
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const newDrinks = [...userInfo.drinks, { type: 'shot', count: 1 }]
                setUserInfo({...userInfo, drinks: newDrinks})
              }}
              className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
            >
              <GlassWater className="mr-2 h-4 w-4" /> Add Shot
            </Button>
          </div>

          {userInfo.drinks.length > 0 && (
            <div className="mt-4 space-y-4">
              <h3 className="font-bold text-lg">Your Drinks:</h3>
              {userInfo.drinks.map((drink, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <span className="capitalize w-20">{drink.type}</span>
                  <Slider
                    value={[drink.count]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => {
                      const newDrinks = [...userInfo.drinks]
                      newDrinks[index].count = value[0]
                      setUserInfo({...userInfo, drinks: newDrinks})
                    }}
                    className="[&>span]:bg-purple-500"
                  />
                  <span className="w-8 text-center">{drink.count}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newDrinks = userInfo.drinks.filter((_, i) => i !== index)
                      setUserInfo({...userInfo, drinks: newDrinks})
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {userInfo.weight && userInfo.height && userInfo.gender && (
            <div className="mt-6 space-y-4">
              <Card className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                <CardHeader>
                  <CardTitle className="text-blue-700 dark:text-blue-300">Current BAC: {calculateCurrentBAC().toFixed(3)}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is an estimate only. Actual BAC can vary based on many factors including
                    metabolism, time since last meal, medications, and overall health.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                <CardHeader>
                  <CardTitle className="text-purple-700 dark:text-purple-300">Estimated Drinks to Reach {userInfo.targetBAC}% BAC:</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const estimates = calculateDrinksForBAC(parseFloat(userInfo.targetBAC))
                    return estimates ? (
                      <div className="space-y-2">
                        <p>🍺 Beers (12oz, 4.5%): {estimates.beers} drinks</p>
                        <p>🍷 Wine (5oz, 12%): {estimates.wines} drinks</p>
                        <p>🥃 Shots (1.5oz, 40%): {estimates.shots} drinks</p>
                        <p className="text-sm text-destructive mt-2">
                          ⚠️ Warning: These are estimates for total drinks. Consuming this many drinks quickly is dangerous.
                          Always drink slowly and responsibly.
                        </p>
                      </div>
                    ) : null
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}