package com.mercado.service;

import com.mercado.model.Usuario;
import com.mercado.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsuarioDetalhado implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    @Override
    public UserDetails loadUserByUsername(String celular) throws UsernameNotFoundException {
        Usuario usuario = repository.findByCelular(celular);
        
        if (usuario == null) {
            throw new UsernameNotFoundException("Celular não encontrado: " + celular);
        }

        return User.builder()
                .username(usuario.getCelular())
                .password(usuario.getSenha())
                .authorities(usuario.getRole())
                .build();
    }
}