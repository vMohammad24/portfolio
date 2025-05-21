const themeColors = {
    base: '#1e1e2e',
    mantle: '#181825',
    crust: '#11111b',
    surface0: '#313244', // Adding explicit surface0 color
    surface1: '#45475a',
    text: '#cdd6f4',
    subtext0: '#a6adc8',
    subtext1: '#bac2de',
    lavender: '#b4befe',
    blue: '#89b4fa',
    sapphire: '#74c7ec',
    green: '#a6e3a1',
    red: '#f38ba8',
    mauve: '#cba6f7',
    pink: '#f5c2e7',
    peach: '#fab387',
    yellow: '#f9e2af',
    teal: '#94e2d5',
    maroon: '#eba0ac',
};


const languages = [
    {
        name: 'TypeScript',
        proficiency: 100,
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/typescript/typescript-original.svg',
        link: 'https://www.typescriptlang.org/',
        color: '#3178C6'
    },
    {
        name: 'Java',
        proficiency: 90,
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/java/java-original.svg',
        link: 'https://www.java.com/',
        color: '#ED8B00'
    },
    {
        name: 'JavaScript',
        proficiency: 85,
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/javascript/javascript-original.svg',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        color: '#F7DF1E'
    },
    {
        name: 'Python',
        proficiency: 80,
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/python/python-original.svg',
        link: 'https://www.python.org/',
        color: '#3776AB'
    },
    {
        name: 'Golang',
        proficiency: 75,
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/go/go-original.svg',
        link: 'https://golang.org/',
        color: '#00ADD8'
    }
];

const skills = [
    {
        name: 'Svelte',
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/svelte/svelte-original.svg',
        link: 'https://svelte.dev/',
    },
    {
        name: 'Next.js',
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/nextjs/nextjs-original.svg',
        link: 'https://nextjs.org/',
    },
    {
        name: 'React.js',
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/react/react-original.svg',
        link: 'https://react.dev/',
    },
    {
        name: 'Elysia.js',
        icon: 'https://elysiajs.com/assets/elysia.svg',
        link: 'https://elysiajs.com/',
    },
    {
        name: 'TailwindCSS',
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/tailwindcss/tailwindcss-original.svg',
        link: 'https://tailwindcss.com/',
        color: '#38B2AC'
    },
    {
        name: 'Discord.js',
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/discordjs/discordjs-original.svg',
        link: 'https://discord.js.org/',
    },
    {
        name: 'PostgreSQL',
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/postgresql/postgresql-original.svg',
        link: 'https://www.postgresql.org/',
    },
    {
        name: 'Redis',
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/redis/redis-original.svg',
        link: 'https://redis.io/',
    }
];

const socials = [
    {
        name: 'Discord',
        link: 'https://discord.com/users/840854894881538079',
        icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/discord.svg',
        gradientFrom: '#5865F2',
        gradientTo: '#4752C4',
        iconColor: '#FFFFFF'
    },
    {
        name: 'GitHub',
        link: 'https://github.com/vMohammad24',
        icon: 'https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/github/github-original.svg',
        gradientFrom: '#333',
        gradientTo: '#24292e',
        iconColor: '#FFFFFF'
    },
    {
        name: 'Twitter',
        link: 'https://x.com/vMohammad_',
        icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/x.svg',
        gradientFrom: 'black',
        gradientFromOpacity: '80',
        gradientTo: 'black',
        shadowColor: 'white',
        shadowOpacity: '10',
        iconColor: '#FFFFFF',
        invert: true
    },
    {
        name: 'Instagram',
        link: 'https://instagram.com/vmohammad42',
        icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/instagram.svg',
        gradientFrom: '#833AB4',
        gradientTo: '#FCAF45'
    },
    {
        name: 'Telegram',
        link: 'https://t.me/vMohammad42',
        icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/telegram.svg',
        gradientFrom: '#0088cc',
        gradientTo: '#0088cc'
    }
];
const birthday = new Date("2009-08-06");
const discordId = '840854894881538079';
const lanyardDomain = 'lanyard.vmohammad.dev'
export { birthday, discordId, languages, lanyardDomain, skills, socials, themeColors };

