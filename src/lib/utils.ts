// @ts-nocheck

import { format, differenceInDays, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { th } from 'date-fns/locale'

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: th })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm', { locale: th })
  } catch {
    return dateStr
  }
}

export function formatCurrency(amount) {
  if (amount == null) return '฿0'
  return `฿${Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function getAmountDue(creditAmount, holdPercentage) {
  const pct = Math.max(0, Math.min(100, Number(holdPercentage) || 0))
  return Math.round(Number(creditAmount) * (1 - pct / 100))
}

export function resolveAmountDue(t) {
  if (t.amountDue !== undefined && t.amountDue !== null) return t.amountDue
  return t.creditAmount
}

export function getDebt(transactions, agentId) {
  return transactions
    .filter((t) => t.agentId === agentId)
    .reduce((sum, t) => {
      const due = resolveAmountDue(t)
      if (t.paymentStatus === 'unpaid') return sum + due
      if (t.paymentStatus === 'partial') return sum + (due - (t.paidAmount || 0))
      return sum
    }, 0)
}

export function getTotalCredits(transactions, agentId) {
  return transactions
    .filter((t) => t.agentId === agentId)
    .reduce((sum, t) => sum + t.creditAmount, 0)
}

export function getTotalSales(transactions, agentId) {
  return transactions
    .filter((t) => t.agentId === agentId)
    .reduce((sum, t) => sum + resolveAmountDue(t), 0)
}

export function getOldestUnpaidDate(transactions, agentId) {
  const unpaid = transactions
    .filter((t) => t.agentId === agentId && (t.paymentStatus === 'unpaid' || t.paymentStatus === 'partial'))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  if (unpaid.length === 0) return null
  return unpaid[0].date
}

export function isDebtAlert(transactions, agent) {
  const debt = getDebt(transactions, agent.id)
  const oldestDate = getOldestUnpaidDate(transactions, agent.id)
  const alertDays = agent.debtAlertDays || 7
  const alertAmount = agent.debtAlertAmount || 5000

  if (debt <= 0) return false
  if (debt >= alertAmount) return true
  if (oldestDate && differenceInDays(new Date(), parseISO(oldestDate)) >= alertDays) return true
  return false
}

export function getStatusLabel(status) {
  const map = { active: 'ใช้งานอยู่', idle: 'ว่าง', expired: 'หมดอายุ' }
  return map[status] || status
}

export function getPaymentStatusLabel(status) {
  const map = { paid: 'จ่ายแล้ว', unpaid: 'ยังไม่จ่าย', partial: 'จ่ายบางส่วน' }
  return map[status] || status
}

export function filterTransactionsByDateRange(transactions, startDate, endDate) {
  if (!startDate && !endDate) return transactions
  return transactions.filter((t) => {
    const d = parseISO(t.date)
    if (startDate && endDate) {
      return isWithinInterval(d, { start: new Date(startDate), end: new Date(endDate) })
    }
    if (startDate) return d >= new Date(startDate)
    if (endDate) return d <= new Date(endDate)
    return true
  })
}

export function getMonthlyStats(transactions) {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)
  const monthly = transactions.filter((t) =>
    isWithinInterval(parseISO(t.date), { start, end })
  )
  const totalCredits = monthly.reduce((s, t) => s + t.creditAmount, 0)
  const totalSales = monthly.reduce((s, t) => s + resolveAmountDue(t), 0)
  const totalPaid = monthly.reduce((s, t) => {
    const due = resolveAmountDue(t)
    if (t.paymentStatus === 'paid') return s + due
    if (t.paymentStatus === 'partial') return s + (t.paidAmount || 0)
    return s
  }, 0)
  const totalDebt = monthly.reduce((s, t) => {
    const due = resolveAmountDue(t)
    if (t.paymentStatus === 'unpaid') return s + due
    if (t.paymentStatus === 'partial') return s + (due - (t.paidAmount || 0))
    return s
  }, 0)
  return { totalCredits, totalSales, totalPaid, totalDebt, count: monthly.length }
}

export function getWeeklyStats(transactions) {
  const now = new Date()
  const start = startOfWeek(now, { weekStartsOn: 1 })
  const end = endOfWeek(now, { weekStartsOn: 1 })
  const weekly = transactions.filter((t) =>
    isWithinInterval(parseISO(t.date), { start, end })
  )
  const totalSales = weekly.reduce((s, t) => s + resolveAmountDue(t), 0)
  const totalPaid = weekly.reduce((s, t) => {
    const due = resolveAmountDue(t)
    if (t.paymentStatus === 'paid') return s + due
    if (t.paymentStatus === 'partial') return s + (t.paidAmount || 0)
    return s
  }, 0)
  return { totalSales, totalPaid, count: weekly.length }
}

export function getTopAgents(transactions, agents, limit = 5) {
  const salesByAgent = agents.map((a) => ({
    ...a,
    totalSales: getTotalSales(transactions, a.id),
    debt: getDebt(transactions, a.id),
  }))
  return salesByAgent.sort((a, b) => b.totalSales - a.totalSales).slice(0, limit)
}

export function getMonthlyChartData(transactions) {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = startOfMonth(d)
    const end = endOfMonth(d)
    const label = format(d, 'MMM yy', { locale: th })
    const filtered = transactions.filter((t) => {
      try { return isWithinInterval(parseISO(t.date), { start, end }) } catch { return false }
    })
    months.push({
      month: label,
      sales: filtered.reduce((s, t) => s + resolveAmountDue(t), 0),
      paid: filtered.reduce((s, t) => {
        const due = resolveAmountDue(t)
        if (t.paymentStatus === 'paid') return s + due
        if (t.paymentStatus === 'partial') return s + (t.paidAmount || 0)
        return s
      }, 0),
    })
  }
  return months
}
