# Configuração do Frontend para Vercel

## 📁 Estrutura de Arquivos

Crie os seguintes arquivos no seu projeto frontend:

### `.env` (desenvolvimento local)
```env
VITE_API_URL=http://localhost:8000
```

### `.env.production` (produção - será usado no Vercel)
```env
VITE_API_URL=https://wenner-api-master.onrender.com
```

### `.env.local` (opcional - para testes locais com produção)
```env
VITE_API_URL=https://wenner-api-master.onrender.com
```

## 🔧 Código do Axios (Opção 3)

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios, { AxiosInstance } from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Configuração de URLs por ambiente
const getBaseURL = (): string => {
  // Prioridade 1: Variável de ambiente (Vercel ou .env)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Prioridade 2: Modo de desenvolvimento
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }
  
  // Prioridade 3: Produção (fallback)
  return "https://wenner-api-master.onrender.com";
};

const baseURL = getBaseURL();

// Do not set a global Content-Type header here. Some requests (file uploads using
// FormData) must let the browser set the Content-Type with the proper boundary.
export const customFetch: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Importante para cookies/JWT
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para adicionar token se necessário
customFetch.interceptors.request.use(
  (config) => {
    // Adicionar token se existir no localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
customFetch.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      // Redirecionar para login se necessário
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 🚀 Configuração no Vercel

### Passo 1: Fazer o Deploy Inicial

1. Conecte seu repositório GitHub ao Vercel
2. Configure o projeto:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Faça o deploy inicial
4. Anote a URL do seu projeto (ex: `https://seu-projeto.vercel.app`)

### Passo 2: Adicionar Variáveis de Ambiente no Vercel

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione a variável:

```
Name: VITE_API_URL
Value: https://wenner-api-master.onrender.com
Environment: Production, Preview, Development (marque todos)
```

### Passo 3: Adicionar URL do Frontend no Backend (Render)

1. Acesse o [Render Dashboard](https://dashboard.render.com)
2. Selecione seu serviço `wenner-api-master`
3. Vá em **Environment**
4. Adicione ou atualize a variável:

```
Name: FRONTEND_URL
Value: https://seu-projeto.vercel.app
```

**OU** se você tiver um domínio customizado:

```
Name: FRONTEND_URL
Value: https://seudominio.com
```

5. Faça um novo deploy no Render para aplicar as mudanças

### Passo 4: Verificar Build Settings

O Vercel geralmente detecta automaticamente o Vite, mas verifique:

- **Framework Preset**: Vite
- **Build Command**: `npm run build` (ou `yarn build`)
- **Output Directory**: `dist` (padrão do Vite)
- **Install Command**: `npm install` (ou `yarn install`)

### Passo 5: Redeploy

Após adicionar as variáveis de ambiente:
1. Vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**
4. Isso aplicará as novas variáveis de ambiente

## 🔍 Verificação

Após o deploy, verifique:

1. **Console do navegador**: Verifique se não há erros de CORS
2. **Network tab**: Confirme que as requisições estão indo para a URL correta
3. **Teste uma requisição**: 
   ```typescript
   customFetch.get('/api/v1/products')
     .then(res => console.log(res.data))
     .catch(err => console.error(err));
   ```

## 📝 Notas Importantes

1. **CORS**: Certifique-se de que o backend (Render) tem o frontend (Vercel) na lista de origens permitidas
2. **Cookies**: `withCredentials: true` é necessário para cookies funcionarem cross-origin
3. **HTTPS**: Em produção, ambas as URLs devem usar HTTPS
4. **Variáveis de Ambiente**: No Vercel, variáveis começando com `VITE_` são expostas ao frontend

## 🔒 Segurança

- **NUNCA** commite arquivos `.env` com secrets
- Use variáveis de ambiente do Vercel para produção
- O arquivo `.env.production` pode ser commitado (não contém secrets)

## 🐛 Troubleshooting

### Erro de CORS

**Erro comum:**
```
Access-Control-Allow-Origin header must not be the wildcard '*' 
when the request's credentials mode is 'include'
```

**Causa:**
- O frontend usa `withCredentials: true` para enviar cookies/JWT
- O backend está retornando `Access-Control-Allow-Origin: *`
- Navegadores não permitem wildcard `*` quando `credentials: include`

**Solução no Backend (Render):**
1. Configure o CORS para aceitar o domínio específico do frontend:
   ```javascript
   // Exemplo com Express/CORS
   app.use(cors({
     origin: 'https://wenner-master.vercel.app', // Domínio específico
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

2. **NÃO use** `origin: '*'` quando `credentials: true`

3. Para múltiplos domínios, use uma função:
   ```javascript
   app.use(cors({
     origin: (origin, callback) => {
       const allowedOrigins = [
         'https://wenner-master.vercel.app',
         'http://localhost:8080' // desenvolvimento
       ];
       if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true
   }));
   ```

4. Após configurar, faça um novo deploy no Render

### Variável de ambiente não funciona
- Certifique-se de que a variável começa com `VITE_`
- Faça um novo deploy após adicionar variáveis
- Verifique se a variável está marcada para o ambiente correto

### Timeout
- Aumente o `timeout` no axios se necessário
- Verifique se o servidor Render está respondendo

