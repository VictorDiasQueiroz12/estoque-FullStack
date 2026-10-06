import express from "express"
import cors from "cors"
import { prisma } from "./lib/prisma.ts"

const app = express()
app.use(express.json())
app.use(cors())

const PORT = 3000

// ROTAS PRODUTO
app.get("/Produtos", async (req, res) =>{
    const produto = await prisma.produtos.findMany()
    res.json(produto) 
})

app.post("/Produtos", async (req, res) =>{
    
    try{
    const {nome, codigo, quantidade, estoqueMinimo} = req.body

    const novoProduto = await prisma.produtos.create({
        data: {
            nome, 
            codigo,
            quantidade: Number(quantidade),
            estoqueMinimo: Number(estoqueMinimo)
        },
    })
    res.json(novoProduto)
}catch (error) {
        res.status(400).json({ erro: "Ta errado essa bomba", detalhe: error.message })
    }
})

app.put("/Produtos/:id", async (req, res) =>{
    const produto = await prisma.produtos.update({
        where:{id: Number(req.params.id)},
        data: req.body,
    })
    res.json(produto)
})

app.delete("/Produtos/:id", async (req, res) =>{
    const produto = await prisma.produtos.delete({
        where:{id: Number(req.params.id)},
    })
    res.json(produto)
})

// ROTAS USER
app.get("/User", async (req, res) =>{
    const usuario = await prisma.user.findMany()
    res.json(usuario) 
})

app.post("/User", async (req, res) =>{
    const usuario = await prisma.user.create({
        data: req.body,
    })
    res.json(usuario) 
}) 

app.put("/User/:id", async (req, res) =>{
    const usuario = await prisma.user.update({
        where:{id: Number(req.params.id)},
        data: req.body,
    })
    res.json(usuario)
})

app.delete("/User/:id", async (req, res) =>{
    const usuario = await prisma.user.delete({
        where:{id: Number(req.params.id)},
    })
    res.json(usuario)
})


// ROTAS MOVIMENTACAO
app.post("/Movimentacao", async (req, res) =>{
    const produtoId = Number(req.body.produtoId)
    const responsavelId = Number(req.body.responsavelId)
    const quantidadeSolicitada = Number(req.body.quantidade)

    const produto = await prisma.produtos.findUnique({
        where:{id: produtoId}
    })

    if(produto.quantidade < quantidadeSolicitada){   //se quantidade solicitada disponivel: se sim: estoque - quantidade solicitada / se não: Aviso de estoque indisponivel 
        res.status(400).json({aviso: "Não tem estoque!"})
    }
    else{
        await prisma.produtos.update({
            where: {id: produtoId},
            data: {quantidade: produto.quantidade - quantidadeSolicitada}
        })
    }
    const movimentos = await prisma.movimentacao.create({
        data: {
            produtoId: produtoId,
            responsavelId: responsavelId
        },
    })
    res.json(movimentos)
})


app.listen(PORT, () =>{
    console.log("Ta rodando ai")
})