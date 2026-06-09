import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

/**
 * Hook fetch câu hỏi từ Supabase
 * @param {string|null} curriculum
 * @param {string|null} unit
 */
export function useQuestions(curriculum = null, unit = null) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('id')

      if (curriculum) query = query.eq('curriculum', curriculum)
      if (unit)       query = query.eq('unit', unit)

      const { data, error: err } = await query

      if (cancelled) return
      if (err) { setError(err.message); setLoading(false); return }
      setQuestions(data || [])
      setLoading(false)
    }

    fetch()
    return () => { cancelled = true }
  }, [curriculum, unit])

  return { questions, loading, error }
}

/**
 * Fetch tất cả curriculum có trong DB
 */
export async function fetchCurriculums() {
  const { data, error } = await supabase
    .from('questions')
    .select('curriculum')
    .eq('is_active', true)
  if (error) throw error
  return [...new Set(data.map(r => r.curriculum))].sort()
}

/**
 * Fetch tất cả unit của 1 curriculum
 */
export async function fetchUnits(curriculum) {
  const { data, error } = await supabase
    .from('questions')
    .select('unit')
    .eq('is_active', true)
    .eq('curriculum', curriculum)
  if (error) throw error
  return [...new Set(data.map(r => r.unit))].sort()
}

/**
 * Fetch câu hỏi ngẫu nhiên (dùng cho quiz)
 */
export async function fetchRandomQuestions({ curriculum, unit, count = 10 }) {
  let query = supabase
    .from('questions')
    .select('*')
    .eq('is_active', true)

  if (curriculum) query = query.eq('curriculum', curriculum)
  if (unit)       query = query.eq('unit', unit)

  const { data, error } = await query
  if (error) throw error

  // Shuffle và lấy N câu
  const shuffled = [...data].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
