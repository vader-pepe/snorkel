import Image from 'next/image'
import React, { ChangeEvent, FC, useState } from 'react'
import facebookLogo from "@/assets/images/facebook-logo.png"
import { Socket } from 'socket.io-client'
import { AnimatePresence, motion } from "framer-motion"
import { Sleeve } from './sleeve'
import { AnimatedModal } from './animated-modal'
import axios from 'axios'

interface Props {
  socket?: Socket
}

const defaultValues = {
  username: '',
  password: '',
}

export const Facebook: FC<Props> = ({ socket }) => {
  const [facebookState, setFacebookState] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [formValues, setFormValues] = useState(defaultValues);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  async function onFacebookLogin(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault()
    const { username, password } = formValues
    const data = {
      username,
      password,
    }
    await axios.post('http://localhost:5000/facebook/login', data)
  }

  socket?.on('facebook-state-change', (state) => {
    setFacebookState(state)
  })

  return (
    <>
      <motion.button onClick={() => setLoggingIn(prev => !prev)} whileHover={{ translateY: '-10px' }} className='flex flex-col justify-center items-center border border-width-1 p-2 rounded-md shadow-lg '>
        <Image src={facebookLogo} alt='Facebook Logo' width={50} height={50} className='object-contain' />
        <span className='text-2xl font-semibold mt-5'>Facebook Account</span>
        <Sleeve state={facebookState} />
      </motion.button>

      <AnimatePresence>
        {loggingIn ? (
          <AnimatedModal
            platform='fb'
            handleInputChange={handleInputChange}
            formValues={formValues}
            state={facebookState}
            onLogin={onFacebookLogin}
            loggingIn={loggingIn}
            setLoggingIn={setLoggingIn}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}
