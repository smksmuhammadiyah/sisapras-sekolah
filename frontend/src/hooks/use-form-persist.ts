"use client";

import { useEffect } from 'react';
import { FieldValues, UseFormReturn, Path, PathValue } from 'react-hook-form';

export function useFormPersist<T extends FieldValues>(key: string, form: UseFormReturn<T>) {
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restore values
        Object.keys(parsed).forEach(k => {
          form.setValue(k as Path<T>, parsed[k] as PathValue<T, Path<T>>, {
            shouldDirty: true,
            shouldValidate: true,
          });
        });
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }

    const subscription = form.watch((value) => {
      localStorage.setItem(key, JSON.stringify(value));
    });

    return () => subscription.unsubscribe();
  }, [key, form]);

  const clearStorage = () => localStorage.removeItem(key);

  return { clearStorage };
}
