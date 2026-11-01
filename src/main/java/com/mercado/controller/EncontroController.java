package com.mercado.controller;

import com.mercado.model.Encontro;
import com.mercado.repository.EncontroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/encontros")
public class EncontroController {

    @Autowired
    private EncontroRepository repository;

    @GetMapping
    public List<Encontro> listarTodos() {
        return repository.findAll();
    }

    @PostMapping
    public Encontro criar(@RequestBody Encontro encontro) {
        return repository.save(encontro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        return repository.findById(id).map(encontro -> {
            repository.delete(encontro);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}