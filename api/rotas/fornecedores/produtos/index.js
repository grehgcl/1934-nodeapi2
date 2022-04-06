const roteador = require('express').Router({ mergeParams: true});
const Tabela = require('./TabelaProduto')
const Produto = require ('./Produto')
const Serializador = require('../../../Serializador').SerializadorProduto //pode haver erro...aqui


roteador.options('/', (requisicao, resposta) => {
    resposta.set ('Acess-Control-Allow-Origin', 'GET, POST')
    resposta.set ('Acess-Control-Allow-Headers', 'Content-Type')
    resposta.status(204)
    resposta.end()  
})

roteador.get('/', async (requisicao, resposta) => {
    const produtos =  await Tabela.listar(requisicao.fornecedor.id)
    const Serializador = new Serializador(
        resposta.getHeader('Content-Type')
    )
    resposta.send(
        serializador.serializar(produtos)
        )
    })

roteador.post('/', async (requisicao, resposta, proximo) =>{
   try{
        const idFornecedor = requisicao.fornecedor.id
        const corpo = requisicao.body
        const dados = Object.assign({}, corpo, { fornecedor: idFornecedor})
        const produto = new Produto(dados)
        await produto.criar()
        const Serializador = new Serializador(
            resposta.getHeader('Content-Type')
        )
        resposta.set('Etag', produto.versao)
        const timestamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timestamp)
        resposta.set('Location', `/api/fornecedores/${produto.fornecedor}/produtos/${produto.id}`)
        resposta.status(201)
        resposta.send(
            serializador.serializar(produto)
        )
     } catch (erro){
        proximo(erro)
        }
    })


    roteador.options('/:id', (requisicao, resposta) => {
        resposta.set ('Acess-Control-Allow-Origin', 'GET, DELETE, PUT,HEAD')
        resposta.set ('Acess-Control-Allow-Headers', 'Content-Type')
        resposta.status(204)
        resposta.end()  
    })
roteador.delete('/:id',  async (requisicao, resposta) =>{
    const dados = {
        id: requisicao.params.id,
        fornecedor: requisicao.fornecedor.id
    }

    const produto = new produto(dados)
    await produto.apagar()
    resposta.status(204)
    resposta.end()
})

roteador.get('/:id', async (requisicao, resposta, proximo) =>{
    try {
        const dados = {
            id: requisicao.params.id,
            fornecedor: requisicao.fornecedor.id
        }
        const produto = new Produto(dados)
        await produto.carregar()
        const Serializador = new Serializador(
            resposta.getHeader('Content-Type'),
            [
                'preco', 'estoque', 'fornecedor', 'dataCriacao', 'dataAtualizacao', 'versao'
            ]
        )
        resposta.set('Etag', produto.versao)
        const timestamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timestamp)

        resposta.send(produto)
            serealizador.serializar(produto)
        } catch (erro){
            proximo(erro)
        }
    })

roteador.head('/:id', async (requisicao, resposta, proximo) =>{
    try {
        const dados = {
            id: requisicao.params.id,
            fornecedor: requisicao.fornecedor.id
        }
        const produto = new Produto(dados)
        await produto.carregar()
        resposta.set('Etag', produto.versao)
        const timestamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timestamp)
        resposta.status(200)
        resposta.end()
        } catch (erro){
            proximo(erro)
        }
})

roteador.put('/:id', async (requisicao, resposta, proximo) =>{
    try {
        const dados = Object.assign(
            {},
            requisicao.body,
            {
            id: requisicao.params.id,
            fornecedor: requisicao.fornecedor.id
            
            }
        )
        const produto = new Produto(dados)
        await produto.atualizar()
        await produto.carregar()
        resposta.set('Etag', produto.versao)
        const timestamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timestamp)
       
        repose.status(204)
        resposta.end()
        } catch (erro){
            proximo(erro)
        }
    })

    roteador.options('/:id/diminuir-estoque', (requisicao, resposta) => {
        resposta.set ('Acess-Control-Allow-Origin', 'POST')
        resposta.set ('Acess-Control-Allow-Headers', 'Content-Type')
        resposta.status(204)
        resposta.end()  
    })


roteador.post('/:id/diminuir-estoque', async (requisicao, resposta, proximo) =>{
    try{ 
          const produto = new Produto({
            id: requisicao.params.id,
            fornecedor: requisicao.fornecedor.id
        })
        await produto.carregar()
        produto.estoque -= requisicao.body.quantidade
        await produto.diminuirEstoque()
        await produto.carregar()
        resposta.set('Etag', produto.versao)
        const timestamp = (new Date(produto.dataAtualizacao)).getTime()
        resposta.set('Last-Modified', timestamp)
      
        resposta.status(204)
        resposta.end()

    } catch (erro){
        proximo(erro)
    }
  
})
    

module.exports = roteador;