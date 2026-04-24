/**
 * 遗忘曲线算法（SM-2 简化版）
 * 复习间隔：1天 → 3天 → 7天 → 14天 → 30天 → 每次 ×2
 */

const REVIEW_INTERVALS = [1, 3, 7, 14, 30] // 天

/**
 * 根据学习次数计算下次复习时间
 */
export function calcNextReviewAt(studyCount: number): Date {
  const now = new Date()
  let days: number

  if (studyCount < REVIEW_INTERVALS.length) {
    days = REVIEW_INTERVALS[studyCount]
  } else {
    // 超过预设间隔后，每次翻倍（最长180天）
    const lastInterval = REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1]
    const extra = studyCount - REVIEW_INTERVALS.length + 1
    days = Math.min(lastInterval * Math.pow(2, extra), 180)
  }

  const next = new Date(now)
  next.setDate(next.getDate() + days)
  return next
}

/**
 * 判断卡片是否需要复习（到达或超过复习时间）
 */
export function needsReview(nextReviewAt: string): boolean {
  return new Date(nextReviewAt) <= new Date()
}

/**
 * 获取距下次复习的描述文字
 */
export function getReviewDescription(nextReviewAt: string): string {
  const now = new Date()
  const review = new Date(nextReviewAt)
  const diffMs = review.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs <= 0) return '需要复习'
  if (diffDays === 1) return '明天复习'
  if (diffDays <= 7) return `${diffDays}天后复习`
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}周后复习`
  return `${Math.ceil(diffDays / 30)}个月后复习`
}
