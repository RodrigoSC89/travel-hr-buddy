#!/usr/bin/env python3
"""
Script de teste completo do módulo Forecast de Risco
Valida todas as funcionalidades implementadas

Versão: 1.0.0
"""

import sys
import os
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modules.forecast_risk import RiskForecast


def test_importacao():
    """Teste 1: Importação de módulos"""
    print("✓ Teste 1: Importação de módulos... ", end="")
    try:
        from core.logger import log
        from modules.forecast_risk import RiskForecast
        print("✅ PASSOU")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def test_carregamento_dados():
    """Teste 2: Carregamento de dados FMEA/ASOG"""
    print("✓ Teste 2: Carregamento de dados... ", end="")
    try:
        forecast = RiskForecast()
        resultado = forecast.carregar_dados()
        assert resultado == True, "Falha ao carregar dados"
        assert forecast.dados_fmea is not None, "Dados FMEA não carregados"
        assert forecast.dados_asog is not None, "Dados ASOG não carregados"
        print("✅ PASSOU")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def test_calculo_rpn():
    """Teste 3: Cálculo de RPN médio"""
    print("✓ Teste 3: Cálculo de RPN médio... ", end="")
    try:
        forecast = RiskForecast()
        forecast.carregar_dados()
        rpn_medio = forecast.calcular_rpn_medio()
        assert rpn_medio > 0, "RPN médio deve ser maior que zero"
        assert 0 <= rpn_medio <= 1000, "RPN médio fora do range esperado"
        print(f"✅ PASSOU (RPN médio: {rpn_medio})")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def test_variabilidade():
    """Teste 4: Cálculo de variabilidade"""
    print("✓ Teste 4: Cálculo de variabilidade... ", end="")
    try:
        forecast = RiskForecast()
        forecast.carregar_dados()
        variabilidade = forecast.calcular_variabilidade()
        assert variabilidade >= 0, "Variabilidade deve ser não-negativa"
        print(f"✅ PASSOU (σ: {variabilidade:.2f})")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def test_classificacao_risco():
    """Teste 5: Classificação de risco"""
    print("✓ Teste 5: Classificação de risco... ", end="")
    try:
        forecast = RiskForecast()
        
        # Teste risco BAIXA
        assert forecast.classificar_risco(100) == "BAIXA", "RPN 100 deveria ser BAIXA"
        
        # Teste risco MODERADA
        assert forecast.classificar_risco(175) == "MODERADA", "RPN 175 deveria ser MODERADA"
        
        # Teste risco ALTA
        assert forecast.classificar_risco(250) == "ALTA", "RPN 250 deveria ser ALTA"
        
        print("✅ PASSOU (todos os níveis)")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def test_status_asog():
    """Teste 6: Verificação de status ASOG"""
    print("✓ Teste 6: Verificação de status ASOG... ", end="")
    try:
        forecast = RiskForecast()
        forecast.carregar_dados()
        status = forecast.verificar_status_asog()
        assert status in ["conforme", "fora dos limites", "sem dados"], "Status ASOG inválido"
        print(f"✅ PASSOU (status: {status})")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def test_geracao_previsao():
    """Teste 7: Geração de previsão completa"""
    print("✓ Teste 7: Geração de previsão... ", end="")
    try:
        forecast = RiskForecast()
        resultado = forecast.gerar_previsao()
        
        # Validar campos obrigatórios
        assert "timestamp" in resultado, "Campo timestamp ausente"
        assert "risco_previsto" in resultado, "Campo risco_previsto ausente"
        assert "rpn_medio" in resultado, "Campo rpn_medio ausente"
        assert "variabilidade" in resultado, "Campo variabilidade ausente"
        assert "status_operacional" in resultado, "Campo status_operacional ausente"
        assert "recomendacao" in resultado, "Campo recomendacao ausente"
        
        # Validar valores
        assert resultado["risco_previsto"] in ["BAIXA", "MODERADA", "ALTA"], "Risco inválido"
        assert resultado["rpn_medio"] >= 0, "RPN médio inválido"
        
        print("✅ PASSOU")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def test_salvamento_relatorio():
    """Teste 8: Salvamento de relatório"""
    print("✓ Teste 8: Salvamento de relatório... ", end="")
    try:
        forecast = RiskForecast()
        resultado = forecast.gerar_previsao()
        
        # Salvar em arquivo temporário
        teste_arquivo = "teste_forecast.json"
        sucesso = forecast.salvar_relatorio(resultado, teste_arquivo)
        assert sucesso == True, "Falha ao salvar relatório"
        
        # Verificar se arquivo foi criado
        assert os.path.exists(teste_arquivo), "Arquivo não foi criado"
        
        # Validar JSON
        with open(teste_arquivo, 'r') as f:
            dados = json.load(f)
        assert dados == resultado, "Dados salvos não correspondem ao original"
        
        # Limpar
        os.remove(teste_arquivo)
        
        print("✅ PASSOU")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def test_caso_extremo_arquivo_ausente():
    """Teste 9: Caso extremo - arquivo ausente"""
    print("✓ Teste 9: Arquivo ausente (caso extremo)... ", end="")
    try:
        forecast = RiskForecast(fmea_file="nao_existe.json", asog_file="nao_existe.json")
        resultado = forecast.gerar_previsao()
        
        # Deve retornar resultado com erro, mas não crashar
        assert "timestamp" in resultado, "Timestamp ausente"
        assert resultado["risco_previsto"] == "DESCONHECIDO", "Deveria ser DESCONHECIDO"
        
        print("✅ PASSOU")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def test_dados_fmea_exemplo():
    """Teste 10: Validação dos dados FMEA de exemplo"""
    print("✓ Teste 10: Validação dados FMEA... ", end="")
    try:
        with open("relatorio_fmea_atual.json", 'r') as f:
            dados = json.load(f)
        
        assert "sistemas_analisados" in dados, "Campo sistemas_analisados ausente"
        assert len(dados["sistemas_analisados"]) == 8, "Deveria ter 8 sistemas"
        
        # Validar estrutura de cada sistema
        for sistema in dados["sistemas_analisados"]:
            assert "id" in sistema, "Campo id ausente"
            assert "nome" in sistema, "Campo nome ausente"
            assert "rpn" in sistema, "Campo rpn ausente"
            assert "severidade" in sistema, "Campo severidade ausente"
            assert "ocorrencia" in sistema, "Campo ocorrencia ausente"
            assert "deteccao" in sistema, "Campo deteccao ausente"
        
        print(f"✅ PASSOU ({len(dados['sistemas_analisados'])} sistemas)")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def test_dados_asog_exemplo():
    """Teste 11: Validação dos dados ASOG de exemplo"""
    print("✓ Teste 11: Validação dados ASOG... ", end="")
    try:
        with open("asog_report.json", 'r') as f:
            dados = json.load(f)
        
        assert "parametros_operacionais" in dados, "Campo parametros_operacionais ausente"
        assert len(dados["parametros_operacionais"]) == 4, "Deveria ter 4 parâmetros"
        
        # Validar estrutura de cada parâmetro
        for param in dados["parametros_operacionais"]:
            assert "parametro" in param, "Campo parametro ausente"
            assert "valor_atual" in param, "Campo valor_atual ausente"
            assert "limite_minimo" in param, "Campo limite_minimo ausente"
            assert "status" in param, "Campo status ausente"
        
        print(f"✅ PASSOU ({len(dados['parametros_operacionais'])} parâmetros)")
        return True
    except Exception as e:
        print(f"❌ FALHOU: {e}")
        return False


def main():
    """Executa todos os testes"""
    print("=" * 70)
    print("🔬 TESTES DO MÓDULO FORECAST DE RISCO")
    print("=" * 70)
    print()
    
    testes = [
        test_importacao,
        test_carregamento_dados,
        test_calculo_rpn,
        test_variabilidade,
        test_classificacao_risco,
        test_status_asog,
        test_geracao_previsao,
        test_salvamento_relatorio,
        test_caso_extremo_arquivo_ausente,
        test_dados_fmea_exemplo,
        test_dados_asog_exemplo,
    ]
    
    resultados = []
    
    for teste in testes:
        resultado = teste()
        resultados.append(resultado)
    
    print()
    print("=" * 70)
    print("📊 RESUMO DOS TESTES")
    print("=" * 70)
    
    total = len(resultados)
    aprovados = sum(resultados)
    reprovados = total - aprovados
    taxa_sucesso = (aprovados / total) * 100
    
    print(f"\nTotal de testes: {total}")
    print(f"✅ Aprovados: {aprovados}")
    print(f"❌ Reprovados: {reprovados}")
    print(f"📈 Taxa de sucesso: {taxa_sucesso:.1f}%")
    
    if aprovados == total:
        print("\n🎉 TODOS OS TESTES PASSARAM! 🎉")
        print("\n✅ Módulo Forecast de Risco está funcionando perfeitamente!")
        return 0
    else:
        print(f"\n⚠️  {reprovados} teste(s) falharam!")
        return 1


if __name__ == "__main__":
    sys.exit(main())
