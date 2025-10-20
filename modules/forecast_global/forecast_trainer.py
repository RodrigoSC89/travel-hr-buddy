"""
Forecast Global - Continuous Learning Trainer
Automatic model retraining system with incremental learning

Features:
- Incremental data addition from PEO-DP audits
- Dataset consolidation and deduplication
- Automatic retraining evaluation (data volume and time-based)
- Scheduled retraining with configurable intervals
- Performance validation with threshold checking
- Automatic model backup and rollback on poor performance
"""

import os
import logging
import shutil
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ForecastTrainer:
    """
    Continuous learning system for Forecast Global.
    
    Manages incremental data collection and automatic model retraining
    based on configurable triggers (data volume, time intervals).
    """
    
    def __init__(
        self,
        forecast_engine,
        dataset_path: str = "fleet_data.csv",
        backup_dir: str = "model_backups",
        min_samples_for_retraining: int = 50,
        min_days_between_retraining: int = 7,
        accuracy_threshold: float = 0.75
    ):
        """
        Initialize ForecastTrainer.
        
        Args:
            forecast_engine: ForecastEngine instance to train
            dataset_path: Path to main dataset CSV
            backup_dir: Directory for model backups
            min_samples_for_retraining: Minimum new samples before retraining
            min_days_between_retraining: Minimum days between retraining
            accuracy_threshold: Minimum acceptable accuracy (0-1)
        """
        self.engine = forecast_engine
        self.dataset_path = Path(dataset_path)
        self.backup_dir = Path(backup_dir)
        self.min_samples_for_retraining = min_samples_for_retraining
        self.min_days_between_retraining = min_days_between_retraining
        self.accuracy_threshold = accuracy_threshold
        
        # Create backup directory
        self.backup_dir.mkdir(exist_ok=True)
        
        # Initialize dataset if it doesn't exist
        if not self.dataset_path.exists():
            self._create_empty_dataset()
        
        # Track last training
        self.last_training_time: Optional[datetime] = None
        self.samples_since_training = 0
        
        logger.info(f"ForecastTrainer initialized")
        logger.info(f"  Dataset: {dataset_path}")
        logger.info(f"  Min samples for retraining: {min_samples_for_retraining}")
        logger.info(f"  Min days between retraining: {min_days_between_retraining}")
    
    def _create_empty_dataset(self):
        """Create empty dataset with proper schema."""
        df = pd.DataFrame(columns=[
            "horas_dp",
            "falhas_mensais",
            "eventos_asog",
            "score_peodp",
            "risco_conformidade",
            "embarcacao",
            "data_auditoria",
            "timestamp_adicao"
        ])
        
        df.to_csv(self.dataset_path, index=False)
        logger.info(f"Created empty dataset at {self.dataset_path}")
    
    def adicionar_dados(
        self,
        dados: List[Dict[str, Any]],
        auto_retrain: bool = True
    ) -> Dict[str, Any]:
        """
        Add new data samples to the dataset.
        
        Args:
            dados: List of dictionaries with sample data
            auto_retrain: Whether to automatically retrain if conditions are met
            
        Returns:
            Dictionary with operation results
        """
        if not dados:
            logger.warning("No data provided to add")
            return {"added": 0, "retrained": False}
        
        # Load existing data
        df = pd.read_csv(self.dataset_path)
        
        # Convert new data to DataFrame
        new_df = pd.DataFrame(dados)
        
        # Add timestamp
        new_df['timestamp_adicao'] = datetime.now().isoformat()
        
        # Validate required columns
        required_cols = ["horas_dp", "falhas_mensais", "eventos_asog", "score_peodp", "risco_conformidade"]
        missing_cols = [col for col in required_cols if col not in new_df.columns]
        
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
        
        # Combine datasets
        df = pd.concat([df, new_df], ignore_index=True)
        
        # Remove duplicates based on key columns
        if 'embarcacao' in df.columns and 'data_auditoria' in df.columns:
            df = df.drop_duplicates(subset=['embarcacao', 'data_auditoria'], keep='last')
        
        # Save updated dataset
        df.to_csv(self.dataset_path, index=False)
        
        added_count = len(dados)
        self.samples_since_training += added_count
        
        logger.info(f"Added {added_count} samples to dataset")
        logger.info(f"Total samples: {len(df)}")
        logger.info(f"Samples since last training: {self.samples_since_training}")
        
        result = {
            "added": added_count,
            "total_samples": len(df),
            "samples_since_training": self.samples_since_training,
            "retrained": False
        }
        
        # Check if retraining is needed
        if auto_retrain and self.should_retrain():
            logger.info("Auto-retraining triggered")
            retrain_result = self.retreinar()
            result["retrained"] = retrain_result.get("success", False)
            result["retrain_metrics"] = retrain_result
        
        return result
    
    def should_retrain(self) -> bool:
        """
        Check if model should be retrained based on triggers.
        
        Returns:
            True if retraining is recommended
        """
        # Check sample count trigger
        if self.samples_since_training < self.min_samples_for_retraining:
            logger.debug(f"Not enough new samples for retraining ({self.samples_since_training}/{self.min_samples_for_retraining})")
            return False
        
        # Check time trigger
        if self.last_training_time is not None:
            days_since_training = (datetime.now() - self.last_training_time).days
            if days_since_training < self.min_days_between_retraining:
                logger.debug(f"Too soon for retraining ({days_since_training}/{self.min_days_between_retraining} days)")
                return False
        
        logger.info("Retraining conditions met")
        return True
    
    def retreinar(self) -> Dict[str, Any]:
        """
        Retrain the model with updated dataset.
        
        Includes:
        - Backup of current model
        - Training on updated dataset
        - Performance validation
        - Automatic rollback if performance degrades
        
        Returns:
            Dictionary with retraining results
        """
        logger.info("=" * 60)
        logger.info("Starting model retraining...")
        logger.info("=" * 60)
        
        # Create backup of current model
        backup_path = self._backup_current_model()
        
        try:
            # Get current model performance for comparison
            old_info = self.engine.get_model_info()
            old_accuracy = old_info.get('training_metrics', {}).get('train_accuracy', 0)
            
            # Train on updated dataset
            metrics = self.engine.treinar(str(self.dataset_path), validate=True)
            
            new_accuracy = metrics.get('train_accuracy', 0)
            cv_accuracy = metrics.get('cv_mean_accuracy', 0)
            
            logger.info(f"Old accuracy: {old_accuracy:.4f}")
            logger.info(f"New accuracy: {new_accuracy:.4f}")
            logger.info(f"CV accuracy: {cv_accuracy:.4f}")
            
            # Validate performance
            if cv_accuracy < self.accuracy_threshold:
                logger.warning(f"⚠️ New model accuracy ({cv_accuracy:.4f}) below threshold ({self.accuracy_threshold:.4f})")
                logger.warning("Rolling back to previous model...")
                
                self._rollback_model(backup_path)
                
                return {
                    "success": False,
                    "reason": "accuracy_below_threshold",
                    "old_accuracy": old_accuracy,
                    "new_accuracy": new_accuracy,
                    "cv_accuracy": cv_accuracy,
                    "threshold": self.accuracy_threshold,
                    "rolled_back": True
                }
            
            # Check for significant degradation
            if old_accuracy > 0 and new_accuracy < old_accuracy * 0.95:
                logger.warning(f"⚠️ New model shows >5% degradation")
                logger.warning("Rolling back to previous model...")
                
                self._rollback_model(backup_path)
                
                return {
                    "success": False,
                    "reason": "performance_degradation",
                    "old_accuracy": old_accuracy,
                    "new_accuracy": new_accuracy,
                    "rolled_back": True
                }
            
            # Retraining successful
            self.last_training_time = datetime.now()
            self.samples_since_training = 0
            
            logger.info("=" * 60)
            logger.info("✅ Model retraining successful!")
            logger.info("=" * 60)
            
            return {
                "success": True,
                "timestamp": self.last_training_time.isoformat(),
                "old_accuracy": old_accuracy,
                "new_accuracy": new_accuracy,
                "cv_accuracy": cv_accuracy,
                "metrics": metrics,
                "backup_path": str(backup_path)
            }
            
        except Exception as e:
            logger.error(f"❌ Error during retraining: {e}")
            logger.error("Rolling back to previous model...")
            
            self._rollback_model(backup_path)
            
            return {
                "success": False,
                "reason": "training_error",
                "error": str(e),
                "rolled_back": True
            }
    
    def _backup_current_model(self) -> Path:
        """
        Create backup of current model files.
        
        Returns:
            Path to backup directory
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = self.backup_dir / f"model_backup_{timestamp}"
        backup_path.mkdir(exist_ok=True)
        
        # Backup model and scaler files
        model_files = [
            self.engine.model_path,
            self.engine.scaler_path
        ]
        
        for file_path in model_files:
            if file_path.exists():
                dest = backup_path / file_path.name
                shutil.copy2(file_path, dest)
                logger.info(f"Backed up {file_path.name} to {backup_path}")
        
        return backup_path
    
    def _rollback_model(self, backup_path: Path):
        """
        Rollback to a backed-up model.
        
        Args:
            backup_path: Path to backup directory
        """
        logger.info(f"Rolling back from {backup_path}")
        
        # Restore model and scaler files
        for backup_file in backup_path.glob("*"):
            dest = Path(backup_file.name)
            shutil.copy2(backup_file, dest)
            logger.info(f"Restored {backup_file.name}")
        
        # Reload model
        self.engine._load_model()
        
        logger.info("✅ Rollback complete")
    
    def consolidar_dataset(self) -> Dict[str, Any]:
        """
        Consolidate and clean dataset.
        
        Removes duplicates, invalid entries, and optimizes storage.
        
        Returns:
            Dictionary with consolidation statistics
        """
        logger.info("Consolidating dataset...")
        
        # Load data
        df = pd.read_csv(self.dataset_path)
        original_size = len(df)
        
        # Remove duplicates
        if 'embarcacao' in df.columns and 'data_auditoria' in df.columns:
            df = df.drop_duplicates(subset=['embarcacao', 'data_auditoria'], keep='last')
        
        # Remove rows with missing critical values
        critical_cols = ["horas_dp", "falhas_mensais", "eventos_asog", "score_peodp", "risco_conformidade"]
        df = df.dropna(subset=critical_cols)
        
        # Sort by timestamp
        if 'timestamp_adicao' in df.columns:
            df = df.sort_values('timestamp_adicao')
        
        # Save consolidated dataset
        df.to_csv(self.dataset_path, index=False)
        
        final_size = len(df)
        removed = original_size - final_size
        
        logger.info(f"Consolidation complete:")
        logger.info(f"  Original: {original_size} samples")
        logger.info(f"  Final: {final_size} samples")
        logger.info(f"  Removed: {removed} samples")
        
        return {
            "original_size": original_size,
            "final_size": final_size,
            "removed": removed
        }
    
    def get_training_status(self) -> Dict[str, Any]:
        """
        Get current training status.
        
        Returns:
            Dictionary with training status information
        """
        # Load dataset
        df = pd.read_csv(self.dataset_path)
        
        status = {
            "total_samples": len(df),
            "samples_since_training": self.samples_since_training,
            "last_training_time": self.last_training_time.isoformat() if self.last_training_time else None,
            "should_retrain": self.should_retrain(),
            "accuracy_threshold": self.accuracy_threshold,
            "model_info": self.engine.get_model_info()
        }
        
        if self.last_training_time:
            days_since = (datetime.now() - self.last_training_time).days
            status["days_since_training"] = days_since
        
        return status


# Example usage
if __name__ == "__main__":
    from forecast_engine import ForecastEngine
    
    # Initialize components
    engine = ForecastEngine(model_type="random_forest")
    trainer = ForecastTrainer(
        forecast_engine=engine,
        min_samples_for_retraining=50,
        min_days_between_retraining=7
    )
    
    # Add new data samples
    new_data = [
        {
            "horas_dp": 2400,
            "falhas_mensais": 3,
            "eventos_asog": 1,
            "score_peodp": 85,
            "risco_conformidade": 0,
            "embarcacao": "FPSO-123",
            "data_auditoria": "2024-01-15"
        },
        {
            "horas_dp": 1800,
            "falhas_mensais": 5,
            "eventos_asog": 2,
            "score_peodp": 72,
            "risco_conformidade": 1,
            "embarcacao": "FPSO-124",
            "data_auditoria": "2024-01-16"
        }
    ]
    
    result = trainer.adicionar_dados(new_data, auto_retrain=True)
    print(f"Added data result: {result}")
    
    # Get training status
    status = trainer.get_training_status()
    print(f"Training status: {status}")
