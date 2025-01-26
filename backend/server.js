const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cron = require("node-cron");
const sendEmail = require("./utils/emailService");
const notificationRoutes = require("./routes/notifications");
const fetchEuroRate = require("./utils/taxaEuro"); // Importando a função de 'utils/euroRate'

const app = express();
app.use(express.json());
app.use("/api", notificationRoutes); // Define o prefixo "/api" para as rotas
    
// Caminho para o arquivo JSON onde os e-mails serão armazenados
const emailsFilePath = path.join(__dirname, "emails.json");

// Rota para retornar a cotação do euro
app.get("/taxa-euro/:date", async (req, res) => {
    try {
        const { date } = req.params;  // Captura a data do parâmetro na URL
        const { cotacao, dataCotacao } = await fetchEuroRate(date); // Chama a função passando a data
        res.json({ cotacao, dataCotacao }); // Retorna a cotação e a data/hora como resposta
    } catch (error) {
        res.status(500).json({ message: "Erro ao obter cotação do euro." });
    }
});


// Configuração do cron job para enviar notificações diárias
cron.schedule("0 9 * * *", async () => {
    const taxaEuro = await fetchEuroRate(); // Pegando a cotação do euro
    // Enviar notificações por email ou qualquer outra lógica
    console.log("Cotação do euro:", taxaEuro);
});

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
