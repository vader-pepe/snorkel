import Image from 'next/image';
import { ChangeEvent, useEffect, useState } from 'react'
import { io, Socket } from "socket.io-client";
import { Instagram } from '@/components/instagram';
import { Facebook } from '@/components/facebook';
import { Twitter } from '@/components/twitter';

interface ServerResponse {
  message: string
}

export default function Home() {
  const [socket, setSocket] = useState<Socket>();
  const [selectedImage, setSelectedImage] = useState<string | null>();
  const [fileToUpload, setFileToUpload] = useState<File>()

  useEffect(() => {
    async function getInstance() {
      const socketInstance = io('http://localhost:5000')
      setSocket(socketInstance)
    }
    getInstance()
    return () => {
      socket?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!!socket) {
      // console.log('Socket Connected')
    }
  }, [socket])

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
          <Instagram socket={socket} />
        </section>
        <section className='flex w-full items-center justify-center my-8'>
          <Facebook socket={socket} />
        </section>
        <section className='flex w-full items-center justify-center my-8'>
          <Twitter socket={socket} />
        </section>
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

