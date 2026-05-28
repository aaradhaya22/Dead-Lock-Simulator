# AI-Powered Deadlock Detection and Prevention System

An interactive Operating System simulator demonstrating **Deadlock Detection**, **Deadlock Prevention**, **Resource Allocation**, and **Safe State Analysis** using the **Banker’s Algorithm** integrated with **AI-powered educational explanations** using **OpenRouter AI**.

This project combines:

* Operating System concepts
* Full-stack web development
* AI integration
* Interactive visualization

The application is designed as an educational simulator that helps students understand how deadlocks occur, how Banker’s Algorithm works, and how operating systems safely allocate resources.

---

# 🚀 Features

## ✅ Banker’s Algorithm Simulation

* Dynamic resource allocation simulation
* Safe state verification
* Deadlock prevention mechanism
* Need matrix calculation
* Safe sequence generation

## ✅ Interactive Dashboard

* Configure processes and resources dynamically
* Edit matrices in real-time
* Visualize safe and unsafe states
* Animated safe sequence visualization

## ✅ AI-Powered Educational Assistant

* AI-generated explanations for:

  * Safe states
  * Unsafe states
  * Resource requests
  * Deadlock concepts
* Interactive chatbot support
* Powered by OpenRouter AI

## ✅ Modern UI/UX

* Futuristic dark-themed dashboard
* Glassmorphism design
* Responsive layout
* Smooth animations using Framer Motion

---

# 🛠️ Technology Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Framer Motion
* Axios
* Lucide React

## Backend

* Python
* Flask
* Flask-CORS

## AI Integration

* OpenRouter API
* Llama 3.1 8B Instruct Model

---

# 📸 Application Screenshots

## Home Page

(Add screenshot here)

## Dashboard

(Add screenshot here)

## Need Matrix & AI Explanation

(Add screenshot here)

## Safe Sequence Visualization

(Add screenshot here)

---

# 🧠 How the Simulator Works

## Step 1 — User Configuration

The user enters:

* Number of processes
* Number of resources
* Available resource vector
* Maximum resource requirements
* Allocation matrix

---

## Step 2 — Need Matrix Calculation

The simulator calculates:

```text
Need = Max - Allocation
```

This determines how many additional resources each process may still require.

---

## Step 3 — Banker’s Algorithm Execution

The backend checks:

* Whether all processes can safely execute
* Whether the system is in a safe state
* Whether deadlock may occur

If a valid execution order exists, the simulator generates a safe sequence.

Example:

```text
P1 → P3 → P4 → P0 → P2
```

---

## Step 4 — Resource Request Simulation

When a process requests resources:

1. Resources are temporarily allocated
2. Safety algorithm re-runs
3. Request is:

   * Granted if system remains safe
   * Denied if unsafe state occurs

---

## Step 5 — AI Explanation Generation

The AI system generates educational explanations describing:

* Why the state is safe or unsafe
* Why a request was accepted or denied
* How Banker’s Algorithm made decisions

---

# 📂 Project Structure

```text
project-root/
│
├── backend/
│   ├── app.py
│   ├── banker.py
│   ├── ai_service.py
│   ├── requirements.txt
│   ├── .env
│   ├── models/
│   │   └── system_state.py
│   └── routes/
│       ├── initialize.py
│       ├── request_resource.py
│       ├── safe_check.py
│       └── ai_routes.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── styles/
│       └── utils/
│
└── README.md
```

---

# ⚙️ Backend Setup

## 1. Navigate to Backend

```bash
cd backend
```

---

## 2. Create Virtual Environment

### Windows PowerShell

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create a `.env` file inside `backend/`

```env
OPENROUTER_API_KEY=your_api_key_here
PORT=5000
```

---

## 5. Run Backend Server

```bash
python app.py
```

Backend will run on:

```text
http://127.0.0.1:5000
```

---

# 💻 Frontend Setup

## 1. Navigate to Frontend

```bash
cd frontend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Start Frontend

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

# 🔌 API Endpoints

## POST `/initialize`

Initializes simulation matrices.

### Request

```json
{
  "processes": 5,
  "resources": 3
}
```

---

## POST `/check-safe`

Checks whether the system is in a safe state.

### Request

```json
{
  "available": [...],
  "max": [[...]],
  "allocation": [[...]]
}
```

---

## POST `/request-resource`

Processes a resource allocation request.

### Request

```json
{
  "process_id": 0,
  "request": [...]
}
```

---

## POST `/ai-explain`

Generates AI-based explanations and chatbot responses.

### Request

```json
{
  "type": "chat",
  "message": "Explain deadlock"
}
```

---

# 🔥 Key Features

* Dynamic matrix editing
* Real-time Need Matrix calculation
* Animated safe sequence generation
* Deadlock prevention simulation
* AI-powered educational explanations
* Interactive chatbot assistant
* Responsive futuristic UI
* Local state persistence

---

# 🚀 Future Improvements

* Resource Allocation Graph visualization
* Multi-user simulation mode
* Real-time process animations
* Database integration
* Simulation history tracking
* PDF report export
* Voice-enabled AI tutor
* Docker deployment
* Cloud hosting support

---

# 🧪 Example Use Case

## Scenario

Processes:

```text
P0, P1, P2, P3, P4
```

Resources:

```text
A, B, C
```

The simulator:

1. Calculates Need Matrix
2. Runs Banker’s Algorithm
3. Generates safe sequence
4. Prevents unsafe allocations
5. Explains results using AI

---

# 🚨 Troubleshooting

## Backend Not Starting

Ensure virtual environment is activated:

```bash
.\venv\Scripts\Activate.ps1
```

---

## Missing Python Packages

Run:

```bash
pip install -r requirements.txt
```

---

## Frontend Errors

Run:

```bash
npm install
```

---

## OpenRouter API Errors

Verify:

* `.env` exists inside `backend/`
* API key is valid
* Internet connection is active

If API fails:

* fallback educational responses are automatically used

---

# 👨‍💻 Author

## Aaradhaya Dattole

* GitHub: https://github.com/aaradhaya22

---

# ⭐ Project Highlights

This project demonstrates:

* Operating System concepts
* Deadlock prevention
* Full-stack web development
* API integration
* AI-assisted education
* Interactive visualization

It is designed as both:

* an educational simulator
* a portfolio-ready technical project

---

# 📜 License

This project is developed for educational and academic purposes.
