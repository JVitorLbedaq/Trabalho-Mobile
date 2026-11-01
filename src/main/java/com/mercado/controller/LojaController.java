package com.mercado.controller;

import com.mercado.model.Loja;
import com.mercado.repository.LojaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lojas")
public class LojaController {

    @Autowired
    private LojaRepository repository;

    @GetMapping
    public List<Loja> listarTodas() {
        return repository.findAll();
    }

    @PostMapping
    public Loja criar(@RequestBody Loja loja) {
        return repository.save(loja);
    }

    @GetMapping("/vendedor/{vendedorId}")
    public List<Loja> buscarPorVendedor(@PathVariable Long vendedorId) {
        return repository.findByVendedorId(vendedorId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Loja> atualizarLoja(@PathVariable Long id, @RequestBody Loja lojaAtualizada) {
        return repository.findById(id)
                .map(loja -> {
                    loja.setNome(lojaAtualizada.getNome());
                    return ResponseEntity.ok().body(repository.save(loja));
                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Loja> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(loja -> ResponseEntity.ok().body(loja))
                .orElse(ResponseEntity.notFound().build());
    }
}