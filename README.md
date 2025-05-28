<h1 align="center">
  <img src="src/assets/logonb.png" width="100" alt="SteamVault Logo"/><br/>
  SteamVault - Your Personal Steam Library Companion 🎮
</h1>


## 🛠 Technologies Used:

<table>
  <tr>
    <td valign="middle"><img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" width="24"/></td>
    <td><strong>Node.js</strong> – Backend runtime environment</td>
  </tr>
  <tr>
    <td valign="middle"><img src="src/assets/prisma.png" width="24"/></td>
    <td><strong>SQLite + Prisma</strong> – Local database with ORM</td>
  </tr>
  <tr>
    <td valign="middle"><img src="https://vitejs.dev/logo.svg" width="24"/></td>
    <td><strong>Vite</strong> – Frontend build tool</td>
  </tr>
  <tr>
    <td valign="middle"><img src="src/assets/tauri.png" width="24"/></td>
    <td><strong>Tauri</strong> – Cross-platform desktop app framework (Rust + JS)</td>
  </tr>
  <tr>
    <td valign="middle"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" width="24"/></td>
    <td><strong>JavaScript</strong> – Core programming language</td>
  </tr>
  <tr>
    <td valign="middle">📦</td>
    <td><strong>Tauri Bundle</strong> – Application packaging and distribution</td>
  </tr>
</table>

## 👥 Developer:

* **Tiago Portilho**

## 🎯 Project Objective:

**SteamVault** is a desktop app designed to help you manage and visualize your Steam game library locally. It reads your installed games, playtime, and achievements, and allows you to see your statistics — everything stored locally.

> ⚠️ **Note:** This is a privacy-focused tool. No data leaves your machine.

## 🔧 Key Features:

* ✅ **Steam Game Detection** (via API)
* ✅ **Game List with Playtime & Achievements**
* ✅ **Add Personal Guides and Notes**
* ✅ **Offline Steam Library Tracker**
* ✅ **Local Database (SQLite + Prisma)**
* ✅ **Fast & Lightweight (Tauri + Vite)**

## 🚀 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/TiagoPortilho/SteamVault.git

# Navigate to the project folder
cd SteamVault

# Install dependencies
npm install

# Push the database schema
npx prisma db push

# Build frontend
npm run build

# Run the app in development mode
npm run tauri dev
```

> ✅ **Tip:** You can use the Python script `run.py` to automate these steps.

## 🔥 Planned Features / Roadmap

* ⚙️ **Steam Idle Mode** – Simulate the game running to farm Steam trading cards
* 🔍 **Full Local Auto-Scan** – Automatically fetch all Steam games without user input (file parsing instead of API)
* 🧠 **Framework Base** – Transform SteamVault into a base template for other apps with similar architecture (Tauri + Vite + Prisma)
* 📦 **Game Save Backup Manager** – Backup and restore game save files easily

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

> © 2025 Tiago Portilho – Free for personal and educational use.


# SteamVault **- Seu Gerenciador de Biblioteca Steam 🎮**

## 🛠 Tecnologias Utilizadas:

<table>
  <tr>
    <td valign="middle"><img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" width="24"/></td>
    <td><strong>Node.js</strong> – Ambiente backend para execução da aplicação</td>
  </tr>
  <tr>
    <td valign="middle"><img src="src/assets/prisma.png" width="24"/></td>
    <td><strong>SQLite + Prisma</strong> – Banco de dados local com ORM</td>
  </tr>
  <tr>
    <td valign="middle"><img src="https://vitejs.dev/logo.svg" width="24"/></td>
    <td><strong>Vite</strong> – Ferramenta de build para frontend</td>
  </tr>
  <tr>
    <td valign="middle"><img src="src/assets/tauri.png" width="24"/></td>
    <td><strong>Tauri</strong> – Framework desktop multiplataforma (Rust + JS)</td>
  </tr>
  <tr>
    <td valign="middle"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" width="24"/></td>
    <td><strong>JavaScript</strong> – Linguagem principal de programação</td>
  </tr>
  <tr>
    <td valign="middle">📦</td>
    <td><strong>Tauri Bundle</strong> – Empacotamento e distribuição da aplicação</td>
  </tr>
</table>

## 👥 Desenvolvedor:

* **Tiago Portilho**

## 🌟 Objetivo do Projeto:

O **SteamVault** é um aplicativo desktop que ajuda você a gerenciar e visualizar sua biblioteca de jogos da Steam localmente. Ele lê seus jogos instalados, tempo de jogo, conquistas e permite você ver suar estátisticas — tudo armazenado localmente, com foco total na sua privacidade.

> ⚠️ **Observação:** Nenhum dado é enviado para a nuvem. Tudo fica 100% no seu computador.

## 🔧 Funcionalidades:

* ✅ **Deteção de Jogos da Steam** (via API ou arquivos locais)
* ✅ **Lista de Jogos com Tempo de Jogo e Conquistas**
* ✅ **Adição de Guias e Anotações Pessoais**
* ✅ **Gerenciamento Offline da Biblioteca Steam**
* ✅ **Banco de Dados Local (SQLite + Prisma)**
* ✅ **Leve e Rápido (Tauri + Vite)**

## 🚀 Instalação & Configuração

```bash
# Clone o repositório
git clone https://github.com/TiagoPortilho/SteamVault.git

# Acesse a pasta do projeto
cd SteamVault

# Instale as dependências
npm install

# Crie o banco de dados local
npx prisma db push

# Compile o frontend
npm run build

# Execute a aplicação em modo desenvolvimento
npm run tauri dev
```

> ✅ **Dica:** Você pode usar o script Python `run.py` para automatizar esses passos.

## 🔥 Funcionalidades Futuras

* ⚙️ **Modo Idle na Steam** – Simular o jogo rodando para farmar cartas de forma leve
* 🔍 **Scanner Local Automático** – Detectar automaticamente todos os jogos da Steam sem intervenção manual (parsing de arquivos locais)
* 🧠 **Template Base** – Transformar o SteamVault em um framework base para outros softwares usando essa mesma arquitetura (Tauri + Vite + Prisma)
* 📦 **Gerenciador de Backups de Saves** – Backup e restauração de arquivos de save de jogos

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](https://opensource.org/licenses/MIT).

> © 2025 Tiago Portilho – Livre para uso pessoal e educacional.

## 🖼️ Screenshots / Capturas de Tela

🖥️ SteamVault preview

![unknown_2025 05 27-16 10](https://github.com/user-attachments/assets/b5062ca5-3812-4f7b-90c9-d4d740b32bff)





