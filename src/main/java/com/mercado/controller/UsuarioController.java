package com.mercado.controller;

import com.mercado.model.Usuario;
import com.mercado.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        Usuario usuarioExistente = repository.findByCelular(usuario.getCelular());
        if (usuarioExistente != null) {
            return ResponseEntity.badRequest().body("Celular já cadastrado.");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        
        if (usuario.getRole() == null || usuario.getRole().isEmpty()) {
            usuario.setRole("ROLE_USER");
        }
        
        Usuario novoUsuario = repository.save(usuario);
        return ResponseEntity.ok(novoUsuario);
    }

    @PutMapping("/{id}/tornar-vendedor")
    public ResponseEntity<Usuario> tornarVendedor(@PathVariable Long id) {
        return repository.findById(id)
                .map(usuario -> {
                    usuario.setRole("ROLE_ADMIN");
                    Usuario atualizado = repository.save(usuario);
                    return ResponseEntity.ok().body(atualizado);
                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(usuario -> ResponseEntity.ok().body(usuario))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<Usuario> atualizarPerfil(@RequestBody Usuario atualizado, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        
        Usuario usuario = repository.findByCelular(authentication.getName());
        if (usuario != null) {
            usuario.setNome(atualizado.getNome());
            if (atualizado.getSenha() != null && !atualizado.getSenha().isEmpty()) {
                usuario.setSenha(passwordEncoder.encode(atualizado.getSenha()));
            }
            return ResponseEntity.ok(repository.save(usuario));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Usuario> dadosDoUsuarioLogado(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String celular = authentication.getName();
        Usuario usuario = repository.findByCelular(celular);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }
}