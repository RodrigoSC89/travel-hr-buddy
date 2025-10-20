"""
MMI v2 - Marine Maintenance Intelligence 2.0
Complete technical management and embedded maintenance system

Modules:
- asset_tree: Hierarchical asset management
- maintenance_planner: Intelligent preventive maintenance
- cost_control: Cost and resource tracking
- llm_assistant: AI-powered technical assistant
- mmi_v2_core: Main system core
"""

from .asset_tree import AssetTree
from .maintenance_planner import MaintenancePlanner
from .cost_control import CostControl
from .llm_assistant import NautilusLLM
from .mmi_v2_core import MMIv2

__version__ = "2.0.0"
__all__ = [
    "AssetTree",
    "MaintenancePlanner", 
    "CostControl",
    "NautilusLLM",
    "MMIv2"
]
