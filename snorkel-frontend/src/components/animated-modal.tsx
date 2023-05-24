import { useAnimate, usePresence } from 'framer-motion'
import instagramLogo from "@/assets/images/instagram-logo.png"
import facebookLogo from "@/assets/images/facebook-logo.png"
import twitterLogo from "@/assets/images/twitter-logo.png"
import React, { ChangeEvent, FC, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface Props {
  loggingIn: boolean
  setLoggingIn: (arg: any) => any
  onLogin: (e: ChangeEvent<HTMLFormElement>) => Promise<void>
  isSecurityCodeFound?: boolean
  state: string | null
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  formValues: {
    username: string
    password: string
    securityCode?: string
  }
  wrongSecurityCode?: boolean
  platform: 'ig' | 'tw' | 'fb'
}

export const AnimatedModal: FC<Props> = ({ loggingIn, setLoggingIn, onLogin, isSecurityCodeFound, state, handleInputChange, formValues, wrongSecurityCode, platform }) => {
  const [scope, animate] = useAnimate()
  const [isPresent, safeToRemove] = usePresence()

  useEffect(() => {
    if (!isPresent) {
      const exitAnimation = async () => {
        await animate(scope.current, { opacity: 0 })
        safeToRemove()
      }
      exitAnimation()
    }
  }, [isPresent])

  return (
    <motion.section
      ref={scope}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setLoggingIn((prev: boolean) => !prev)}
      className={`backdrop-blur-sm absolute inset-0 bg-black/50 justify-center items-center z-10 ${loggingIn ? 'flex' : 'hidden'}`}
    >
      <div onClick={e => e.stopPropagation()} className='bg-white p-4 min-w-[300px] rounded-md'>
        <form onSubmit={onLogin} className='flex flex-col items-center gap-4 '>
          <Image src={platform === 'ig' ? instagramLogo : platform === 'tw' ? twitterLogo : facebookLogo} alt='Instagram Logo' width={50} height={50} className='object-contain' />
          {isSecurityCodeFound ?
            <>
              <input disabled={state === 'loading'} onChange={handleInputChange} name="securityCode" value={formValues.securityCode} className='px-4 py-3 border border-width-1 rounded-md' placeholder='Security Code' type='password' />
            </> :
            <>
              <input disabled={state === 'loading'} onChange={handleInputChange} name='username' value={formValues.username} className='px-4 py-3 border border-width-1 rounded-md' placeholder='Username' />
              <input disabled={state === 'loading'} onChange={handleInputChange} name='password' value={formValues.password} className='px-4 py-3 border border-width-1 rounded-md' placeholder='Password' type='password' />
            </>
          }
          {wrongSecurityCode ? <small className='text-red-500 font-semibold'>Please check your code!</small> : null}
          <button disabled={state === 'loading'} type='submit' className='disabled:opacity-50 bg-[#1772EB] min-w-[228px] rounded-md pt-1 pb-2 text-white text-xl font-semibold relative'>
            {state === 'loading' ? <svg className='absolute top-1/5 left-12 fill-white animate-spin mt-1' width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
              <path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" />
            </svg> : null}
            Login
          </button>
        </form>
      </div>
    </motion.section>
  )
}
