// components/Header.tsx

import { ThemeToggle } from "./thme-toggle";



export default function Header() {
  return (
    <header className="border-b dark:border-gray-800 p-4 flex items-center justify-between bg-white  dark:bg-black  px-8">
      <div className="text-blue-400 dark:text-white  font-bold text-2xl ">remover</div>
      <nav className="flex gap-4 text-sm text-muted-foreground transition-colors duration-300 ease-in-out text-gray-400">
        
        <ThemeToggle/>
      </nav>
    </header>
  );
}
