"use client";

import { useState } from "react";
import { InputValidator, ValidationResult } from "@/lib/validation";

interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  validationType?: "email" | "password" | "name" | "phone" | "custom";
  validationRules?: any;
  fieldName?: string;
  showErrors?: boolean;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

export function ValidatedInput({
  validationType = "custom",
  validationRules,
  fieldName = "Field",
  showErrors = true,
  onValidationChange,
  onChange,
  onBlur,
  className = "",
  ...props
}: ValidatedInputProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });
  const [touched, setTouched] = useState(false);

  const validateInput = (value: string) => {
    let result: ValidationResult;

    switch (validationType) {
      case "email":
        result = InputValidator.validateEmail(value);
        break;
      case "password":
        result = InputValidator.validatePassword(value);
        break;
      case "name":
        result = InputValidator.validateName(value, fieldName);
        break;
      case "phone":
        result = InputValidator.validatePhone(value);
        break;
      case "custom":
        result = InputValidator.validateGeneric(
          value,
          validationRules || {},
          fieldName
        );
        break;
      default:
        result = { isValid: true, errors: [] };
    }

    setValidationResult(result);
    onValidationChange?.(result.isValid, result.errors);
    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Sanitize input
    const sanitizedValue = InputValidator.sanitizeInput(value);
    if (sanitizedValue !== value) {
      e.target.value = sanitizedValue;
    }

    validateInput(sanitizedValue);
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    validateInput(e.target.value);
    onBlur?.(e);
  };

  const hasErrors = !validationResult.isValid && touched;
  const inputClassName = `
    ${className}
    ${
      hasErrors
        ? "border-red-500 focus:border-red-500"
        : "border-gray-300 focus:border-blue-500"
    }
  `.trim();

  return (
    <div className="space-y-1">
      <input
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClassName}
      />
      {showErrors && hasErrors && (
        <div className="space-y-1">
          {validationResult.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

interface FormValidatorProps {
  children: React.ReactNode;
  onValidationChange?: (isValid: boolean) => void;
}

export function FormValidator({
  children,
  onValidationChange,
}: FormValidatorProps) {
  const [fieldValidations, setFieldValidations] = useState<
    Map<string, boolean>
  >(new Map());

  const handleFieldValidation = (fieldName: string, isValid: boolean) => {
    setFieldValidations((prev) => {
      const newMap = new Map(prev);
      newMap.set(fieldName, isValid);

      const allValid = Array.from(newMap.values()).every((valid) => valid);
      onValidationChange?.(allValid);

      return newMap;
    });
  };

  return <div>{children}</div>;
}
