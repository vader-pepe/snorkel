import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`flex flex-col items-center justify-between p-24 ${inter.className} max-h-[350px] min-h-[300px]`}
    >
      <input type='text' placeholder='Username' />
      <input type='password' placeholder='Password' />
      <input type='password' placeholder='Security Code' />
      <button type='submit' >Submit</button>
    </main>
  )
}
