const axios = require("axios");

// Função para buscar cotação do euro
async function fetchEuroRate() {
    try {
        const url = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda=%27EUR%27&@dataCotacao=%2701-25-2025%27&$format=json";
        const response = await axios.get(url);
        
        // Pega o primeiro valor da resposta, que será a cotação do dia
        const cotacao = response.data.value[0].cotacaoCompra;
        const dataCotacao = response.data.value[0].dataHoraCotacao;
        
        return { cotacao, dataCotacao }; // Retorna o valor da cotação e a data/hora
    } catch (error) {
        console.error("Erro ao buscar cotação do euro:", error);
        throw error; // Em caso de erro, lançamos a exceção para tratar no frontend
    }
}


module.exports = fetchEuroRate;
