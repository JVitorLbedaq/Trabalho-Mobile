package com.mercado.repository;

import com.mercado.model.Loja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LojaRepository extends JpaRepository<Loja, Long> {
    List<Loja> findByVendedorId(Long vendedorId);
}