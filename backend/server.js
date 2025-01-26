const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cron = require("node-cron");
const sendEmail = require("./utils/emailService");
const notificationRoutes = require("./routes/notifications");

const app = express();
app.use(express.json());
app.use("/api", notificationRoutes); // Define o prefixo "/api" para as rotas

    
// Caminho para o arquivo JSON onde os e-mails serão armazenados
const emailsFilePath = path.join(__dirname, "emails.json");

// Função para carregar os e-mails do arquivo
function loadEmails() {
    if (!fs.existsSync(emailsFilePath)) return [];
    const data = fs.readFileSync(emailsFilePath);
    return JSON.parse(data);
}

// Função para salvar os e-mails no arquivo
function saveEmails(emails) {
    fs.writeFileSync(emailsFilePath, JSON.stringify(emails, null, 2));
}

// Rota para cadastrar e-mail
app.post("/subscribe", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "E-mail é obrigatório." });

    const emails = loadEmails();
    if (emails.includes(email)) {
        return res.status(400).json({ message: "E-mail já cadastrado." });
    }

    emails.push(email);
    saveEmails(emails);
    res.status(200).json({ message: "Inscrito com sucesso!" });
});

// Função para buscar cotação do euro
async function fetchEuroRate() {
    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoUltima(moeda=@moeda)?@moeda='EUR'&$top=1&$format=json`;
    const response = await axios.get(url);
    return response.data.value[0].cotacaoCompra;
}

// Cron job para enviar e-mails diariamente
cron.schedule("0 9 * * *", async () => {
    const emails = loadEmails();
    if (emails.length === 0) return;

    const euroRate = await fetchEuroRate();
    emails.forEach((email) => {
        sendEmail(email, "Cotação do Euro", `A cotação de compra do euro hoje é: R$ ${euroRate}`);
    });

    console.log("Notificações enviadas.");
});

// Inicializar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
