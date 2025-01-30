const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const app = express();
const cors = require("cors");

// Middleware CORS
app.use(cors());
app.use(express.json());

// Caminho para o arquivo JSON onde os e-mails serão armazenados
const emailsFilePath = path.join(__dirname, "emails.json");

// Configurando o transporte do Nodemailer (usando Gmail como exemplo)
const transporter = nodemailer.createTransport({
    service: "gmail", // ou outro provedor SMTP
    auth: {
        user: "voctorralves@gmail.com", // Substitua pelo seu e-mail
        pass: "osgd mbuj ahsx xsdp", // Substitua pela senha ou App Password
    },
});

// Função para buscar a cotação do euro
const fetchEuroRate = async () => {
    const today = new Date().toISOString().split("T")[0]; // Data no formato YYYY-MM-DD
    const [year, month, day] = today.split("-");
    const formattedDate = `${month}-${day}-${year}`; // Correta conversão para MM-DD-YYYY

    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda=%27EUR%27&@dataCotacao=%27${formattedDate}%27&$top=5&$format=json&$select=cotacaoCompra,dataHoraCotacao`;

    try {
        const response = await axios.get(url);
        const data = response.data.value;

        if (data.length === 0) {
            throw new Error("Cotação indisponível para a data de hoje.");
        }

        const cotacao = data[0].cotacaoCompra;
        const dataCotacao = data[0].dataHoraCotacao;

        return {
            cotacao,
            dataCotacao
        };
    } catch (error) {
        console.error("Erro ao buscar cotação do euro:", error.response ? error.response.data : error.message);
        throw new Error("Erro ao buscar cotação do euro.");
    }
};




// Função para enviar o e-mail com a cotação
const sendCotacao = async (email, cotacao, dataCotacao) => {
    const mailOptions = {
        from: "voctorralves@gmail.com",
        to: email,
        subject: "Cotação do Euro - Atualização Diária",
        text: `Olá, a cotação do euro para hoje (${new Date(dataCotacao).toLocaleDateString()}) é de R$ ${cotacao.toFixed(2)}.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail enviado para: ${email}`);
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error.message);
    }
};

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

// Rota para retornar a cotação do euro
app.get("/taxa-euro", async (req, res) => {
    try {
        const { cotacao, dataCotacao } = await fetchEuroRate();
        res.json({ cotacao, dataCotacao });
    } catch (error) {
        res.status(500).json({ message: "Erro ao obter cotação do euro." });
    }
});

// Cron job para enviar e-mails diariamente com a cotação
cron.schedule("* * * * *", async () => {
    const emails = loadEmails();
    if (emails.length === 0) return;

    try {
        const { cotacao, dataCotacao } = await fetchEuroRate();

        emails.forEach((email) => {
            sendCotacao(email, cotacao, dataCotacao);
        });

        console.log("Notificações enviadas com sucesso.");
    } catch (error) {
        console.error("Erro ao enviar notificações:", error.message);
    }
});

// Inicializar o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
