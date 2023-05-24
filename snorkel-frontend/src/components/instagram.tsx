import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import instagramLogo from "@/assets/images/instagram-logo.png"
import Image from 'next/image';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedModal } from './animated-modal';
import { Sleeve } from './sleeve';

interface Props {
  socket?: Socket
}

const defaultValues = {
  username: '',
  password: '',
  securityCode: '',
}

export const Instagram: FC<Props> = ({ socket }) => {
  const [isSecurityCodeFound, setIsSecurityCodeFound] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [instagramState, setInstagramState] = useState<string | null>(null);
  const [wrongSecurityCode, setWrongSecurityCode] = useState(false);
  const [formValues, setFormValues] = useState(defaultValues);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  socket?.on('instagram-security-code', () => {
    setIsSecurityCodeFound(true)
  })

  socket?.on('wrong-security-code', () => {
    setWrongSecurityCode(true)
  })

  socket?.on('instagram-state-change', (state) => {
    setInstagramState(state)
    if (state === 'security-code-handled') {
      setLoggingIn(false)
    }
  })

  async function onInstagramLogin(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSecurityCodeFound) {
      submitSecurityCodeHandler()
    } else {
      const { username, password } = formValues
      const data = {
        username,
        password,
      }
      await axios.post('http://localhost:5000/instagram/login', data)
    }
  }

  function submitSecurityCodeHandler() {
    socket?.emit('instagram-security-code-input', formValues.securityCode)
  }

  return (
    <>
      <motion.button onClick={() => setLoggingIn(prev => !prev)} whileHover={{ translateY: '-10px' }} className='flex flex-col justify-center items-center border border-width-1 p-2 rounded-md shadow-lg '>
        <Image src={instagramLogo} alt='Instagram Logo' width={50} height={50} className='object-contain' />
        <span className='text-2xl font-semibold mt-5'>Instagram Account</span>
        <Sleeve state={instagramState} />
      </motion.button>

      <AnimatePresence>
        {loggingIn ? (
          <AnimatedModal
            platform='ig'
            handleInputChange={handleInputChange}
            formValues={formValues}
            wrongSecurityCode={wrongSecurityCode}
            state={instagramState}
            isSecurityCodeFound={isSecurityCodeFound}
            onLogin={onInstagramLogin}
            loggingIn={loggingIn}
            setLoggingIn={setLoggingIn}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}
