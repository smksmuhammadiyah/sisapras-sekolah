"use client";

import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

export function useFormPersist(key: string, form: UseFormReturn<any>) {
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restore values
        Object.keys(parsed).forEach(k => {
          form.setValue(k, parsed[k], { shouldDirty: true, shouldValidate: true });
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
