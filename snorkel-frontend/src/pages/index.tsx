import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { Socket, io } from "socket.io-client";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  useEffect(() => {
    async function getInstance() {
      const ioInstance = io('http://localhost:5000')
      ioInstance.emit("welcome", "hello from FE")
    }
    getInstance()
    return () => {

    }
  }, [])

  return (
    <main
      className={`flex flex-col items-center justify-between p-24 ${inter.className} max-h-[350px] min-h-[300px]`}
    >
      <input type='text' placeholder='Username' />
      <input type='password' placeholder='Password' />
      <input type='password' placeholder='Security Code' />
      <button type='submit' >Submit</button>
    </main>
  )
}
