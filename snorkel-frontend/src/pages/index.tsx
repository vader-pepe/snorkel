import { ChangeEvent, useEffect, useState } from 'react'
import { io, Socket } from "socket.io-client";
import { Instagram } from '@/components/instagram';
import { Facebook } from '@/components/facebook';
import { Twitter } from '@/components/twitter';

export default function Home() {
  const [socket, setSocket] = useState<Socket>();
  const [selectedImage, setSelectedImage] = useState<string | null>();
  const [fileToUpload, setFileToUpload] = useState<File>()

  useEffect(() => {
    async function getInstance() {
      const socketInstance = io('http://localhost:5000')
      console.log('masok pake eko')
      setSocket(socketInstance)
    }
    getInstance()
    return () => {
      socket?.disconnect()
    }
  }, [])

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

  return (
    <main>
      <header className='px-4 py-3 bg-[#15274A]'>
        <span className='text-2xl text-white font-semibold'>Account Connected</span>
      </header>
      <span className='font-semibold text-5xl block text-center mt-20 underline underline-offset-2'>Snorkel</span>
      <section className='grid grid-cols-3 gap-5 mx-8 mt-4'>
        <Instagram socket={socket} />
        <Facebook socket={socket} />
        <Twitter socket={socket} />
      </section>
    </main >
  )
}

