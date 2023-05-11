import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { io, Socket } from "socket.io-client";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [isSecurityCodeFound, setIsSecurityCodeFound] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    async function getInstance() {
      const x = io('http://localhost:5000')
      setSocket(x)
    }
    getInstance()
    return () => {
    }
  }, [])

  useEffect(() => {
    if (!!socket) {
      console.log('Socket Connected')
    }
  }, [socket])

  socket?.on('instagram-security-code', () => {
    setIsSecurityCodeFound(true)
  })

  function submitHandler() {
    socket?.emit('instagram-security-code-input', securityCode)
  }

  return (
    <main
      className={`flex flex-col items-center justify-between p-24 ${inter.className} max-h-[350px] min-h-[300px]`}
    >
      <form className='flex flex-col gap-2' onSubmit={e => {
        e.preventDefault();
        submitHandler()
      }}>
        <input type='text' placeholder='Username' />
        <input type='password' placeholder='Password' />
        {isSecurityCodeFound ? <input type='password' onChange={e => setSecurityCode(e.target.value)} placeholder='Security Code' /> : null}
        <button type='submit' >Submit</button>
      </form>
    </main>
  )
}
