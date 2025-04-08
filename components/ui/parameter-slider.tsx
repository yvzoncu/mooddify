'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ParameterSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function ParameterSlider({
  label,
  value,
  onChange,
}: ParameterSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <Label>{label}</Label>
        <span>{value.toFixed(1)}</span>
      </div>
      <Slider
        value={[value]}
        max={1}
        step={0.1}
        className="w-full"
        onValueChange={(val) => onChange(val[0])}
      />
    </div>
  );
}
