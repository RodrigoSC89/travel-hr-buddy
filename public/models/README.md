# DP Intelligence ONNX Model

## Overview
This directory should contain the ONNX model file for DP fault analysis.

## Required File
- **nautilus_dp_faults.onnx** - Trained model for detecting DP system anomalies

## Model Specifications
- **Input**: Float32 tensor with shape [1, 4]
  - Index 0: Thrust efficiency (0-1 range)
  - Index 1: Power consumption ratio (0-2 range)
  - Index 2: Position error (meters)
  - Index 3: Heading error (degrees)

- **Output**: Float32 tensor with single value
  - Value > 0.7: High risk of fault detected
  - Value ≤ 0.7: Normal operation

## Training the Model
The model should be trained using historical DP incident data with features:
1. Thrust efficiency metrics
2. Power consumption patterns
3. Position keeping performance
4. Heading stability

## Deployment Instructions
1. Train the model using your DP historical data
2. Export to ONNX format
3. Place the file in `public/models/nautilus_dp_faults.onnx`
4. The DPAIAnalyzer component will automatically load and use it

## Fallback Behavior
If the model file is not present, the DPAIAnalyzer will:
- Show "Falha ao carregar modelo ONNX" status
- Continue to display the component without AI predictions
- Log the error to the console for debugging

## Example Training Script (Python)
```python
import numpy as np
import onnxruntime as ort
from sklearn.neural_network import MLPClassifier
from skl2onnx import to_onnx

# Train your model
model = MLPClassifier(hidden_layer_sizes=(10, 5))
# ... training code ...

# Convert to ONNX
onx = to_onnx(model, X_train[:1].astype(np.float32))

# Save
with open("nautilus_dp_faults.onnx", "wb") as f:
    f.write(onx.SerializeToString())
```

## Testing the Model
You can test the model integration by:
1. Placing a dummy ONNX model in this directory
2. Navigating to the DP Intelligence Center page
3. Checking the browser console for model loading status
4. Verifying the AI analyzer shows appropriate status messages
