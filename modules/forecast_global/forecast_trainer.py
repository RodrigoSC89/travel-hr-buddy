"""
Forecast Global Trainer - Continuous Learning System
=====================================================

Manages continuous learning by incrementally adding data from PEO-DP audits
and retraining models when appropriate.

Features:
- Incremental data addition from PEO-DP audits
- Dataset consolidation and deduplication
- Automatic retraining evaluation
- Scheduled retraining with configurable intervals
- Performance validation with threshold checking
- Automatic model backup and rollback

Author: PEO-DP Inteligente System
Version: 1.0.0
License: MIT
"""

import os
import shutil
import logging
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import json


class ForecastTrainer:
    """
    Continuous learning system for Forecast Global.
    
    Manages incremental data collection from audits and automatic
    retraining when data volume or time thresholds are met.
    """
    
    def __init__(self, data_path: str, engine=None, 
                 min_records_for_retrain: int = 100,
                 retrain_interval_days: int = 7):
        """
        Initialize ForecastTrainer.
        
        Args:
            data_path: Path to CSV file for storing training data
            engine: ForecastEngine instance
            min_records_for_retrain: Minimum new records before retraining
            retrain_interval_days: Days between automatic retraining
        """
        self.data_path = data_path
        self.engine = engine
        self.min_records_for_retrain = min_records_for_retrain
        self.retrain_interval_days = retrain_interval_days
        
        # State file to track training history
        self.state_file = data_path.replace('.csv', '_state.json')
        self.state = self._load_state()
        
        # Configure logging
        self.logger = logging.getLogger('ForecastTrainer')
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
        
        self.logger.info(f"ForecastTrainer initialized: {data_path}")
    
    def _load_state(self) -> Dict[str, Any]:
        """Load trainer state from file"""
        if os.path.exists(self.state_file):
            with open(self.state_file, 'r') as f:
                return json.load(f)
        
        return {
            'last_training': None,
            'training_count': 0,
            'records_since_training': 0,
            'last_accuracy': None,
            'best_accuracy': None
        }
    
    def _save_state(self):
        """Save trainer state to file"""
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def adicionar_dados_auditoria(self, audit_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add data from a PEO-DP audit to the training dataset.
        
        Args:
            audit_data: Audit data dict with features and risk level
            
        Returns:
            Dict with addition result
        """
        try:
            # Convert audit data to DataFrame row
            new_row = pd.DataFrame([audit_data])
            
            # Load existing data or create new
            if os.path.exists(self.data_path):
                df = pd.read_csv(self.data_path)
                df = pd.concat([df, new_row], ignore_index=True)
            else:
                df = new_row
            
            # Remove duplicates based on all columns
            original_count = len(df)
            df = df.drop_duplicates()
            duplicates_removed = original_count - len(df)
            
            # Save updated dataset
            df.to_csv(self.data_path, index=False)
            
            # Update state
            self.state['records_since_training'] += 1
            self._save_state()
            
            self.logger.info(f"Added audit data to dataset: {len(df)} total records")
            
            return {
                'success': True,
                'total_records': len(df),
                'duplicates_removed': duplicates_removed,
                'records_since_training': self.state['records_since_training'],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to add audit data: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def consolidar_dataset(self, additional_data_paths: List[str]) -> Dict[str, Any]:
        """
        Consolidate data from multiple sources.
        
        Args:
            additional_data_paths: List of paths to additional CSV files
            
        Returns:
            Dict with consolidation result
        """
        try:
            dfs = []
            
            # Load main dataset
            if os.path.exists(self.data_path):
                dfs.append(pd.read_csv(self.data_path))
            
            # Load additional datasets
            for path in additional_data_paths:
                if os.path.exists(path):
                    dfs.append(pd.read_csv(path))
            
            if not dfs:
                return {
                    'success': False,
                    'error': 'No data found',
                    'timestamp': datetime.now().isoformat()
                }
            
            # Concatenate all data
            df = pd.concat(dfs, ignore_index=True)
            
            # Remove duplicates
            original_count = len(df)
            df = df.drop_duplicates()
            duplicates_removed = original_count - len(df)
            
            # Save consolidated dataset
            df.to_csv(self.data_path, index=False)
            
            self.logger.info(f"Dataset consolidated: {len(df)} total records, {duplicates_removed} duplicates removed")
            
            return {
                'success': True,
                'total_records': len(df),
                'duplicates_removed': duplicates_removed,
                'sources': len(additional_data_paths) + 1,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Dataset consolidation failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def avaliar_necessidade_retreinamento(self) -> Dict[str, Any]:
        """
        Evaluate if retraining is needed based on data volume and time.
        
        Returns:
            Dict with evaluation result and recommendation
        """
        should_retrain = False
        reasons = []
        
        # Check record count
        if self.state['records_since_training'] >= self.min_records_for_retrain:
            should_retrain = True
            reasons.append(f"Accumulated {self.state['records_since_training']} new records")
        
        # Check time since last training
        if self.state['last_training']:
            last_training = datetime.fromisoformat(self.state['last_training'])
            days_since = (datetime.now() - last_training).days
            
            if days_since >= self.retrain_interval_days:
                should_retrain = True
                reasons.append(f"{days_since} days since last training")
        else:
            should_retrain = True
            reasons.append("Never trained before")
        
        return {
            'should_retrain': should_retrain,
            'reasons': reasons,
            'records_since_training': self.state['records_since_training'],
            'last_training': self.state['last_training'],
            'timestamp': datetime.now().isoformat()
        }
    
    def retreinar_modelo(self, min_accuracy: float = 0.75,
                        backup: bool = True) -> Dict[str, Any]:
        """
        Retrain the model with current dataset.
        
        Args:
            min_accuracy: Minimum acceptable accuracy (0-1)
            backup: Whether to backup old model before retraining
            
        Returns:
            Dict with retraining result
        """
        if not self.engine:
            return {
                'success': False,
                'error': 'No engine configured',
                'timestamp': datetime.now().isoformat()
            }
        
        if not os.path.exists(self.data_path):
            return {
                'success': False,
                'error': 'No training data available',
                'timestamp': datetime.now().isoformat()
            }
        
        try:
            # Backup current model if requested
            model_path = self.data_path.replace('.csv', '_model.pkl')
            if backup and os.path.exists(model_path):
                backup_path = model_path.replace('.pkl', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pkl')
                shutil.copy(model_path, backup_path)
                self.logger.info(f"Model backed up to {backup_path}")
            
            # Train model
            self.logger.info("Starting model retraining...")
            result = self.engine.treinar(self.data_path)
            
            if not result.get('success'):
                return result
            
            # Check accuracy threshold
            accuracy = result.get('training_accuracy', 0)
            
            if accuracy < min_accuracy:
                self.logger.warning(f"Accuracy {accuracy:.2%} below threshold {min_accuracy:.2%}")
                
                # Rollback if we have a backup
                if backup and os.path.exists(backup_path):
                    shutil.copy(backup_path, model_path)
                    self.logger.info("Rolled back to previous model")
                
                return {
                    'success': False,
                    'error': f"Accuracy {accuracy:.2%} below threshold {min_accuracy:.2%}",
                    'accuracy': accuracy,
                    'rolled_back': backup,
                    'timestamp': datetime.now().isoformat()
                }
            
            # Save new model
            self.engine.salvar_modelo(model_path)
            
            # Update state
            self.state['last_training'] = datetime.now().isoformat()
            self.state['training_count'] += 1
            self.state['records_since_training'] = 0
            self.state['last_accuracy'] = accuracy
            
            if self.state['best_accuracy'] is None or accuracy > self.state['best_accuracy']:
                self.state['best_accuracy'] = accuracy
            
            self._save_state()
            
            self.logger.info(f"Model retrained successfully: {accuracy:.2%} accuracy")
            
            return {
                'success': True,
                'accuracy': accuracy,
                'training_count': self.state['training_count'],
                'best_accuracy': self.state['best_accuracy'],
                'training_samples': result.get('training_samples'),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Retraining failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def agendar_retreinamento_automatico(self) -> Dict[str, Any]:
        """
        Evaluate and perform automatic retraining if needed.
        
        Returns:
            Dict with result of automatic retraining evaluation
        """
        # Evaluate if retraining is needed
        evaluation = self.avaliar_necessidade_retreinamento()
        
        if not evaluation['should_retrain']:
            return {
                'retrained': False,
                'evaluation': evaluation,
                'timestamp': datetime.now().isoformat()
            }
        
        # Perform retraining
        self.logger.info(f"Automatic retraining triggered: {', '.join(evaluation['reasons'])}")
        result = self.retreinar_modelo()
        
        return {
            'retrained': True,
            'evaluation': evaluation,
            'training_result': result,
            'timestamp': datetime.now().isoformat()
        }


# Example usage
if __name__ == "__main__":
    from forecast_engine import ForecastEngine
    
    # Initialize engine and trainer
    engine = ForecastEngine(model_type="random_forest")
    trainer = ForecastTrainer(
        data_path="/tmp/fleet_training_data.csv",
        engine=engine,
        min_records_for_retrain=5
    )
    
    # Add some audit data
    print("Adding audit data...")
    for i in range(10):
        audit = {
            'horas_dp': 2000 + i * 100,
            'falhas': 1 + i % 5,
            'eventos_criticos': i % 3,
            'score_conformidade': 90 - i * 2,
            'risk_level': i % 4
        }
        result = trainer.adicionar_dados_auditoria(audit)
        print(f"Added record {i+1}: {result['total_records']} total")
    
    # Check if retraining is needed
    print("\nEvaluating retraining need...")
    evaluation = trainer.avaliar_necessidade_retreinamento()
    print(json.dumps(evaluation, indent=2))
    
    # Perform automatic retraining
    print("\nAttempting automatic retraining...")
    result = trainer.agendar_retreinamento_automatico()
    print(json.dumps(result, indent=2))
