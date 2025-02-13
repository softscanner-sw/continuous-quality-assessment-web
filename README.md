# SoftScanner Backend – Continuous Quality Assessment Platform
SoftScanner is an **automated continuous quality assessment (CQA) platform** designed for **web applications**. This backend service provides **instrumentation, telemetry collection and storage, metric computation, and continuous goal assessments** using the **SoftScanner Quality Mapping Model (SSQMM)**, aligned with **ISO/IEC 25010 (2023) standards**.

SoftScanner maps high-level quality goals to observable metrics through **SSQMM**. Each goal assessment is **timestamped**, enabling **historical tracking of quality trends** and **long-term storage for analysis**.

Instrumentation bundles are dynamically generated and deployed to target applications, ensuring non-invasive instrumentation. The design is **modular and extensible**, making it easy to integrate with different telemetry providers such as **OpenTelemetry** for trace data and **Prometheus** for system metrics.

---

## 🌟 Key Features
- **📊 Continuous Quality Assessment** → Automates continuous monitoring of quality goals.  
- **🕒 Timestamped Goal Assessments** → Tracks assessments over time for historical analysis.  
- **📈 Dynamic Metric Evaluations** → Computes and stores metric values with timestamps for trend tracking.  
- **📡 API-Driven Architecture** → Exposes endpoints for **metadata, goals, metrics, and assessments**.  
- **🛠️ Non-Invasive Instrumentation** → Dynamically injects telemetry agents without modifying application code.  
- **⚡ Continuous Progress Updates** → Streams live progress and assessment results using **SSE events**.  
- **📏 Quality Mapping Model (SSQMM)** → Maps **abstract stakeholder goals** to **observable metrics**.  
- **💾 Telemetry Collection and Storage** → Supports MongoDB and filesystem-based storage for telemetry data.  
- **🗂️ Modular and Extensible** → Easily add new goals, metrics, and telemetry providers.

---

## 📁 Project Structure
```plaintext
src/
├── api/
│   └── server.ts                 # Express API server entry point
├── core/
│   ├── application/              # Application metadata
│   ├── assessment/               # Core assessment logic and strategies
│   ├── goals/                    # Goal definitions and goal-mapping logic
│   ├── instrumentation/          # Instrumentation management and injection
│   ├── metrics/                  # Core metrics definitions, computers, interpreters, and mappers
│   ├── models/                   # Quality model and SSQMM
│   ├── telemetry/                # Core telemetry configuration and data collection and storage
│   └── util/                     # Utility functions and dependency management
├── modules/
│   ├── instrumentation/          # Instrumentation implementations and deployment
│   ├── metrics/                  # Metrics implementations and mappings
│   └── telemetry/                # Telemetry collection and storage strategies
├── services/                     # Core services (e.g., instrumentation, telemetry, metrics, quality assessment, progress tracking)
```

---

## 🔧 Setup & Installation
### 1️⃣ Prerequisites
Ensure you have the following installed:
- **Node.js** (>= 16.x recommended)
- **npm** (bundled with Node.js)
- **MongoDB** (>= 6.x)
- **TypeScript Compiler**
- **Webpack** (for generating instrumentation bundles)

### 2️⃣ Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/softscanner-sw/softscanner-backend.git
cd softscanner-backend
npm install
```

### 3️⃣ Running MongoDB
Create a database named `continuous-quality-assessment-web-telemetry-mongodb` at `localhost:27017`.  
You can use [MongoDB Compass](https://www.mongodb.com/products/tools/compass) for easy management.

Start MongoDB:
```bash
mongo "mongodb://localhost:27017/"
use "continuous-quality-assessment-web-telemetry-mongodb"
```

Telemetry and assessments are stored in MongoDB or on filesystems. Each instrumentation bundle has associated telemetry data and assessments. This change enables:

- **Long-term storage of quality assessments**
- **Easy retrieval for comparative analysis**
- **Improved monitoring and tracking of quality trends**

#### MongoDB Database Schema
```json
{
  "normalizedAppName": "posts-users-ui-ng",
  "bundles": [
    {
      "name": "posts-users-ui-ng_2025_02_13T13_05_30_915Z.bundle.js",
      "telemetryData": [...],
      "assessments": [
        {
          "goal": "User Engagement",
          "globalScore": 85,
          "timestamp": "2025-02-13T13:05:30Z",
          "details": [
            {
              "metric": "NUU",
              "value": 10,
              "weight": 0.4,
              "timestamp": "2025-02-13T13:05:30Z"
            },
            {
              "metric": "UIF",
              "value": 15,
              "weight": 0.6,
              "timestamp": "2025-02-13T13:05:30Z"
            }
          ]
        }
      ]
    }
  ]
}
```

### 3️⃣ Running the Backend
```bash
npm start
```
This will:
1. **Compile TypeScript files**.
2. **Launch the backend server** (`http://localhost:3000`).
3. **Expose REST API endpoints** for quality assessment.
4. **Enable telemetry collection, storage, and live goal assessment**.

---

## 📡 API Overview
SoftScanner Backend provides structured **RESTful APIs** to interact with **quality models, goals, metrics, and assessments**.

### 🔗 Key Endpoints
| Method   | Endpoint                            | Description                                       |
| -------- | ----------------------------------- | ------------------------------------------------- |
| **GET**  | `/api/quality-model`                | Retrieves the quality model and associated goals. |
| **POST** | `/api/assessment`                   | Initiates a new quality assessment.               |
| **GET**  | `/api/progress?assessmentId=XYZ`    | Streams live progress updates via SSE.            |
| **GET**  | `/api/assessments?assessmentId=XYZ` | Streams live assessment results continously.             |

---

## 📜 Quality Assessment Workflow
### 1️⃣ Define Quality Goals and Provide Metadata
Users select relevant **quality goals** and provide application metadata.  

### 2️⃣ Automatic Instrumentation
SoftScanner dynamically generates and injects **telemetry agents** for runtime data collection.  

### 3️⃣ Data Collection, Storage & Metric Computation
The instrumented application continuously collects and stores **real-time data**, and **SoftScanner computes quality metrics**.

### 4️⃣ Timestamped Goal Assessments
- Each goal stores multiple **timestamped assessments** with metric contributions and global scores.  
- Historical tracking enables **trend analysis** and **comparative assessments**.  

### 5️⃣ Continous Real-Time API Updates
Users can:
- **Monitor progress** (`/api/progress`).
- **Retrieve assessment history** (`/api/assessments`).

---

## 📡 API Usage Examples
### 1️⃣ Retrieve Quality Model
#### Request
```http
GET /api/quality-model
```
#### Response
```json
{
    "name":"ISO/IEC 25010 - Product Quality Model",
    "purpose":"The ISO/IEC 25010 (2023) identifies eight main quality characteristics of software systems...",
    "assessmentMethodology":"https://www.iso.org/obp/ui/#iso:std:iso-iec:25010:ed-2:v1:en",
    "goals":[
        {
            "name":"Interaction Capability",
            "description":"The ability of a product to be interacted with by specified users ...",
            "weight":1,
            "metrics":["Number of Unique Users","User Interaction Frequency"],
            "subGoals":[
                {"name":"Appropriateness Recognizability"...},
                ...
                {
                    "name":"User Engagement",
                    "description":"The degree to which the software presents functions and information in an inviting and motivating manner encouraging continued interaction",
                    "weight":1,
                    "metrics":["Number of Unique Users","User Interaction Frequency"]
                },
                ...
            ]
        },
        ...
    ]
  }
```

### 2️⃣ Start an Assessment
#### Request
```http
POST /api/assessment
Content-Type: application/json
```
```json
{
  "metadata": {
    "name": "My Web App",
    "type": "Web (Frontend)",
    "technology": "Angular",
    "path": "/absolute/path/to/project",
    "url": "http://localhost:4200"
  },
  "selectedGoals": ["User Engagement"]
}
```
#### Response
```json
{
  "message": "Assessment started successfully!",
  "assessmentId": "1706308901234",
  "progressEndpoint": "/api/progress?assessmentId=1706308901234",
  "assessmentEndpoint": "/api/assessments?assessmentId=1706308901234"
}
```

### 3️⃣ Stream Progress Updates
#### Request
```http
GET /api/progress?assessmentId=1706308901234
```
#### Response (SSE)
```json
{ "type": "progress", "message": "Instrumentation completed" }
```

### 4️⃣ Stream Assessment Results
#### Request
```http
GET /api/assessments?assessmentId=1706308901234
```
#### Response (SSE)
```json
{
    "metadata": { /* same format as input metadata in /assessment endpoint */ },
    "selectedGoals": [
        {
            "name": "User Engagement",
            "description": "The degree to which the software presents functions...",
            "weight": 1,
            "metrics": [
                {
                    "name": "Number of Unique Users",
                    "acronym": "NUU",
                    "description": "Number of distinct users using an application",
                    "value": 2,
                    "unit": "users",
                    "history": [
                        {
                            "timestamp": "2025-01-27T23:35:11.879Z",
                            "value": 0
                        },
                        ...
                    ]
                },
                {
                    "name": "User Interaction Frequency",
                    "acronym": "UIF",
                    "description": "How frequently users interact with the software during a typical session",
                    "value": 9,
                    "unit": "interactions/session",
                    "history": [ ... ]
                }
            ],
            "assessment": {
                "globalScore": 0.014799999999999999,
                "details": [
                    { "metric": "NUU", "value": 0.01, "weight": 0.4 },
                    { "metric": "UIF", "value": 0.018, "weight": 0.6 }
                ]
            }
        },
        ...
    ]
}
```

---

## 🌍 Example Usage
### 1️⃣ Start SoftScanner Backend
```bash
npm start
```
### 2️⃣ Open SoftScanner Web UI
Use the accompanying frontend project: [SoftScanner UI Repository](https://github.com/softscanner-sw/continuous-quality-assessment-web-ui).

Alternatively, use **Postman** to interact with the backend API.

### 3️⃣ Perform a Quality Assessment
1. **Select quality goals** in the UI.
2. Click **Start Assessment**.
3. Open your **web application in a browser** → SoftScanner **automatically tracks interactions**.

### 4️⃣ View Results
- Continuous **progress updates** (`/api/progress`).
- Timestamped **goal assessments** (`/api/assessments`).
- Metric **history and contributions** displayed via **interactive charts**.

---

## 🛣 Roadmap
- Move from Server-Sent Events (SSE) to WebSockets for a more scalable solution.
- Add support for **more metrics** (e.g., Security, Ecological Footprint).
- Expand integration with **Prometheus** and other observability tools.  

---

## 📜 License
SoftScanner Backend is licensed under the **MIT License**.

---