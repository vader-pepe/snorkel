import Image from 'next/image'
import React, { FC } from 'react'
import twitterLogo from "@/assets/images/twitter-logo.png"
import { Socket } from 'socket.io-client'

interface Props {
  socket?: Socket
}

export const Twitter: FC<Props> = ({ socket }) => {
  return (
    <>
      <Image
        src={twitterLogo}
        width={100}
        height={100}
        alt="Logo of Twitter"
      />
    </>
  )
}
