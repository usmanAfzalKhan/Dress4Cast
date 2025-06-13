import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// export a function so we can call loadEnv()
export default ({ mode }) => {
  // load all VITE_ vars from .env, .env.development, etc.
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  console.log('🔑 VITE env:', env)

  return defineConfig({
    plugins: [react()],
    // ensure envPrefix includes VITE_ (default, but being explicit helps)
    envPrefix: 'VITE_',
  })
}
