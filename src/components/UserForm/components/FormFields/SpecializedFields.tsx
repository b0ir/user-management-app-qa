import React from 'react';
import { InputField } from './InputField';

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  min?: string | number;
}

export const NumberField: React.FC<Omit<FieldProps, 'type'> & { min?: number }> = (props) => (
  <InputField {...props} type="number" />
);

export const EmailField: React.FC<Omit<FieldProps, 'type'>> = (props) => (
  <InputField {...props} type="email" />
);

export const DateField: React.FC<Omit<FieldProps, 'type'>> = (props) => (
  <InputField {...props} type="date" />
);
