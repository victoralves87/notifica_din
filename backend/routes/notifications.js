const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Caminho para o arquivo JSON que armazena os e-mails
const emailsFilePath = path.join(__dirname, "../emails.json");

// Função para carregar os e-mails do arquivo JSON
const loadEmails = () => {
  if (!fs.existsSync(emailsFilePath)) {
    fs.writeFileSync(emailsFilePath, JSON.stringify([])); // Cria o arquivo se não existir
  }
  return JSON.parse(fs.readFileSync(emailsFilePath, "utf8"));
};

// Função para salvar os e-mails no arquivo JSON
const saveEmails = (emails) => {
  fs.writeFileSync(emailsFilePath, JSON.stringify(emails, null, 2), "utf8");
};

// Rota para cadastrar um novo e-mail
router.post("/subscribe", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório." });
  }

  const emails = loadEmails();

  if (emails.includes(email)) {
    return res.status(409).json({ message: "Email já cadastrado." });
  }

  emails.push(email);
  saveEmails(emails);

  return res.status(201).json({ message: "Email cadastrado com sucesso." });
});

// Rota para listar todos os e-mails cadastrados (opcional para testes)
router.get("/subscribers", (req, res) => {
  const emails = loadEmails();
  res.status(200).json(emails);
});

module.exports = router;
