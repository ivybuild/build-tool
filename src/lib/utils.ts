import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 从文字内容中提取标签（#标签名）
 */
export function extractTags(content: string): string[] {
  const tagRegex = /#([\u4e00-\u9fa5a-zA-Z0-9_-]+)/g
  const matches = content.matchAll(tagRegex)
  const tags = [...matches].map(m => m[1])
  return [...new Set(tags)]
}

/**
 * 格式化时间显示（精确到小时）
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  return `${year}/${month}/${day} ${hour}:00`
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return formatDateTime(dateString)
}
