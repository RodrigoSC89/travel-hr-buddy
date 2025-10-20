#!/bin/bash
# Setup script for Phase 3 modules (BridgeLink & Forecast Global)

set -e

echo "🚀 Phase 3 Setup Script"
echo "========================"
echo ""

# Check Python version
echo "📦 Checking Python version..."
python3 --version

if [ $? -ne 0 ]; then
    echo "❌ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

# Create virtual environment
echo ""
echo "🔧 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✅ Virtual environment created"
echo ""
echo "📥 Installing dependencies..."

# Activate and install
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Dependencies installed"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p data/training
mkdir -p data/dashboard
mkdir -p data/forecast
mkdir -p models
mkdir -p logs

echo "✅ Directories created"
echo ""

# Create sample .env file if it doesn't exist
if [ ! -f "../.env.phase3" ]; then
    echo "📝 Creating sample .env.phase3 file..."
    cat > ../.env.phase3 << 'EOF'
# Phase 3 Configuration
# Copy to .env and update with real values

# BridgeLink Configuration
BRIDGE_ENDPOINT=https://sgso.petrobras.com.br/api
BRIDGE_TOKEN=your_bearer_token_here
BRIDGE_API_PORT=5000
BRIDGE_API_USER=admin
BRIDGE_API_PASSWORD=change_me_in_production
BRIDGE_SECRET_KEY=generate_random_secret_key_here

# Forecast Global Configuration
FORECAST_MODEL_TYPE=random_forest
FORECAST_DATA_DIR=data/training
FORECAST_ALERT_THRESHOLD=60.0
EOF
    echo "✅ Sample .env.phase3 created"
    echo "   Please copy to .env and update with your values"
fi

echo ""
echo "🧪 Running basic tests..."

# Test imports
python3 << 'PYEOF'
import sys
sys.path.insert(0, '.')

try:
    from bridge_link import BridgeCore, BridgeSync
    print("  ✅ BridgeLink imports OK")
except Exception as e:
    print(f"  ❌ BridgeLink import error: {e}")
    sys.exit(1)

try:
    from forecast_global import ForecastEngine, ForecastTrainer, ForecastDashboard
    print("  ✅ Forecast Global imports OK")
except Exception as e:
    print(f"  ❌ Forecast Global import error: {e}")
    sys.exit(1)
PYEOF

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Setup failed. Please check error messages above."
    exit 1
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📚 Next steps:"
echo "   1. Copy .env.phase3 to .env and configure your credentials"
echo "   2. Activate virtual environment: source venv/bin/activate"
echo "   3. Read documentation: README files in each module"
echo "   4. Run integration example: python PHASE3_INTEGRATION_GUIDE.md"
echo ""
echo "📖 Documentation:"
echo "   - BridgeLink: bridge_link/README.md"
echo "   - Forecast Global: forecast_global/README.md"
echo "   - Integration Guide: PHASE3_INTEGRATION_GUIDE.md"
echo ""
