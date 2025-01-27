const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cron = require("node-cron");
const sendEmail = require("./utils/emailService");
const notificationRoutes = require("./routes/notifications");
const fetchEuroRate = require("./utils/taxaEuro"); // Importando a função de 'utils/euroRate'
const nodemailer = require("nodemailer");
const app = express();
app.use(express.json());
app.use("/api", notificationRoutes); // Define o prefixo "/api" para as rotas
    
// Caminho para o arquivo JSON onde os e-mails serão armazenados
const emailsFilePath = path.join(__dirname, "emails.json");



// Configurando o transporte do Nodemailer (usando Gmail como exemplo)
const transporter = nodemailer.createTransport({
    service: "gmail", // ou outro provedor SMTP
    auth: {
        user: "voctorralves@gmail.com", // Substitua pelo seu e-mail
        pass: "sua senha de app", // Substitua pela senha ou App Password
    },
});

// Rota para testar o envio de e-mails
// Função para buscar a cotação do euro
const fetchEuroRate2 = async () => {
    const today = new Date().toISOString().split("T")[0]; // Data no formato YYYY-MM-DD
    const formattedDate = today.split("-").reverse().join("-"); // Formato MM-DD-YYYY
    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='EUR'&@dataCotacao='${formattedDate}'&$top=1&$format=json&$select=cotacaoCompra,dataHoraCotacao`;

    try {
        const response = await axios.get(url);
        const data = response.data.value;

        if (data.length === 0) {
            throw new Error("Cotação indisponível para a data de hoje.");
        }

        return {
            cotacao: data[0].cotacaoCompra,
            dataCotacao: data[0].dataHoraCotacao,
        };
    } catch (error) {
        throw new Error("Erro ao buscar cotação do euro.");
    }
};

// Rota para enviar e-mail com a cotação
app.post("/send-email", async (req, res) => {
    const { email } = req.body; // Recebe o e-mail do body da requisição

    try {
        const { cotacao, dataCotacao } = await fetchEuroRate();

        // Configuração do e-mail
        const mailOptions = {
            from: "voctorralves@gmail.com",
            to: email,
            subject: "Cotação do Euro - Atualização Diária",
            text: `Olá, a cotação do euro para hoje (${new Date(dataCotacao).toLocaleDateString()}) é de R$ ${cotacao.toFixed(2)}.`,
        };

        // Envia o e-mail
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "E-mail enviado com sucesso!" });
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error.message);
        res.status(500).json({ message: "Erro ao enviar e-mail." });
    }
});

// Rota para retornar a cotação do euro
app.get("/taxa-euro", async (req, res) => {
    try {
        const { cotacao, dataCotacao } = await fetchEuroRate();
        res.json({ cotacao, dataCotacao });
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
