const axios = require("axios");

const fetchEuroRate = async () => {
    try {
        const now = new Date();
        // Formata a data para MM-DD-YYYY
        const formattedDate = now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).replace(/\//g, '-'); // Substitui "/" por "-"
        
        const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='EUR'&@dataCotacao='${formattedDate}'&$top=100&$format=json&$select=cotacaoCompra,dataHoraCotacao`;

        const response = await axios.get(url);
        const data = response.data.value;

        if (data && data.length > 0) {
            // Retorna a última cotação disponível
            const { cotacaoCompra, dataHoraCotacao } = data[data.length - 1];
            return { cotacao: cotacaoCompra, dataCotacao: dataHoraCotacao };
        } else {
            throw new Error("Dados indisponíveis.");
        }
    } catch (error) {
        console.error("Erro ao buscar cotação do euro:", error.message);
        throw error;
    }
};




module.exports = fetchEuroRate;
