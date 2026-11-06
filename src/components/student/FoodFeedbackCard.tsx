import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Utensils,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  AlertCircle
} from 'lucide-react'
import { submitFoodFeedback, getFoodFeedbacks, FoodFeedback } from '../../api/feedback'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Button } from '../ui/Button'
import { formatDate } from '../../lib/dates'

interface FoodFeedbackCardProps {
  studentId: string
  studentName?: string
}

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  1: { text: 'Needs Improvement', color: 'text-rose-600', desc: 'Too cold, salty, or lacking flavor' },
  2: { text: 'Below Average', color: 'text-amber-600', desc: 'Not up to standard' },
  3: { text: 'Good / Decent', color: 'text-amber-500', desc: 'Satisfying homestyle meal' },
  4: { text: 'Very Tasty!', color: 'text-emerald-600', desc: 'Delicious and fresh' },
  5: { text: 'Super Delicious & Authentic! 🌟', color: 'text-emerald-700', desc: 'Authentic Davanagere taste' },
}

const QUICK_TAGS = [
  'Soft & Fresh Chapatis 🫓',
  'Tasty Saaru / Sambar 🍲',
  'Authentic Ennegayi / Palya 🥘',
  'Hot & Fresh ♨️',
  'Perfect Spice Level 🌶️',
  'Good Rice Quality 🍚',
  'Need More Sambar 🥣',
  'Less Spicy Please 🍃',
]

function getCurrentMealType(): 'BREAKFAST' | 'LUNCH' | 'DINNER' {
  const currentHour = new Date().getHours()
  if (currentHour < 11) return 'BREAKFAST'
  if (currentHour < 16) return 'LUNCH'
  return 'DINNER'
}

export const FoodFeedbackCard: React.FC<FoodFeedbackCardProps> = ({ studentId, studentName }) => {
  const queryClient = useQueryClient()
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER'>(getCurrentMealType())
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comments, setComments] = useState('')
  const [submittedSuccess, setSubmittedSuccess] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Fetch student's recent feedbacks
  const { data: myFeedbacks = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['foodFeedbacks', studentId],
    queryFn: () => getFoodFeedbacks(studentId),
  })

  // Submit feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: submitFoodFeedback,
    onSuccess: () => {
      setSubmittedSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['foodFeedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['foodFeedbacks', studentId] })
      setSelectedTags([])
      setComments('')
      setTimeout(() => {
        setSubmittedSuccess(false)
      }, 4000)
    },
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    feedbackMutation.mutate({
      studentId,
      mealType,
      rating,
      tags: selectedTags.join(', '),
      comments: comments.trim(),
    })
  }

  const activeRating = hoverRating || rating

  return (
    <Card className="border-emerald-200/90 shadow-md bg-white overflow-hidden">
      {/* Decorative top accent */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-green-600 to-amber-500" />

      <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-sm shadow-emerald-900/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                Food Feedback & Ratings
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  ಊಟದ ರೇಟಿಂಗ್
                </span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Rate today's food to help the kitchen maintain top taste & quality
              </CardDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <span>History ({myFeedbacks.length})</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 sm:px-6 pb-5">
        {/* Success Alert Banner */}
        {submittedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-emerald-950">
                ಧನ್ಯವಾದಗಳು! Thank you for your feedback!
              </p>
              <p className="text-emerald-700">
                Your rating for today's {mealType.toLowerCase()} has been shared with the kitchen team.
              </p>
            </div>
          </div>
        )}

        {/* Meal Selection Tabs */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
            Select Meal (ಯಾವ ಊಟ?)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { type: 'BREAKFAST', label: 'Breakfast', kannada: 'ಉಪಾಹಾರ', icon: '☀️' },
                { type: 'LUNCH', label: 'Lunch', kannada: 'ಮಧ್ಯಾಹ್ನ', icon: '🍛' },
                { type: 'DINNER', label: 'Dinner', kannada: 'ರಾತ್ರಿ', icon: '🌙' },
              ] as const
            ).map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => setMealType(item.type)}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  mealType === item.type
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold scale-[1.02]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="text-base mb-0.5">{item.icon}</span>
                <span className="text-xs font-semibold">{item.label}</span>
                <span
                  className={`text-[10px] ${
                    mealType === item.type ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {item.kannada}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Star Rating */}
        <div className="rounded-2xl bg-gradient-to-b from-amber-50/60 to-orange-50/30 border border-amber-200/70 p-4 text-center">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            How was the taste and quality?
          </label>

          <div className="flex items-center justify-center gap-2 sm:gap-3 my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-1 sm:p-1.5 transition-transform hover:scale-125 focus:outline-none"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                    star <= activeRating
                      ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mt-2">
            <span className={`text-sm font-bold ${RATING_LABELS[activeRating].color}`}>
              {RATING_LABELS[activeRating].text}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {RATING_LABELS[activeRating].desc}
            </p>
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Quick Feedback Tags (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && <span className="mr-1 text-emerald-600">✓</span>}
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Comments Input */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Comments or Special Request (ಐಚ್ಛಿಕ ಸಲಹೆ)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={2}
            placeholder="e.g., Sambar was super tasty today! Soft rotis were great."
            className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={feedbackMutation.isPending}
          className="w-full bg-[#15803d] hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {feedbackMutation.isPending ? (
            <span>Submitting Feedback...</span>
          ) : (
            <>
              <ThumbsUp className="w-4 h-4" />
              <span>Submit Meal Rating (ರೇಟಿಂಗ್ ಕಳುಹಿಸಿ)</span>
            </>
          )}
        </Button>

        {/* Student Feedback History Accordion */}
        {showHistory && (
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Your Past Ratings</span>
              <span className="text-slate-400 text-[11px] font-normal">Last 10 entries</span>
            </div>

            {isLoadingHistory ? (
              <p className="text-xs text-slate-400 text-center py-2">Loading feedback history...</p>
            ) : myFeedbacks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3 bg-slate-50 rounded-xl">
                No past feedback submitted yet. Rate today's meal above!
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {myFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 uppercase text-[11px]">
                          {fb.mealType}
                        </span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= fb.rating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {fb.createdAt ? formatDate(fb.createdAt, 'dd MMM yyyy') : 'Recently'}
                      </span>
                    </div>

                    {fb.tags && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {fb.tags.split(',').map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-medium"
                          >
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {fb.comments && (
                      <p className="text-[11px] text-slate-600 italic pt-0.5">
                        "{fb.comments}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
