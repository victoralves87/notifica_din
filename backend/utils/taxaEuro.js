const axios = require("axios");

const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
const [year, month, day] = today.split("-"); // Divide em partes
const formattedDate = `${month}-${day}-${year}`; // Junta no formato correto

const fetchEuroRate = async () => {
    // Pega a data de hoje no formato YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0]; 
    const [year, month, day] = today.split("-");
    const formattedDate = `${month}-${day}-${year}`; // Formato MM-DD-YYYY

    console.log("Data formatada para a URL:", formattedDate);

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


