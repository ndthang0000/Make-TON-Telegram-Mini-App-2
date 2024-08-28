'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TelegramAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    authenticateUser()
  }, [])


  const authenticateUser = async () => {
    const WebApp = (await import('@twa-dev/sdk')).default
    WebApp.ready()
    const initData = WebApp.initData
    if (initData) {
      const endPoint = (process.env.NEXT_PUBLIC_API_ENDPOINT || '') + '/api/auth/check-sum'
      console.log(endPoint)
      try {
        const response = await axios.post(endPoint, {
          initData
        })
        console.log(response)
        if (response.status === 200) {
          console.log(response)
          setIsAuthenticated(true)
          localStorage.setItem('token', response.data.data.tokens.access.token)
        } else {
          console.error('Authentication failed')
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error during authentication:', error)
        setIsAuthenticated(false)
      }
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-8">

    </div>
  )
}