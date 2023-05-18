import Image from 'next/image'
import React, { FC } from 'react'
import facebookLogo from "@/assets/images/facebook-logo.png"
import { Socket } from 'socket.io-client'

interface Props {
  socket?: Socket
}

export const Facebook: FC<Props> = ({ socket }) => {
  return (
    <div>
      <Image
        src={facebookLogo}
        width={100}
        height={100}
        alt="Logo of Facebook"
      />
    </div>
  )
}
