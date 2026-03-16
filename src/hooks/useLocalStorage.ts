import { useState, useEffect } from 'react'

function isEmptyObject(v: unknown): boolean {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).length === 0
}

export function useLocalStorage<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return initial
      const parsed = JSON.parse(stored) as T
      // If stored is an empty object but we have a non-empty default, prefer the default
      if (isEmptyObject(parsed) && !isEmptyObject(initial)) return initial
      return parsed
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
