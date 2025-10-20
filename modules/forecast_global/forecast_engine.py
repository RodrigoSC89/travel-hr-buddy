"""
Forecast Global Engine
======================
Motor de previsão baseado em aprendizado coletivo de toda a frota.
Utiliza machine learning para prever riscos de não-conformidade e falhas técnicas.

Funcionalidades:
- Treinamento com dados de múltiplas embarcações
- Previsão de risco de conformidade
- Suporte a múltiplos modelos (RandomForest, GradientBoosting, XGBoost)
- Versionamento de modelos
- Explicabilidade de predições (feature importance)
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ForecastEngine:
    """
    Motor de previsão global para análise de risco de conformidade.
    
    Attributes:
        model_path (str): Caminho para salvar/carregar modelos
        model_type (str): Tipo de modelo ML (random_forest, gradient_boosting)
        model: Modelo treinado
        feature_names (List[str]): Nomes das features utilizadas
        version (str): Versão do modelo
    """
    
    def __init__(
        self,
        model_path: str = "models/forecast_model.pkl",
        model_type: str = "random_forest"
    ):
        """
        Inicializa o Forecast Engine.
        
        Args:
            model_path: Caminho para salvar/carregar o modelo
            model_type: Tipo de modelo (random_forest, gradient_boosting)
        """
        self.model_path = model_path
        self.model_type = model_type
        self.model = None
        self.feature_names = [
            "horas_dp",
            "falhas_mensais",
            "eventos_asog",
            "score_peodp"
        ]
        self.version = "1.0.0"
        self.training_history = []
        
        # Criar diretório de modelos se não existir
        Path(model_path).parent.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"ForecastEngine inicializado: tipo={model_type}, path={model_path}")
    
    def _create_model(self) -> Any:
        """
        Cria instância do modelo baseado no tipo configurado.
        
        Returns:
            Instância do modelo ML
        """
        if self.model_type == "random_forest":
            return RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == "gradient_boosting":
            return GradientBoostingClassifier(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
        else:
            raise ValueError(f"Tipo de modelo não suportado: {self.model_type}")
    
    def treinar(
        self,
        dataset_csv: str,
        test_size: float = 0.2,
        validate: bool = True
    ) -> Dict[str, Any]:
        """
        Treina o modelo com dados de múltiplas embarcações.
        
        Args:
            dataset_csv: Caminho para arquivo CSV com dados de treinamento
            test_size: Proporção dos dados para teste (0-1)
            validate: Se True, realiza validação cruzada
        
        Returns:
            Dicionário com métricas de treinamento
        """
        logger.info(f"Iniciando treinamento com dataset: {dataset_csv}")
        
        try:
            # Carregar dados
            data = pd.read_csv(dataset_csv)
            logger.info(f"✅ Dataset carregado: {len(data)} registros")
            
            # Validar colunas necessárias
            required_cols = self.feature_names + ["risco_conformidade"]
            missing_cols = [col for col in required_cols if col not in data.columns]
            if missing_cols:
                raise ValueError(f"Colunas faltando no dataset: {missing_cols}")
            
            # Preparar dados
            X = data[self.feature_names]
            y = data["risco_conformidade"]
            
            logger.info(f"Features: {self.feature_names}")
            logger.info(f"Distribuição de classes: {y.value_counts().to_dict()}")
            
            # Dividir em treino e teste
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42, stratify=y
            )
            
            # Criar e treinar modelo
            self.model = self._create_model()
            logger.info(f"Treinando modelo {self.model_type}...")
            
            train_start = datetime.now()
            self.model.fit(X_train, y_train)
            train_duration = (datetime.now() - train_start).total_seconds()
            
            # Avaliar modelo
            train_score = self.model.score(X_train, y_train)
            test_score = self.model.score(X_test, y_test)
            
            logger.info(f"✅ Treinamento concluído em {train_duration:.2f}s")
            logger.info(f"Acurácia treino: {train_score:.4f}")
            logger.info(f"Acurácia teste: {test_score:.4f}")
            
            # Predições e métricas detalhadas
            y_pred = self.model.predict(X_test)
            y_pred_proba = self.model.predict_proba(X_test)[:, 1]
            
            # Calcular métricas
            report = classification_report(y_test, y_pred, output_dict=True)
            conf_matrix = confusion_matrix(y_test, y_pred).tolist()
            roc_auc = roc_auc_score(y_test, y_pred_proba)
            
            # Feature importance
            feature_importance = dict(zip(
                self.feature_names,
                self.model.feature_importances_.tolist()
            ))
            
            # Validação cruzada (opcional)
            cv_scores = None
            if validate:
                logger.info("Executando validação cruzada...")
                cv_scores = cross_val_score(
                    self.model, X, y, cv=5, scoring='accuracy'
                )
                logger.info(f"CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
            
            # Salvar modelo
            self._save_model()
            
            # Preparar resultado
            resultado = {
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "model_type": self.model_type,
                "version": self.version,
                "dataset_size": len(data),
                "train_size": len(X_train),
                "test_size": len(X_test),
                "train_duration_seconds": train_duration,
                "metrics": {
                    "train_accuracy": train_score,
                    "test_accuracy": test_score,
                    "roc_auc": roc_auc,
                    "classification_report": report,
                    "confusion_matrix": conf_matrix,
                    "cv_scores": cv_scores.tolist() if cv_scores is not None else None
                },
                "feature_importance": feature_importance
            }
            
            # Adicionar ao histórico
            self.training_history.append({
                "timestamp": datetime.now().isoformat(),
                "test_accuracy": test_score,
                "roc_auc": roc_auc
            })
            
            logger.info("✅ Modelo Forecast Global treinado com sucesso")
            return resultado
            
        except Exception as e:
            logger.error(f"❌ Erro no treinamento: {str(e)}")
            raise
    
    def prever(
        self,
        entrada: List[float],
        return_proba: bool = True
    ) -> Dict[str, Any]:
        """
        Realiza previsão de risco de conformidade.
        
        Args:
            entrada: Lista com valores das features [horas_dp, falhas_mensais, eventos_asog, score_peodp]
            return_proba: Se True, retorna probabilidade; se False, retorna classe
        
        Returns:
            Dicionário com predição e explicação
        """
        if self.model is None:
            try:
                self._load_model()
            except FileNotFoundError:
                raise ValueError("Modelo não treinado. Execute treinar() primeiro.")
        
        try:
            # Validar entrada
            if len(entrada) != len(self.feature_names):
                raise ValueError(
                    f"Entrada deve ter {len(self.feature_names)} valores: {self.feature_names}"
                )
            
            # Fazer predição
            entrada_array = np.array([entrada])
            
            if return_proba:
                prob = self.model.predict_proba(entrada_array)[0][1]
                risco_percentual = round(prob * 100, 2)
                classe = 1 if prob > 0.5 else 0
            else:
                classe = self.model.predict(entrada_array)[0]
                risco_percentual = None
            
            # Obter feature importance para explicação
            feature_contrib = dict(zip(
                self.feature_names,
                [float(v) for v in entrada]
            ))
            
            # Classificar risco
            if risco_percentual:
                if risco_percentual < 30:
                    nivel_risco = "baixo"
                elif risco_percentual < 60:
                    nivel_risco = "medio"
                elif risco_percentual < 80:
                    nivel_risco = "alto"
                else:
                    nivel_risco = "critico"
            else:
                nivel_risco = "alto" if classe == 1 else "baixo"
            
            resultado = {
                "risco_percentual": risco_percentual,
                "classe": int(classe),
                "nivel_risco": nivel_risco,
                "features": feature_contrib,
                "feature_importance": dict(zip(
                    self.feature_names,
                    self.model.feature_importances_.tolist()
                )),
                "timestamp": datetime.now().isoformat(),
                "model_version": self.version
            }
            
            # Gerar recomendação
            if risco_percentual and risco_percentual > 60:
                resultado["recomendacao"] = (
                    "⚠️ Risco elevado detectado. Recomenda-se criar ação corretiva via Smart Workflow."
                )
            
            return resultado
            
        except Exception as e:
            logger.error(f"❌ Erro na previsão: {str(e)}")
            raise
    
    def prever_lote(
        self,
        dataset_csv: str,
        output_csv: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Realiza previsões em lote para múltiplos registros.
        
        Args:
            dataset_csv: Caminho para arquivo CSV com dados
            output_csv: Caminho opcional para salvar resultados
        
        Returns:
            DataFrame com predições
        """
        logger.info(f"Iniciando previsão em lote: {dataset_csv}")
        
        # Carregar dados
        data = pd.read_csv(dataset_csv)
        X = data[self.feature_names]
        
        # Fazer predições
        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)[:, 1]
        
        # Adicionar ao dataframe
        data['predicao'] = predictions
        data['risco_percentual'] = (probabilities * 100).round(2)
        data['nivel_risco'] = pd.cut(
            data['risco_percentual'],
            bins=[0, 30, 60, 80, 100],
            labels=['baixo', 'medio', 'alto', 'critico']
        )
        
        # Salvar se especificado
        if output_csv:
            data.to_csv(output_csv, index=False)
            logger.info(f"✅ Resultados salvos em: {output_csv}")
        
        logger.info(f"✅ {len(data)} previsões concluídas")
        return data
    
    def _save_model(self):
        """Salva o modelo treinado em disco."""
        model_data = {
            'model': self.model,
            'feature_names': self.feature_names,
            'version': self.version,
            'model_type': self.model_type,
            'training_history': self.training_history,
            'timestamp': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, self.model_path)
        logger.info(f"✅ Modelo salvo em: {self.model_path}")
    
    def _load_model(self):
        """Carrega modelo salvo do disco."""
        if not Path(self.model_path).exists():
            raise FileNotFoundError(f"Modelo não encontrado: {self.model_path}")
        
        model_data = joblib.load(self.model_path)
        self.model = model_data['model']
        self.feature_names = model_data['feature_names']
        self.version = model_data['version']
        self.model_type = model_data['model_type']
        self.training_history = model_data.get('training_history', [])
        
        logger.info(f"✅ Modelo carregado: versão={self.version}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Retorna informações sobre o modelo atual.
        
        Returns:
            Dicionário com informações do modelo
        """
        if self.model is None:
            return {"status": "not_trained"}
        
        return {
            "status": "trained",
            "version": self.version,
            "model_type": self.model_type,
            "features": self.feature_names,
            "feature_importance": dict(zip(
                self.feature_names,
                self.model.feature_importances_.tolist()
            )),
            "training_history": self.training_history,
            "model_path": self.model_path
        }


if __name__ == "__main__":
    # Exemplo de uso
    print("🔮 Forecast Global Engine - Exemplo de Uso")
    print("=" * 60)
    
    # Criar engine
    engine = ForecastEngine(model_type="random_forest")
    
    # Exemplo 1: Treinar modelo (requer dataset)
    print("\n1. Para treinar o modelo:")
    print("   engine.treinar('dataset_embarcacoes.csv')")
    print("   O dataset deve conter as colunas:")
    print("   - horas_dp, falhas_mensais, eventos_asog, score_peodp, risco_conformidade")
    
    # Exemplo 2: Fazer predição
    print("\n2. Para fazer predição:")
    print("   # [horas_dp, falhas_mensais, eventos_asog, score_peodp]")
    print("   entrada = [2400, 3, 1, 85]")
    print("   resultado = engine.prever(entrada)")
    print("   print(f'Risco: {resultado[\"risco_percentual\"]}%')")
    
    # Criar dataset de exemplo
    print("\n3. Criando dataset de exemplo...")
    df_exemplo = pd.DataFrame({
        'horas_dp': np.random.randint(1000, 3000, 100),
        'falhas_mensais': np.random.randint(0, 10, 100),
        'eventos_asog': np.random.randint(0, 5, 100),
        'score_peodp': np.random.randint(60, 100, 100),
        'risco_conformidade': np.random.randint(0, 2, 100)
    })
    
    exemplo_path = "/tmp/dataset_exemplo.csv"
    df_exemplo.to_csv(exemplo_path, index=False)
    print(f"   ✅ Dataset de exemplo criado: {exemplo_path}")
    
    # Treinar com exemplo
    print("\n4. Treinando modelo com dataset de exemplo...")
    resultado = engine.treinar(exemplo_path, validate=True)
    print(f"   ✅ Acurácia teste: {resultado['metrics']['test_accuracy']:.4f}")
    print(f"   ✅ ROC-AUC: {resultado['metrics']['roc_auc']:.4f}")
    
    # Fazer predição
    print("\n5. Fazendo predição de exemplo...")
    entrada_teste = [2400, 3, 1, 85]
    pred = engine.prever(entrada_teste)
    print(f"   Entrada: {dict(zip(engine.feature_names, entrada_teste))}")
    print(f"   Risco: {pred['risco_percentual']}%")
    print(f"   Nível: {pred['nivel_risco']}")
    if 'recomendacao' in pred:
        print(f"   {pred['recomendacao']}")
    
    print("\n" + "=" * 60)
    print("✅ Exemplo concluído com sucesso!")
