import { useTelegram } from './hooks/useTelegram';
import { LinkCard } from './components/LinkCard';
import { SuggestionsSection } from './components/SuggestionsSection';
import { useState } from 'react';

interface LinkItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
  colorClass: string;
  category: string;
}

const LINKS: LinkItem[] = [
  {
    id: 'tg',
    title: 'Telegram Канал',
    subtitle: 'Новости и анонсы',
    url: 'https://t.me/akimaryyy',
    icon: 'fa-brands fa-telegram',
    colorClass: 'bg-[#0088cc]',
    category: 'main'
  },
  {
    id: 'dc',
    title: 'Discord',
    subtitle: 'Наше сообщество',
    url: 'https://discord.gg/sBQH3968d',
    icon: 'fa-brands fa-discord',
    colorClass: 'bg-[#5865F2]',
    category: 'main'
  },
  {
    id: 'twitch',
    title: 'Twitch',
    subtitle: 'Прямые трансляции',
    url: 'https://www.twitch.tv/akimaryy',
    icon: 'fa-brands fa-twitch',
    colorClass: 'bg-[#9146ff]',
    category: 'media'
  },
  {
    id: 'kick',
    title: 'Kick',
    subtitle: 'Альтернативные стримы',
    url: 'https://kick.com/akimaryy',
    icon: 'fa-solid fa-k',
    colorClass: 'bg-[#53fc18] !text-black',
    category: 'media'
  },
  {
    id: 'trovo',
    title: 'Trovo',
    subtitle: 'Стримы тут тоже бывают',
    url: 'https://trovo.live/s/akimary/226809408',
    icon: 'fa-solid fa-play',
    colorClass: 'bg-[#19d66b]',
    category: 'media'
  },
  {
    id: 'yt',
    title: 'YouTube',
    subtitle: 'Видео и архивы',
    url: 'https://www.youtube.com/@akimary',
    icon: 'fa-brands fa-youtube',
    colorClass: 'bg-[#ff0000]',
    category: 'media'
  },
  {
    id: 'steam',
    title: 'Steam',
    subtitle: 'Мой игровой профиль',
    url: 'https://steamcommunity.com/id/kawaineemozetbittolkotvojamama/',
    icon: 'fa-brands fa-steam',
    colorClass: 'bg-[#171a21]',
    category: 'other'
  }
];

function App() {
  const { user } = useTelegram();
  const [activeTab, setActiveTab] = useState<'links' | 'suggestions'>('links');

  return (
    <div className="min-h-screen w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center">
      {/* Header */}
      <div className="flex flex-col items-center mb-10 text-center animate-float">
        <div className="w-24 h-24 rounded-full border-4 border-tg-button/30 p-1 mb-4">
          <img
            src="https://t.me/i/userpic/320/akimaryyy.jpg"
            alt="Akimary"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          {user ? `Akimary × ${user.first_name}` : 'Akimary Hub'}
        </h1>
        <p className="text-white/40 mt-2 font-medium">Стример, контентмейкер и твоя любимая мамуля</p>
      </div>

      {/* Navigation - Only show if user is present (Telegram) */}
      {user && (
        <div className="w-full flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'links' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
              }`}
          >
            <i className="fa-solid fa-link mr-2"></i>
            Ссылки
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'suggestions' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
              }`}
          >
            <i className="fa-solid fa-lightbulb mr-2"></i>
            Предложения
          </button>
        </div>
      )}

      {/* Content */}
      {activeTab === 'links' ? (
        <div className="w-full space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-2">Главное</p>
          {LINKS.filter(l => l.category === 'main').map(link => (
            <LinkCard key={link.id} link={link} />
          ))}

          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-2 mt-6">Стримы и видео</p>
          {LINKS.filter(l => l.category === 'media').map(link => (
            <LinkCard key={link.id} link={link} />
          ))}

          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-2 mt-6">Прочее</p>
          {LINKS.filter(l => l.category === 'other').map(link => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      ) : (
        <SuggestionsSection />
      )}



      {/* Footer */}
      <footer className="mt-12 mb-8 text-center text-white/20 text-xs font-medium">
        Powered by Akimary & Telegram SDK
      </footer>
    </div>
  );
}

export default App;
