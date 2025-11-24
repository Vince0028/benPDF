import React from 'react';
export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  category: 'files' | 'math' | 'utilities';
}
export interface BaseConversionResponse {
  input?: string;
  result?: string;
  results?: string[];
  solution?: string;
  solutions?: string[];
  error?: string;
}
export interface CalculusResponse {
  result: string;
  result_latex: string;
  steps: string[];
  steps_latex: string[];
  error?: string;
}
export interface UnitConversionResponse {
  result: number;
  error?: string;
}