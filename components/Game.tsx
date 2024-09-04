
'use client'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { io } from "socket.io-client";


export default function Game() {

  const [userInfo, setUserInfo] = useState<any>(null)
  const [token, setToken] = useState<any>(null)
  const [energy, setEnergy] = useState<any>(null)
  const [multiTapAmount, setMultiTapAmount] = useState<number>(1)

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [socket, setSocket] = useState<any>()
  const countClick = useRef(0)

  const [levelMultiTap, setLevelMultiTap] = useState<number>(0)
  const [levelEnergyLimit, setLevelEnergyLimit] = useState<number>(0)
  const [amountNextLevelMultiTap, setAmountNextLevelMultiTap] = useState<number>(0)
  const [amountNextLevelEnergyLimit, setAmountNextLevelEnergyLimit] = useState<number>(0)
  const [energyLimitAmount, setEnergyLimitAmount] = useState<number>(3000)
  const [userLevel, setUserLevel] = useState<number>(0)

  useEffect(() => {
    const fetchMyInfo = async () => {
      const promise = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/users/my-profile`,
        {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        }
      )
      setUserInfo(promise.data.data)
      setToken(promise.data.data.info.token)
      setMultiTapAmount(promise.data.data.multiTapAmount)
      setLevelEnergyLimit(promise.data.data.info.levelEnergyLimit)
      setLevelMultiTap(promise.data.data.info.levelMultiTap)
      setEnergyLimitAmount(promise.data.data.energyLimitAmount)
      setEnergy(promise.data.data.energy)
      setUserLevel(promise.data.data.info.level)
    }
    fetchMyInfo()

  }, [])


  useEffect(() => {
    let socketInstance = io(`${process.env.NEXT_PUBLIC_SOCKET}`, {
      extraHeaders: {
        authorization: `bearer ${localStorage.getItem('token')}`
      }
    });
    setSocket(socketInstance)
    setIsConnected(true);
    if (socket && socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport: any) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    if (socket) {
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
    }


    return () => {
      if (socket) {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      }
    };
  }, []);

  const handleOnClick = () => {
    if (energy < multiTapAmount) {
      return
    }
    countClick.current += 1
    setToken(token + multiTapAmount)
    if (energy > multiTapAmount) {
      setEnergy(energy - multiTapAmount)

    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      if (socket && countClick.current > 0) {
        console.log("EMIT TAP", { tap: countClick.current })
        socket.emit('TAP', { tap: countClick.current })
        countClick.current = 0
      }
    }, 3000)
    return () => {
      clearInterval(id);
    };
  }, [socket])

  useEffect(() => {
    if (isConnected) {
      if (socket) {
        socket.on('REFRESH_BALANCE', (data: any) => {
          console.log('REFRESH_BALANCE', data)
          if (data.token > token) {
            setToken(data.token)
          }
          if (data.energy > energy) {
            setEnergy(data.energy)
          }
          else {
            if (countClick.current < 0) {
              setEnergy(data.energy)
            }
          }
        })

        socket.on('UPDATE_MULTI_TAP_UPGRADE', (data: any) => {
          console.log('UPDATE_MULTI_TAP: ', data)
          setMultiTapAmount(data.multiTapAmount)
          setLevelMultiTap(data.nextLevelMultiTap)
        })

        socket.on('UPDATE_ENERGY_LIMIT_UPGRADE', (data: any) => {
          console.log('UPDATE_ENERGY_LIMIT: ', data)
          setEnergyLimitAmount(data.energyLimitAmount)
          setLevelEnergyLimit(data.nextLevelEnergyLimit)
        })

        socket.on('MINING_PROFIT_OFF', (data: any) => {
          console.log('MINING_PROFIT_OFF: ', data)
        })

        socket.on('UPGRADE_LEVEL', (data: any) => {
          console.log('UPGRADE_LEVEL: ', data)
          setUserLevel(data.level)
        })
      }

    }
    return () => {
      if (socket) {
        socket.off('REFRESH_BALANCE')
      }
    }
  }, [isConnected, socket])

  useEffect(() => {
    const fetchAmountNextLevel = async () => {
      const promise = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/booster/price`,
        {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        })
      setAmountNextLevelEnergyLimit(promise.data.data.nextEnergyLimitPrice)
      setAmountNextLevelMultiTap(promise.data.data.nextMultiTapPrice)
    }
    fetchAmountNextLevel()
  }, [levelEnergyLimit, levelMultiTap])

  const handleUpgradeMultiTap = async () => {
    const promise = await axios.post(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/booster/multi-tap/upgrade`,
      {},
      {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      })
    // setLevelMultiTap(levelMultiTap + 1)

  }

  const handleUpgradeEnergyLimit = async () => {
    const promise = await axios.post(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/booster/energy-limit/upgrade`, {},
      {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      })
    // setLevelMultiTap(levelEnergyLimit + 1)

  }

  return (

    <div>
      {
        userInfo ?
          <div>
            <p>Name: {userInfo ? userInfo.info.name : ''}</p>
            <p>TelegramId: {userInfo ? userInfo.info.userId : ''}</p>
            <p style={{ color: 'green' }}>Token: {token ? token : ''}</p>
            <p>miningProfitPerHours: {userInfo ? userInfo.miningProfitPerHours : ''}</p>
            <p>multiTapAmount: {multiTapAmount}</p>
            <p>User Level: {userLevel}</p>
            <p style={{ color: 'blue' }}>energy: {energy ? energy : ''} / {energyLimitAmount}</p>
            <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'red', marginTop: 20 }}
              onClick={handleOnClick}
            >

            </div>
            <p>Socket connection status: {isConnected ? "Connected" : "Disconnected"} {socket.id}</p>
            <div style={{ marginTop: 20 }}>
              <button
                onClick={handleUpgradeMultiTap}
                style={{ backgroundColor: '#f7e85c', padding: 5, borderRadius: 3, marginInline: 15, marginBottom: 20 }}>
                Upgrade Multitap (Level: {levelMultiTap})
                <p>{amountNextLevelMultiTap}$</p>
              </button>
              <button
                onClick={handleUpgradeEnergyLimit}
                style={{ backgroundColor: '#f7e85d', padding: 5, borderRadius: 3, }}>
                Upgrade Energy Limit (Level: {levelEnergyLimit})
                <p>{amountNextLevelEnergyLimit}$</p>
              </button>

            </div>
          </div> : <div></div>
      }
    </div>
  )
}
