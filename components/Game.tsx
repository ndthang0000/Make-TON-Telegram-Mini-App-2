
'use client'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { io } from "socket.io-client";


export default function Game() {

  const [userInfo, setUserInfo] = useState<any>(null)
  const [token, setToken] = useState<any>(null)
  const [energy, setEnergy] = useState<any>(null)

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [socket, setSocket] = useState<any>()
  const countClick = useRef(0)

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
    countClick.current += 1
    setToken(token + 1)
  }

  useEffect(() => {
    const id = setInterval(() => {
      console.log('run ko mayf')
      if (socket && countClick.current > 0) {
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
          setEnergy(data.energy)
        })
      }

    }
    return () => {
      if (socket) {
        socket.off('REFRESH_BALANCE')
      }
    }
  }, [isConnected, socket])

  return (

    <div>
      {
        userInfo ?
          <div>
            <p>Name: {userInfo ? userInfo.info.name : ''}</p>
            <p>TelegramId: {userInfo ? userInfo.info.userId : ''}</p>
            <p style={{ color: 'green' }}>Token: {token ? token : ''}</p>
            <p>levelEnergyLimit: {userInfo ? userInfo.info.levelEnergyLimit : ''}</p>
            <p>levelMultiTap: {userInfo ? userInfo.info.levelMultiTap : ''}</p>
            <p>miningProfitPerHours: {userInfo ? userInfo.miningProfitPerHours : ''}</p>
            <p style={{ color: 'blue' }}>energyLimitAmount: {userInfo ? userInfo.energyLimitAmount : ''}</p>
            <p>multiTapAmount: {userInfo ? userInfo.multiTapAmount : ''}</p>
            <p>energy: {energy ? energy : ''}</p>
            <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'red', marginTop: 20 }}
              onClick={handleOnClick}
            >

            </div>
            <p>Socket connection status: {isConnected ? "Connected" : "Disconnected"} {socket.id}</p>
          </div> : <div></div>
      }
    </div>
  )
}
