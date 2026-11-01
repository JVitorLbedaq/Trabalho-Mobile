package com.mercado.controller;

import com.mercado.model.Pedido;
import com.mercado.model.Produto;
import com.mercado.repository.PedidoRepository;
import com.mercado.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<String> criarPedido(@RequestBody Pedido pedido) {
        Optional<Produto> produtoOpt = produtoRepository.findById(pedido.getProdutoId());
        
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Produto não encontrado.");
        }

        Produto produto = produtoOpt.get();

        if (produto.getQuantidadeDisponivel() < pedido.getQuantidade()) {
            return ResponseEntity.badRequest().body("Quantidade indisponível em estoque.");
        }

        produto.setQuantidadeDisponivel(produto.getQuantidadeDisponivel() - pedido.getQuantidade());
        produtoRepository.save(produto);
        
        pedidoRepository.save(pedido);
        
        return ResponseEntity.ok("Pedido salvo e estoque atualizado com sucesso!");
    }

    @GetMapping
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }
}