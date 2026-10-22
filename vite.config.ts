//import react from '@vitejs/plugin-react'
//import { defineConfig } from 'vite'

//// https://vite.dev/config/
//export default defineConfig({
//  plugins: [react()],
//})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/sagi-app/', // Si la ruta en el servidor es /sagi-app/, o usa './' para rutas relativas
    plugins: [react()],
    server: {
        watch: {
            ignored: ['**/.vs/**']
        }
    }
})