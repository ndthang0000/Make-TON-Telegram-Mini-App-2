
import TelegramAuth from '@/components/TelegramAuth';
import Game from '@/components/Game';


export default async function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Game />
      <TelegramAuth />
    </main>
  )
}