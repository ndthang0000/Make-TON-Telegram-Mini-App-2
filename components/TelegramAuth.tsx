'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TelegramAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    authenticateUser()
  }, [])


  const authenticateUser = async () => {
    const WebApp = (await import('@twa-dev/sdk')).default
    WebApp.ready()
    const initData = WebApp.initData
    // const initData = 'user=%7B%22id%22%3A1101957675%2C%22first_name%22%3A%22Nguy%E1%BB%85n%20%C4%90%E1%BB%A9c%22%2C%22last_name%22%3A%22Th%E1%BA%AFng%22%2C%22username%22%3A%22thangkute2608%22%2C%22language_code%22%3A%22vi%22%2C%22allows_write_to_pm%22%3Atrue%7D&chat_instance=4738584620626695432&start_param=08983242814&auth_date=1724738494&hash=febb6588b787b121e04cda8a2d8ccb1408689043e86ed681e328c0e1fb51ed9c'
    if (initData) {
      const endPoint = (process.env.NEXT_PUBLIC_API_ENDPOINT || '') + '/api/auth/check-sum'
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