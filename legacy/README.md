# 🗄️ Legacy Code Archive - Nautilus One

## Propósito

Esta pasta contém código legado que foi **arquivado** durante a FASE A.3 da Varredura Técnica Final. O código aqui não é mais utilizado ativamente na aplicação, mas foi preservado para:

- 📚 **Referência histórica** - Consulta de implementações passadas
- 🔄 **Possível reutilização futura** - Código bem escrito que pode ser adaptado
- 🛡️ **Segurança** - Evitar deleção acidental de código potencialmente útil
- 📖 **Documentação** - Compreensão da evolução do sistema

## ⚠️ Status

**IMPORTANTE:** Este código **NÃO** está em uso na aplicação principal. Não deve ser importado ou referenciado no código ativo.

## 🗂️ Estrutura

```
legacy/
├── components/     # Componentes React arquivados
├── hooks/          # Hooks customizados arquivados
├── utils/          # Utilitários e helpers arquivados
├── pages/          # Páginas completas arquivadas
├── modules/        # Módulos inteiros arquivados
└── README.md       # Este arquivo
```

## 📋 Arquivamento

Cada arquivo/pasta aqui foi movido seguindo critérios conservadores:

### Categoria B - Arquivável (média confiança)
- Componentes não usados mas bem escritos
- Protótipos e experimentos
- Features desabilitadas
- Código legado com documentação

## 🔍 Como Usar

Se você precisa **consultar** código legado:

1. ✅ Navegue pelas pastas organizadas por tipo
2. ✅ Leia o código para referência
3. ✅ Copie snippets úteis (se necessário)

Se você precisa **restaurar** código legado:

1. ⚠️ Avalie se realmente é necessário
2. ⚠️ Modernize o código para padrões atuais
3. ⚠️ Adicione testes
4. ⚠️ Mova de volta para src/ com commit descritivo

## 🚫 O Que NÃO Fazer

- ❌ **NÃO** importe diretamente de /legacy no código ativo
- ❌ **NÃO** adicione novos arquivos aqui (use categorização adequada)
- ❌ **NÃO** modifique arquivos arquivados (preserve o histórico)

## 📊 Estatísticas

**Data de Criação:** 11 de Dezembro de 2025  
**FASE:** A.3 - Remoção de Código Morto  
**Responsável:** DeepAgent (Abacus.AI)

### Métricas Iniciais
- **Total arquivado:** 18 arquivos (157 KB)
- **Componentes:** 18
- **Critério:** Já marcados como legacy anteriormente

## 📚 Documentação Relacionada

- `CHANGELOG_FASE_A3_CODIGO_MORTO.md` - Log completo de remoções
- `dead_code_categorized.json` - Análise técnica de categorização
- `dead_code_analysis.json` - Relatório de análise automatizada

## 🔗 Referências

Para mais informações sobre a arquitetura e decisões técnicas:
- Veja commits com tag `fase-a3/codigo-morto-remocao`
- Consulte a documentação principal em `/docs`

---

**Última atualização:** 11/12/2025  
**Versão:** 1.0.0  
**Maintainer:** Equipe Nautilus One
