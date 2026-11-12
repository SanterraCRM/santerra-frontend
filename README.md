# WebUp! — Frontend

Interface web do Sistema de Gestão Comercial da WebUp!

O frontend é responsável pela visualização e gerenciamento das informações de produtores, revendas, ações comerciais, metas e indicadores do sistema.

## Tecnologias

* Next.js
* React
* TypeScript
* Tailwind CSS
* Recharts

## Funcionalidades

* Autenticação de usuários
* Dashboard com indicadores e gráficos
* Gerenciamento de produtores
* Gerenciamento de revendas
* Gerenciamento de vendedores
* Controle de ações comerciais
* Gerenciamento de metas
* Registro e acompanhamento de visitas
* Visualização de safras
* Filtros e consultas de informações

## Requisitos

* Node.js
* Yarn

## Instalação

Clone o projeto e instale as dependências:

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_REPOSITORIO>
yarn
```

Configure as variáveis de ambiente copiando o `.env.example` para `.env.local` e preenchendo os valores:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<gere com: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))">
NEXT_PUBLIC_API_URL=http://localhost:7777
```

## Executando

Para iniciar o ambiente de desenvolvimento:

```bash
yarn dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

## Versionamento

O projeto utiliza Git para versionamento e segue o padrão Conventional Commits.

Exemplos:

```text
feat: add producer registration
fix: fix dashboard filter
refactor: improve authentication
```

## Status

Em desenvolvimento.

## Projeto

Projeto Integrador — Sistema Web
Engenharia de Software — UNISATC
WebUp! — Criciúma/SC
