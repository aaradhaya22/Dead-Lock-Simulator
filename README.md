# AI-Powered Deadlock Detection and Prevention System

An educational operating-system simulator demonstrating deadlock detection, safety checks, and resource allocation using the **Banker's Algorithm** and **Generative AI explanations** powered by the **Google Gemini API**.

The application is structured into a Python Flask backend (handling state management, safety evaluation, and Gemini AI querying) and a React (Vite + Tailwind CSS + Framer Motion) frontend (displaying interactive state matrices, animated safe sequences, status indicators, and an AI chat interface).

---

## 🛠️ Architecture & Folder Responsibilities

The project follows a clean, decoupled architecture:

```
project-root/
│
├── .gitignore              # Configured ignores for node_modules, .env, pycache, etc.
├── README.md               # Documentation and setup guide (this file)
│
├── backend/                # Flask Backend
│   ├── app.py              # Application entrypoint & Blueprint registration
│   ├── banker.py           # Banker's Safety and Resource Request Algorithms
│   ├── ai_service.py       # Gemini API service wrapper & prompt management
│   ├── requirements.txt    # Python packages list
│   ├── .env                # Local environment secrets (not committed)
│   ├── models/
│   │   └── system_state.py # Centralized application state model
│   └── routes/
│       ├── initialize.py       # Initialize simulation matrices API
│       ├── request_resource.py # Resource request allocation & safety evaluation API
│       ├── safe_check.py       # Direct state safety check API
│       └── ai_routes.py        # Gemini-based auto-explanations & chatbot conversations API
│
└── frontend/               # React + Vite Frontend
    ├── package.json        # Node.js dependencies (Tailwind, Axios, Framer Motion, Lucide)
    ├── vite.config.js      # Vite compilation configuration
    ├── tailwind.config.js  # Tailwind custom design/theme rules
    └── src/
        ├── main.jsx        # React root rendering
        ├── App.jsx         # App router and layout wrapper
        ├── api/
        │   └── api.js      # Axios API client setup and routes
        ├── components/
        │   ├── Navbar.jsx          # Futuristic top navigation bar
        │   ├── MatrixInput.jsx     # Matrix grids to input Max, Allocation, and Available resources
        │   ├── NeedMatrix.jsx      # Live Need matrix visualizer
        │   ├── SafeSequence.jsx    # Animated safe sequence path visualizer
        │   ├── RequestPanel.jsx    # Process resource request manager
        │   ├── AIChatbot.jsx       # Sliding drawer chatbot panel
        │   ├── ExplanationCard.jsx # Gemini explanation display
        │   └── StatusCard.jsx      # Telemetry logs & Safe/Unsafe indicator panel
        ├── pages/
        │   ├── Home.jsx            # Animated hero home page
        │   └── Dashboard.jsx       # Control dashboard representing full state
        ├── styles/
        │   └── global.css          # Core CSS variables, styling, and scrollbars
        └── utils/
            └── matrixHelpers.js    # Matrix dimensions creation and formatting helpers
```

---

## ⚙️ Backend Setup & API Docs

### 1. Requirements & Dependencies
Navigate to the `backend/` folder. Ensure you have Python 3.8+ installed.

```bash
cd backend
python -m venv venv
# On Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Gemini API Setup & Environment Variable
Create a file named `.env` in the `backend/` folder:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=5000
```
*Note: If `GEMINI_API_KEY` is not provided or fails, the application automatically falls back to detailed pre-defined educational explanations so the simulation runs without interruption.*

### 3. API Endpoints
All API inputs are validated for negative numbers and matrix dimension mismatches.

*   `POST /initialize`
    *   **Body**: `{ "processes": 5, "resources": 3 }`
    *   **Description**: Initializes state matrices. Returns matrices (Max, Allocation, Need) set to defaults and the current available vector.
*   `POST /check-safe`
    *   **Body**: `{ "available": [...], "max": [[...]], "allocation": [[...]] }`
    *   **Description**: Executes safety evaluation using the safety algorithm. Returns safety status (`is_safe`) and the computed `safe_sequence`.
*   `POST /request-resource`
    *   **Body**: `{ "process_id": 0, "request": [...] }`
    *   **Description**: Processes a request from process `process_id`. Performs request safety evaluation. If safe, updates allocation and available vectors. Returns whether granted and the safety proof/path.
*   `POST /ai-explain`
    *   **Body**: `{ "type": "request" | "chat", "state": { ... }, "request_details": { ... }, "message": "..." }`
    *   **Description**: Resolves prompt configurations, sends context to Gemini, and returns structured markdown responses.

### 4. Running Backend
From the `backend/` directory:
```bash
python app.py
```
The server will run on `http://127.0.0.1:5000`.

---

## 💻 Frontend Setup & Features

### 1. Installation
Navigate to the `frontend/` folder:

```bash
cd frontend
npm install
```

### 2. State Persistence
The frontend incorporates a local cache using **browser localStorage**. If you reload the page, the active matrices configuration, allocation state, and available vectors are automatically retrieved so you can continue simulating uninterrupted.

### 3. Running Frontend
From the `frontend/` directory:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔮 Key Application Features

1.  **Banker's Algorithm Visualizer**: Complete simulation with dynamic inputs for Max resources, allocation values, and current system inventory.
2.  **Safety Path Nodes**: An animated step-by-step layout using `framer-motion` showing how the operating system schedules processes to avoid deadlocks.
3.  **Resource Allocation Requests**: Submit custom resource vectors. Watch the simulator run the Banker's safety check and either commit the allocations or roll them back.
4.  **AI Auto-Explanation Card**: Powered by Gemini, the system writes a comprehensive, educational explanation detailing why a request was granted or denied.
5.  **Interactive AI Chatbot Sidebar**: A floating panel where students can ask questions such as *"What is a resource allocation graph?"*, *"How does Banker's Algorithm differ from deadlock detection?"*, or *"Why is my system state unsafe?"*.
6.  **Advanced UI Theme**: Futuristic OS dark dashboard design featuring high-contrast gradients, backdrop filters (glassmorphism), clean tables, status indicators, and loading skeletons.

---

## 🚀 Troubleshooting

*   **Gemini API Key Issues**: If you receive errors regarding the Gemini model or keys, verify that the backend `.env` is inside the `backend/` folder and key is correct. If the API rate limit is reached or internet is disconnected, fallback mocks will be activated.
*   **CORS Blocked**: Confirm that `app.py` has CORS correctly initialized using `CORS(app)`.
*   **Port conflicts**: If port 5000 is occupied, change the port in backend `.env` and update the base URL in `frontend/src/api/api.js`.
