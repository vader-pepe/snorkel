import React, { FC, useState } from 'react'
import instagramLogo from "@/assets/images/instagram-logo.png"
import Image from 'next/image';
import axios from 'axios';
import { Socket } from 'socket.io-client';

interface Props {
  socket?: Socket
}

export const Instagram: FC<Props> = ({ socket }) => {
  const [isSecurityCodeFound, setIsSecurityCodeFound] = useState(false);
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [instagramState, setInstagramState] = useState<string | null>(null);
  const [instagramLogin, setInstagramLogin] = useState({
    username: '',
    password: '',
  })

  socket?.on('instagram-security-code', () => {
    setIsSecurityCodeFound(true)
  })

  socket?.on('instagram-state-change', (state) => {
    console.log(state)
  })

  async function onInstagramLogin() {
    const { username, password } = instagramLogin
    const data = {
      username,
      password,
    }
    await axios.post('http://localhost:5000/instagram/login', data)
  }

  function submitSecurityCodeHandler() {
    socket?.emit('instagram-security-code-input', securityCode)
  }

  return (
    <>
      <Image
        src={instagramLogo}
        width={100}
        height={100}
        alt="Logo of Instagram"
      />
      {!!instagramState ?
        <form className='flex flex-col gap-2 w-36 items-center' onSubmit={e => {
          e.preventDefault();
          if (!isSecurityCodeFound) {
            onInstagramLogin()
          } else {
            submitSecurityCodeHandler()
          }
        }}>
          {!isSecurityCodeFound ?
            <>
              {isServerLoading ? <svg className='animate-spin fill-sky-500' width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" /><path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" /></svg> : <>
                <input className='border border-sky-500 p-2 rounded-lg w-32' onChange={e => {
                  const temp = { ...instagramLogin }
                  temp.username = e.target.value
                  setInstagramLogin(temp)
                }} type='text' placeholder='Username' />
                <input className='border border-sky-500 p-2 rounded-lg w-32' onChange={e => {
                  const temp = { ...instagramLogin }
                  temp.password = e.target.value
                  setInstagramLogin(temp)
                }} type='password' placeholder='Password' />
              </>}
            </>
            : <input type='number' className='border border-sky-500 p-2 rounded-lg' onChange={e => setSecurityCode(e.target.value)} placeholder='Security Code' />}
          {isServerLoading ? null : <button type='submit' className='bg-sky-500 rounded-lg p-2 text-white' >Submit</button>}
        </form>
        : null}
    </>
  )
}
