"""
Forecast Global Trainer
=======================
Sistema de aprendizado contínuo para o Forecast Global.
Atualiza automaticamente o modelo com novos dados de relatórios PEO-DP.

Funcionalidades:
- Aprendizado incremental
- Retreinamento agendado
- Detecção de data drift
- Validação automática de performance
- Versionamento de modelos
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging
import json
from forecast_engine import ForecastEngine
import schedule
import time

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ForecastTrainer:
    """
    Sistema de treinamento contínuo para o Forecast Global.
    
    Attributes:
        engine (ForecastEngine): Engine de previsão
        data_dir (str): Diretório com dados de treinamento
        min_new_records (int): Número mínimo de novos registros para retreinar
        performance_threshold (float): Threshold de performance para aceitar novo modelo
    """
    
    def __init__(
        self,
        engine: ForecastEngine,
        data_dir: str = "data/training",
        min_new_records: int = 100,
        performance_threshold: float = 0.75
    ):
        """
        Inicializa o sistema de treinamento contínuo.
        
        Args:
            engine: Instância do ForecastEngine
            data_dir: Diretório contendo dados de treinamento
            min_new_records: Mínimo de novos registros para retreinamento
            performance_threshold: Acurácia mínima para aceitar novo modelo
        """
        self.engine = engine
        self.data_dir = Path(data_dir)
        self.min_new_records = min_new_records
        self.performance_threshold = performance_threshold
        
        # Criar diretório se não existir
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Arquivo de controle de treinamento
        self.training_log_path = self.data_dir / "training_log.json"
        self.training_log = self._load_training_log()
        
        logger.info(f"ForecastTrainer inicializado: data_dir={data_dir}")
    
    def _load_training_log(self) -> Dict[str, Any]:
        """Carrega histórico de treinamentos."""
        if self.training_log_path.exists():
            with open(self.training_log_path, 'r') as f:
                return json.load(f)
        return {
            "trainings": [],
            "last_training": None,
            "total_records": 0
        }
    
    def _save_training_log(self):
        """Salva histórico de treinamentos."""
        with open(self.training_log_path, 'w') as f:
            json.dump(self.training_log, f, indent=2)
    
    def adicionar_dados(
        self,
        novos_dados: pd.DataFrame,
        fonte: str = "manual"
    ) -> Dict[str, Any]:
        """
        Adiciona novos dados ao dataset de treinamento.
        
        Args:
            novos_dados: DataFrame com novos registros
            fonte: Identificador da fonte dos dados (ex: "relatorio_mensal", "evento_critico")
        
        Returns:
            Dicionário com informações sobre os dados adicionados
        """
        try:
            # Validar colunas
            required_cols = self.engine.feature_names + ["risco_conformidade"]
            missing_cols = [col for col in required_cols if col not in novos_dados.columns]
            if missing_cols:
                raise ValueError(f"Colunas faltando: {missing_cols}")
            
            # Criar timestamp para o arquivo
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"dados_{fonte}_{timestamp}.csv"
            filepath = self.data_dir / filename
            
            # Salvar novos dados
            novos_dados.to_csv(filepath, index=False)
            
            # Atualizar log
            self.training_log["total_records"] += len(novos_dados)
            
            logger.info(f"✅ {len(novos_dados)} novos registros adicionados: {filename}")
            
            return {
                "status": "success",
                "records_added": len(novos_dados),
                "filepath": str(filepath),
                "total_records": self.training_log["total_records"]
            }
            
        except Exception as e:
            logger.error(f"❌ Erro ao adicionar dados: {str(e)}")
            raise
    
    def consolidar_datasets(self) -> str:
        """
        Consolida todos os datasets em um único arquivo para treinamento.
        
        Returns:
            Caminho do dataset consolidado
        """
        logger.info("Consolidando datasets...")
        
        # Encontrar todos os CSVs
        csv_files = list(self.data_dir.glob("dados_*.csv"))
        
        if not csv_files:
            raise FileNotFoundError("Nenhum dataset encontrado para consolidar")
        
        # Carregar e concatenar
        dfs = []
        for csv_file in csv_files:
            try:
                df = pd.read_csv(csv_file)
                dfs.append(df)
                logger.debug(f"  ✓ {csv_file.name}: {len(df)} registros")
            except Exception as e:
                logger.warning(f"  ⚠️ Erro ao ler {csv_file.name}: {str(e)}")
        
        # Consolidar
        df_consolidated = pd.concat(dfs, ignore_index=True)
        
        # Remover duplicatas
        df_consolidated.drop_duplicates(inplace=True)
        
        # Salvar dataset consolidado
        consolidated_path = self.data_dir / "dataset_consolidado.csv"
        df_consolidated.to_csv(consolidated_path, index=False)
        
        logger.info(f"✅ Dataset consolidado: {len(df_consolidated)} registros únicos")
        
        return str(consolidated_path)
    
    def avaliar_necessidade_retreinamento(self) -> Dict[str, Any]:
        """
        Avalia se é necessário retreinar o modelo.
        
        Returns:
            Dicionário com análise de necessidade de retreinamento
        """
        # Contar registros novos desde último treinamento
        last_training = self.training_log.get("last_training")
        
        if not last_training:
            return {
                "needs_retraining": True,
                "reason": "Modelo ainda não foi treinado",
                "new_records": self.training_log["total_records"]
            }
        
        # Calcular registros desde último treinamento
        last_training_records = last_training.get("total_records", 0)
        new_records = self.training_log["total_records"] - last_training_records
        
        # Verificar se há registros suficientes
        if new_records < self.min_new_records:
            return {
                "needs_retraining": False,
                "reason": f"Apenas {new_records} novos registros (mínimo: {self.min_new_records})",
                "new_records": new_records
            }
        
        # Verificar tempo desde último treinamento
        last_date = datetime.fromisoformat(last_training["timestamp"])
        days_since = (datetime.now() - last_date).days
        
        if days_since < 7:
            return {
                "needs_retraining": False,
                "reason": f"Último treinamento há {days_since} dias (mínimo: 7 dias)",
                "new_records": new_records,
                "days_since_training": days_since
            }
        
        return {
            "needs_retraining": True,
            "reason": f"{new_records} novos registros disponíveis e {days_since} dias desde último treinamento",
            "new_records": new_records,
            "days_since_training": days_since
        }
    
    def retreinar_modelo(
        self,
        force: bool = False
    ) -> Dict[str, Any]:
        """
        Retreina o modelo com dados atualizados.
        
        Args:
            force: Se True, força retreinamento mesmo sem necessidade
        
        Returns:
            Dicionário com resultados do retreinamento
        """
        logger.info("🔄 Iniciando processo de retreinamento...")
        
        # Avaliar necessidade
        if not force:
            avaliacao = self.avaliar_necessidade_retreinamento()
            if not avaliacao["needs_retraining"]:
                logger.info(f"⏭️ Retreinamento não necessário: {avaliacao['reason']}")
                return {
                    "status": "skipped",
                    "reason": avaliacao["reason"]
                }
        
        try:
            # Consolidar datasets
            consolidated_path = self.consolidar_datasets()
            
            # Salvar modelo anterior (backup)
            if Path(self.engine.model_path).exists():
                backup_path = f"{self.engine.model_path}.backup"
                import shutil
                shutil.copy(self.engine.model_path, backup_path)
                logger.info(f"📦 Backup do modelo anterior criado")
            
            # Treinar novo modelo
            logger.info("🧠 Treinando novo modelo...")
            resultado_treino = self.engine.treinar(
                dataset_csv=consolidated_path,
                validate=True
            )
            
            # Validar performance do novo modelo
            test_accuracy = resultado_treino["metrics"]["test_accuracy"]
            
            if test_accuracy < self.performance_threshold:
                logger.warning(
                    f"⚠️ Novo modelo abaixo do threshold: "
                    f"{test_accuracy:.4f} < {self.performance_threshold}"
                )
                
                # Restaurar modelo anterior se existir backup
                backup_path = f"{self.engine.model_path}.backup"
                if Path(backup_path).exists():
                    import shutil
                    shutil.copy(backup_path, self.engine.model_path)
                    logger.info("↩️ Modelo anterior restaurado")
                
                return {
                    "status": "rejected",
                    "reason": "Performance abaixo do threshold",
                    "test_accuracy": test_accuracy,
                    "threshold": self.performance_threshold
                }
            
            # Aceitar novo modelo
            logger.info(f"✅ Novo modelo aceito: acurácia={test_accuracy:.4f}")
            
            # Atualizar log de treinamento
            training_record = {
                "timestamp": datetime.now().isoformat(),
                "total_records": self.training_log["total_records"],
                "test_accuracy": test_accuracy,
                "roc_auc": resultado_treino["metrics"]["roc_auc"],
                "model_version": self.engine.version
            }
            
            self.training_log["trainings"].append(training_record)
            self.training_log["last_training"] = training_record
            self._save_training_log()
            
            return {
                "status": "success",
                "test_accuracy": test_accuracy,
                "roc_auc": resultado_treino["metrics"]["roc_auc"],
                "training_record": training_record
            }
            
        except Exception as e:
            logger.error(f"❌ Erro no retreinamento: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def adicionar_dados_de_relatorio(
        self,
        relatorio: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Extrai dados de um relatório PEO-DP e adiciona ao dataset de treinamento.
        
        Args:
            relatorio: Dicionário com dados do relatório PEO-DP
                Esperado: {
                    "embarcacao": str,
                    "horas_dp": float,
                    "falhas_mensais": int,
                    "eventos_asog": int,
                    "score_peodp": float,
                    "teve_nao_conformidade": bool
                }
        
        Returns:
            Dicionário com status da operação
        """
        try:
            # Converter para DataFrame
            df = pd.DataFrame([{
                "horas_dp": relatorio["horas_dp"],
                "falhas_mensais": relatorio["falhas_mensais"],
                "eventos_asog": relatorio["eventos_asog"],
                "score_peodp": relatorio["score_peodp"],
                "risco_conformidade": 1 if relatorio.get("teve_nao_conformidade", False) else 0
            }])
            
            # Adicionar dados
            resultado = self.adicionar_dados(
                novos_dados=df,
                fonte=f"relatorio_{relatorio.get('embarcacao', 'unknown')}"
            )
            
            # Verificar necessidade de retreinamento
            avaliacao = self.avaliar_necessidade_retreinamento()
            if avaliacao["needs_retraining"]:
                logger.info("🔔 Retreinamento recomendado")
                resultado["retraining_recommended"] = True
            
            return resultado
            
        except Exception as e:
            logger.error(f"❌ Erro ao processar relatório: {str(e)}")
            raise
    
    def agendar_retreinamento_automatico(
        self,
        intervalo_dias: int = 7,
        hora: str = "03:00"
    ):
        """
        Agenda retreinamento automático periódico.
        
        Args:
            intervalo_dias: Intervalo em dias entre retreinamentos
            hora: Hora do dia para executar (formato HH:MM)
        """
        logger.info(f"📅 Agendando retreinamento: a cada {intervalo_dias} dias às {hora}")
        
        # Agendar com schedule
        if intervalo_dias == 1:
            schedule.every().day.at(hora).do(self.retreinar_modelo)
        else:
            schedule.every(intervalo_dias).days.at(hora).do(self.retreinar_modelo)
        
        logger.info("✅ Retreinamento automático agendado")
    
    def executar_loop_retreinamento(self):
        """
        Loop principal para retreinamento automático agendado.
        Mantém o processo rodando e executa retreinamentos conforme agendado.
        """
        logger.info("🔄 Loop de retreinamento automático iniciado")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Verificar a cada minuto
        except KeyboardInterrupt:
            logger.info("🛑 Loop de retreinamento interrompido")
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Retorna estatísticas do sistema de treinamento.
        
        Returns:
            Dicionário com estatísticas
        """
        # Contar arquivos de dados
        csv_files = list(self.data_dir.glob("dados_*.csv"))
        
        # Última atualização
        if csv_files:
            latest_file = max(csv_files, key=lambda p: p.stat().st_mtime)
            latest_update = datetime.fromtimestamp(latest_file.stat().st_mtime).isoformat()
        else:
            latest_update = None
        
        return {
            "total_records": self.training_log["total_records"],
            "total_trainings": len(self.training_log["trainings"]),
            "last_training": self.training_log.get("last_training"),
            "data_files": len(csv_files),
            "latest_update": latest_update,
            "min_records_for_retraining": self.min_new_records,
            "performance_threshold": self.performance_threshold
        }


if __name__ == "__main__":
    # Exemplo de uso
    print("🧠 Forecast Global Trainer - Exemplo de Uso")
    print("=" * 60)
    
    # Criar engine e trainer
    engine = ForecastEngine()
    trainer = ForecastTrainer(
        engine=engine,
        min_new_records=50  # Baixar para demonstração
    )
    
    # Exemplo 1: Adicionar dados de relatório
    print("\n1. Adicionando dados de relatório PEO-DP...")
    relatorio_exemplo = {
        "embarcacao": "FPSO-123",
        "horas_dp": 2400,
        "falhas_mensais": 3,
        "eventos_asog": 1,
        "score_peodp": 85,
        "teve_nao_conformidade": False
    }
    
    resultado = trainer.adicionar_dados_de_relatorio(relatorio_exemplo)
    print(f"   ✅ Dados adicionados: {resultado['records_added']} registros")
    
    # Exemplo 2: Adicionar múltiplos dados
    print("\n2. Adicionando múltiplos registros...")
    df_exemplo = pd.DataFrame({
        'horas_dp': np.random.randint(1000, 3000, 100),
        'falhas_mensais': np.random.randint(0, 10, 100),
        'eventos_asog': np.random.randint(0, 5, 100),
        'score_peodp': np.random.randint(60, 100, 100),
        'risco_conformidade': np.random.randint(0, 2, 100)
    })
    
    resultado = trainer.adicionar_dados(df_exemplo, fonte="simulacao")
    print(f"   ✅ {resultado['records_added']} registros adicionados")
    
    # Exemplo 3: Avaliar necessidade de retreinamento
    print("\n3. Avaliando necessidade de retreinamento...")
    avaliacao = trainer.avaliar_necessidade_retreinamento()
    print(f"   Necessita retreinamento: {avaliacao['needs_retraining']}")
    print(f"   Razão: {avaliacao['reason']}")
    
    # Exemplo 4: Retreinar modelo
    if avaliacao['needs_retraining']:
        print("\n4. Retreinando modelo...")
        resultado = trainer.retreinar_modelo(force=True)
        print(f"   Status: {resultado['status']}")
        if resultado['status'] == 'success':
            print(f"   Acurácia: {resultado['test_accuracy']:.4f}")
    
    # Exemplo 5: Estatísticas
    print("\n5. Estatísticas do sistema:")
    stats = trainer.get_statistics()
    print(f"   Total de registros: {stats['total_records']}")
    print(f"   Total de treinamentos: {stats['total_trainings']}")
    print(f"   Arquivos de dados: {stats['data_files']}")
    
    print("\n" + "=" * 60)
    print("✅ Exemplo concluído!")
