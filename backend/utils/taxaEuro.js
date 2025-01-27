const axios = require("axios");

const fetchEuroRate = async () => {
    // Pega a data de hoje no formato YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0]; 

    // Converte para o formato MM-DD-YYYY
    const formattedDate = today.split("-").slice(1).concat(today.split("-")[0]).join("-");

    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda=%27EUR%27&@dataCotacao=%27${formattedDate}%27&$top=5&$format=json&$select=cotacaoCompra,dataHoraCotacao`;

    console.log("Data formatada para a URL:", formattedDate)

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
