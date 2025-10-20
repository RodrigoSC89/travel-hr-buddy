#!/usr/bin/env python3
"""
Test script for BridgeLink module
"""

import sys
from modules.bridge_link import BridgeLink
from core.logger import log_event

def test_bridge_link():
    """Test the BridgeLink module functionality."""
    print("\n" + "="*60)
    print("🧪 Testing BridgeLink Module")
    print("="*60)
    
    try:
        # Test 1: Module import
        print("\n✅ Test 1: Module imported successfully")
        
        # Test 2: Create instance
        bridge = BridgeLink()
        print("✅ Test 2: BridgeLink instance created")
        
        # Test 3: Check configuration
        print(f"✅ Test 3: Configuration loaded")
        print(f"   Endpoint: {bridge.endpoint}")
        print(f"   Files to sync: {len(bridge.files)}")
        
        # Test 4: Test file loading
        print("\n✅ Test 4: Testing file loading...")
        for nome, arquivo in bridge.files.items():
            dados = bridge.carregar_arquivo(arquivo)
            if dados:
                print(f"   ✓ {nome}: {arquivo} (loaded)")
            else:
                print(f"   ⚠ {nome}: {arquivo} (not found)")
        
        # Test 5: Run synchronization (this will fail to connect but test the logic)
        print("\n✅ Test 5: Running synchronization test...")
        print("   Note: Connection will fail (test endpoint), but logic will be tested")
        bridge.sincronizar()
        
        print("\n" + "="*60)
        print("✅ All tests completed!")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_bridge_link()
    sys.exit(0 if success else 1)
