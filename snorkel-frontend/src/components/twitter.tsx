import Image from 'next/image'
import React, { ChangeEvent, FC, useState } from 'react'
import twitterLogo from "@/assets/images/twitter-logo.png"
import { Socket } from 'socket.io-client'
import { AnimatePresence, motion } from "framer-motion"
import { Sleeve } from './sleeve'
import axios from 'axios'
import { AnimatedModal } from './animated-modal'

interface Props {
  socket?: Socket
}

const defaultValues = {
  username: '',
  password: '',
}

export const Twitter: FC<Props> = ({ socket }) => {
  const [twitterState, setTwitterState] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [formValues, setFormValues] = useState(defaultValues);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  socket?.on('twitter-state-change', (state) => {
    setTwitterState(state)
    console.log(state)
  })

  async function onTwitterLogin(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault()
    const { username, password } = formValues
    const data = {
      username,
      password,
    }
    await axios.post('http://localhost:5000/twitter/login', data)
  }

  return (
    <>
      <motion.button onClick={() => setLoggingIn(prev => !prev)} whileHover={{ translateY: '-10px' }} className='flex flex-col justify-center items-center border border-width-1 p-2 rounded-md shadow-lg '>
        <Image src={twitterLogo} alt='Twitter Logo' width={50} height={50} className='object-contain' />
        <span className='text-2xl font-semibold mt-5'>Twitter Account</span>
        <Sleeve state={twitterState} />
      </motion.button>

      <AnimatePresence>
        {loggingIn ? (
          <AnimatedModal
            platform='tw'
            handleInputChange={handleInputChange}
            formValues={formValues}
            state={twitterState}
            onLogin={onTwitterLogin}
            loggingIn={loggingIn}
            setLoggingIn={setLoggingIn}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}
