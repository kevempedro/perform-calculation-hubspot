const hubspot = require('@hubspot/api-client')

function associationItem(event) {
    const hubspotClient = new hubspot.Client({ apiKey: 'API_KEY' });

    const dealId = event;

    hubspotClient.crm.associations.batchApi.read('DEAL', 'LINE_ITEM', { inputs: [{ id: dealId }] })
        .then(results => {
           getItem(results.body.results[0].to)
        }).catch(error => {
            console.error(error)
        })
}

function getItem(lineItemId) {
    const hubspotClient = new hubspot.Client({ apiKey: 'API_KEY' });

    lineItemId.forEach(element => {
        hubspotClient.crm.lineItems.batchApi.read({ inputs: [{ id: element.id }], properties: ['quantity', 'price', 'taxa', 'minimo_de_carregamento'] })
        .then(results => {
            const item = results.body.results[0].properties

            let total = 0

            if (item.price && item.quantity) {
                total = (Number(item.price) * Number(item.quantity))
            }

            let expectedRevenue = 0

            if (item.taxa) {
                expectedRevenue = (total * (Number(item.taxa) / 100))
            }

            let minimumRecipe = 0

            if (item.minimo_de_carregamento && item.taxa) {
                minimumRecipe = (Number(item.minimo_de_carregamento) * (Number(item.taxa) / 100))
            }

            updateItem({ id: element.id, total, expectedRevenue, minimumRecipe })
        }).catch(error => {
            console.error(error)
        })
    });
}

function updateItem(value) {
    const hubspotClient = new hubspot.Client({ apiKey: 'API_KEY' });

    hubspotClient.crm.lineItems.basicApi.update(
        value.id,
        { properties: { previsao_anual__renie_: value.total, receita_prevista: value.expectedRevenue, receita_minima: value.minimumRecipe } }
    )
    .then(() => {
        return 'Atualizado com sucesso!'
    }).catch(error => {
        console.error(error)
    })
}