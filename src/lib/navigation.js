'use client'

import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation'

export function useNavigate() {
  const router = useRouter()

  return (to, options = {}) => {
    if (typeof to === 'number') {
      if (to < 0) router.back()
      return
    }

    if (options.replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }
}

export function useParams() {
  return useNextParams()
}

export function useSearchParams() {
  return useNextSearchParams()
}

export { usePathname }
