import Image from 'next/image';
import { ChangeEvent, useEffect, useState } from 'react'
import { io, Socket } from "socket.io-client";
import twitterLogo from "@/assets/images/twitter-logo.png"
import instagramLogo from "@/assets/images/instagram-logo.png"
import facebookLogo from "@/assets/images/facebook-logo.png"
import axios from 'axios';

interface ServerResponse {
  message: string
}

export default function Home() {
  const [isSecurityCodeFound, setIsSecurityCodeFound] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [socket, setSocket] = useState<Socket>();
  const [selectedImage, setSelectedImage] = useState<string | null>();
  const [fileToUpload, setFileToUpload] = useState<File>()
  const [instagramLogin, setInstagramLogin] = useState({
    username: '',
    password: '',
  })

  useEffect(() => {
    async function getInstance() {
      const socketInstance = io('http://localhost:5000')
      setSocket(socketInstance)
    }
    getInstance()
    return () => {
      socket?.off()
    }
  }, [])

  useEffect(() => {
    if (!!socket) {
      // console.log('Socket Connected')
    }
  }, [socket])

  socket?.on('instagram-security-code', () => {
    setIsSecurityCodeFound(true)
  })

  function submitSecurityCodeHandler() {
    socket?.emit('instagram-security-code-input', securityCode)
  }

  async function onInstagramLogin() {
    const { username, password } = instagramLogin
    const data = {
      username,
      password,
    }
    await axios.post('http://localhost:5000/instagram/login', data)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event?.target?.files?.[0];
    setFileToUpload(file)
    if (!!file) {
      const reader = new FileReader();

      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  function upload(file: File | undefined) {
    socket?.emit("instagram-start-upload", file, (status: ServerResponse) => {
      console.log(status);
    });
  }

  return (
    <main>
      <div className="grid grid-cols-3 place-items-center mt-20">
        <section className='flex w-full items-center justify-center my-8'>
          <Image
            src={instagramLogo}
            width={100}
            height={100}
            alt="Logo of Instagram"
          />
          <form className='flex flex-col gap-2 w-36' onSubmit={e => {
            e.preventDefault();
            if (!isSecurityCodeFound) {
              onInstagramLogin()
            } else {
              submitSecurityCodeHandler()
            }
          }}>
            {!isSecurityCodeFound ?
              <>
                <input className='border border-sky-500 p-2 rounded-lg' onChange={e => {
                  const temp = { ...instagramLogin }
                  temp.username = e.target.value
                  setInstagramLogin(temp)
                }} type='text' placeholder='Username' />
                <input className='border border-sky-500 p-2 rounded-lg' onChange={e => {
                  const temp = { ...instagramLogin }
                  temp.password = e.target.value
                  setInstagramLogin(temp)
                }} type='password' placeholder='Password' />
              </>
              : null}
            {isSecurityCodeFound ? <input type='number' className='border border-sky-500 p-2 rounded-lg' onChange={e => setSecurityCode(e.target.value)} placeholder='Security Code' /> : null}
            <button type='submit' className='bg-sky-500 rounded-lg p-2 text-white' >Submit</button>
          </form>
        </section>
        <Image
          src={facebookLogo}
          width={100}
          height={100}
          alt="Logo of Facebook"
        />
        <Image
          src={twitterLogo}
          width={100}
          height={100}
          alt="Logo of Twitter"
        />
      </div>
      <form onSubmit={e => {
        e.preventDefault()
        upload(fileToUpload)
      }} className="flex flex-col items-center justify-center col-span-3 text-center">
        <input type='file' accept="image/*" onChange={handleFileChange} className='bg-sky-500 rounded-lg p-2 text-white mb-5' />
        {selectedImage ? (
          <Image
            src={selectedImage}
            height={200}
            width={200}
            className='object-contain'
            alt='Selected Image'
          />
        ) : null}
        <button disabled={!selectedImage} type='submit' className='disabled:opacity-50 bg-sky-500 p-2 rounded-lg text-white mt-5'>Upload</button>
      </form>
    </main >
  )
}

