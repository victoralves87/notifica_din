# 💶 Sistema de Cotação do Euro 📩

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-green?logo=node.js)](https://nodejs.org/)
[![Made with React](https://img.shields.io/badge/Made%20with-React-blue?logo=react)](https://react.dev/)
[![API Banco Central](https://img.shields.io/badge/API-Banco%20Central-orange)](https://dadosabertos.bcb.gov.br/)

🔹 **Descrição:**  
Este é um sistema simples que consulta a API do **Banco Central** para obter a cotação diária do **Euro** e envia essa cotação para os e-mails cadastrados no sistema.  

🔹 **Armazenamento de dados:**  
Os e-mails cadastrados são salvos em um arquivo **JSON**, sem necessidade de banco de dados.  

---

## 🚀 **Tecnologias Utilizadas**

### 🔧 **Backend**
- **Node.js** 🟢
- **Express** 🚀
- **Axios** 🔄 (para requisições à API do Banco Central)
- **Node-cron** ⏰ (para agendar o envio diário)
- **Nodemailer** 📧 (para envio de e-mails)
- **CORS** 🌍 (para permitir comunicação com o frontend)

### 🎨 **Frontend**
- **React.js** ⚛️ (para interface do usuário)

---

## 📌 **Instalação e Execução**

### 🔹 **1. Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```
```bash
cd backend
npm install
```
```bash
cd frontend
npm install
```
```bash
cd backend
node server.js
```

```bash
cd frontend
npm start
```





