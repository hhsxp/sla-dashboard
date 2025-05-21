// pages/_app.tsx
import '../styles/globals.css'       // ⬅️ seu Tailwind/CSS global
import type { AppProps } from 'next/app'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
