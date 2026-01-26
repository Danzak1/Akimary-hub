import React from 'react';

interface LinkItem {
    id: string;
    title: string;
    subtitle: string;
    url: string;
    icon: string;
    colorClass: string;
    category: string;
}

interface LinkCardProps {
    link: LinkItem;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
    return (
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center p-4 mb-3 rounded-2xl glass transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10 group link-card-gradient`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mr-4 shadow-lg ${link.colorClass}`}>
                <i className={link.icon}></i>
            </div>
            <div className="flex-grow">
                <h3 className="text-white font-bold text-base leading-tight">{link.title}</h3>
                <p className="text-white/60 text-xs mt-1">{link.subtitle}</p>
            </div>
            <div className="text-white/20 group-hover:text-white/50 transition-colors">
                <i className="fa-solid fa-chevron-right text-sm"></i>
            </div>
        </a>
    );
};
