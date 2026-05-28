# backend/ai_service.py

import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Centralized Model Constant for OpenRouter AI
MODEL_NAME = "meta-llama/llama-3.1-8b-instruct:free"

# System Prompt Constants for Llama model
SYSTEM_INSTRUCTION = """
You are an expert operating systems professor and AI assistant. Your goal is to explain operating system deadlock concepts, safety states, and Banker's Algorithm allocation decisions to university students.

Guidelines:
1. Use clear, educational, and beginner-friendly language.
2. Break down complex resource allocation matrices logically.
3. Be friendly and professional.
4. Explain WHY a request was granted or denied step-by-step using current system data (Available, Max, Allocation, Need matrices).
5. If the system is in a SAFE state, explain why the safety sequence works.
6. If the system is in an UNSAFE state, explain how this can lead to a deadlock (circular wait) and why allocations are frozen/rolled back.
7. Format your responses with clean Markdown, lists, and bold text for readability.
"""

EXPLANATION_PROMPT_TEMPLATE = """
System State Data:
- Number of Processes: {num_processes}
- Number of Resources: {num_resources}
- Available Vector: {available}
- Allocation Matrix: {allocation}
- Max Matrix: {max_matrix}
- Need Matrix (Max - Allocation): {need_matrix}

Transaction Details:
- Process making request: P{process_id}
- Resource request vector: {request_vector}
- Allocation status: {status} (Granted = True, Denied = False)
- Engine Outcome / Details: {engine_reason}
- Resulting Safe Sequence (if granted): {safe_sequence}

Task:
Generate a detailed, beginner-friendly explanation of this transaction. 
1. Explain the current available resources versus what P{process_id} requested.
2. Detail the Banker's safety check process: If granted, show the step-by-step validation using the safe sequence {safe_sequence}. If denied, explain why it would leave the system vulnerable or deadlock-prone.
3. Summarize in a single sentence why the OS chose to {decision_verb} this request.
"""

CHAT_PROMPT_TEMPLATE = """
Current Simulator State:
- Number of Processes: {num_processes}
- Number of Resources: {num_resources}
- Available Vector: {available}
- Allocation Matrix: {allocation}
- Max Matrix: {max_matrix}
- Need Matrix: {need_matrix}
- System Safety Status: {is_safe}
- Active Safe Sequence: {safe_sequence}

User Question: "{user_message}"

Task:
Respond to the user's question. If they are asking about the current simulation state, reference the matrices above to explain. If they are asking general operating systems questions (deadlock prevention, Banker's algorithm, safe states, circular wait, resource graphs), provide a clear, educational, textbook-quality answer. Keep it highly relevant and educational.
"""


def _get_api_key():
    """Retrieves the OpenRouter API Key from environment variables."""
    return os.getenv("OPENROUTER_API_KEY")


def _is_api_key_valid(api_key):
    """Simple check to verify the key is not empty and not the default placeholder."""
    if not api_key:
        return False
    # Check if user left default placeholder
    if "your_key_here" in api_key.lower() or api_key.strip() == "":
        return False
    return True


def generate_fallback_explanation(system_state_dict, request_details_dict, response_status):
    """
    Fallback explanation generator when OpenRouter API is unavailable or times out.
    Provides mathematically accurate, detailed text output based on system state.
    """
    process_id = request_details_dict.get("process_id", 0)
    request_vector = request_details_dict.get("request", [])
    is_granted = response_status.get("granted", False)
    reason = response_status.get("reason", "")
    safe_seq = response_status.get("safe_sequence", [])
    
    available = system_state_dict.get("available", [])
    need = system_state_dict.get("need_matrix", [])
    alloc = system_state_dict.get("alloc_matrix", [])
    
    if is_granted:
        seq_str = " -> ".join([f"P{p}" for p in safe_seq])
        explanation = (
            f"### 🟢 Request Granted (Local Solver Explanation)\n\n"
            f"**Step 1: Constraint Verification**\n"
            f"- Process **P{process_id}** requested resources: `{request_vector}`.\n"
            f"- Declared remaining need for **P{process_id}** was `{need[process_id]}`. Since request `{request_vector}` ≤ need `{need[process_id]}`, the request is valid.\n"
            f"- Current system availability was `{available}`. Since request `{request_vector}` ≤ available `{available}`, the resources are physically available.\n\n"
            f"**Step 2: Tentative Allocation & Safety Check**\n"
            f"- The OS temporarily allocated the requested units to **P{process_id}**.\n"
            f"- Under this tentative state, Available became: `{[a - r for a, r in zip(available, request_vector)]}`.\n"
            f"- Allocation for **P{process_id}** became: `{[al + r for al, r in zip(alloc[process_id], request_vector)]}`.\n"
            f"- Need for **P{process_id}** became: `{[n - r for n, r in zip(need[process_id], request_vector)]}`.\n\n"
            f"**Step 3: Finding a Safe Path**\n"
            f"- The Safety Algorithm scanned all processes and found a valid path: **{seq_str}**.\n"
            f"- In this order, every process can receive its maximum resources, finish execution, and release its allocated resources back to the pool, ensuring **no deadlock occurs**.\n\n"
            f"**Decision**: The operating system successfully **granted** the request because the resulting state is safe."
        )
    else:
        explanation = (
            f"### 🔴 Request Denied (Local Solver Explanation)\n\n"
            f"**Reason for Denial**:\n"
            f"- *{reason}*\n\n"
            f"**Safety Check Details**:\n"
            f"- Process **P{process_id}** requested: `{request_vector}`.\n"
            f"- Remaining need: `{need[process_id]}`. Available: `{available}`.\n"
            if any(req > n for req, n in zip(request_vector, need[process_id])) else 
            f"- Although resources are available, simulating this allocation leaves the remaining processes without enough available resources to complete safely.\n"
            f"- The system would enter an **unsafe state**, meaning there is no guarantee of avoiding a deadlock if processes request their maximum limits.\n\n"
            f"**Decision**: The operating system **denied** this request and rolled back the allocation to prevent potential system deadlock."
        )
    return explanation


def generate_fallback_chat_response(system_state_dict, user_message):
    """
    Fallback chat generator when OpenRouter API is unavailable or times out.
    Provides helpful pre-formatted answers to common OS deadlock queries.
    """
    msg = user_message.lower().strip()
    
    # Check common keywords
    if "banker" in msg:
        return (
            "### 🏦 The Banker's Algorithm\n\n"
            "The **Banker's Algorithm** is a resource allocation and deadlock avoidance algorithm developed by Edsger Dijkstra. "
            "It is used by an operating system to decide whether to grant resources to a process or make it wait.\n\n"
            "**Key Matrices/Vectors:**\n"
            "- **Max Matrix**: The maximum resource demand declared by each process.\n"
            "- **Allocation Matrix**: The resources currently allocated to each process.\n"
            "- **Available Vector**: The count of resources currently free in the system.\n"
            "- **Need Matrix**: Calculated as `Max - Allocation`. Represents the remaining resources a process might request."
        )
    elif "unsafe" in msg or "safe state" in msg:
        return (
            "### ⚖️ Safe vs Unsafe States\n\n"
            "- **Safe State**: A state is safe if the operating system can allocate resources to each process (up to its maximum) in some order and still avoid deadlock. There exists at least one **Safe Sequence**.\n"
            "- **Unsafe State**: An unsafe state is **NOT** a deadlock. Rather, it means the system cannot guarantee that deadlock will be avoided. If processes request their maximum declared limits, the system could get stuck in circular wait."
        )
    elif "deadlock" in msg:
        return (
            "### 🔒 What is a Deadlock?\n\n"
            "A **deadlock** occurs in an operating system when a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process in the set.\n\n"
            "**Four Necessary Coffman Conditions for Deadlock:**\n"
            "1. **Mutual Exclusion**: Only one process can use a resource at a time.\n"
            "2. **Hold and Wait**: A process holding resources can request additional resources without releasing current ones.\n"
            "3. **No Preemption**: Resources cannot be forcibly taken from a process.\n"
            "4. **Circular Wait**: A closed chain of processes exists, where each process holds resources needed by the next."
        )
    else:
        # Generic response mentioning current state
        is_safe_str = "SAFE (green)" if system_state_dict.get("is_safe", True) else "UNSAFE (red)"
        safe_seq_str = ", ".join([f"P{p}" for p in system_state_dict.get("safe_sequence", [])])
        return (
            f"### 🤖 OS Simulator Assistant (Offline Mode)\n\n"
            f"I am operating in Offline Mode because no OpenRouter API Key was found in the environment variables, "
            f"the API call timed out, or a network request failed.\n\n"
            f"**Current System Status**:\n"
            f"- Safety Status: **{is_safe_str}**\n"
            f"- Safe Sequence: `{safe_seq_str if safe_seq_str else 'None'}`\n"
            f"- Processes: {system_state_dict.get('num_processes', 0)} | Resources: {system_state_dict.get('num_resources', 0)}\n\n"
            f"Feel free to ask me questions containing terms like **'deadlock'**, **'banker'**, or **'safe state'** "
            f"for educational definitions, or set your `OPENROUTER_API_KEY` in the `backend/.env` file to activate dynamic AI chats!"
        )


def get_gemini_explanation(system_state_dict, request_details_dict, response_status):
    """
    Queries OpenRouter API for an educational explanation of the resource request transaction.
    NOTE: Unchanged method signature preserves compatibility with existing Flask routes.
    """
    api_key = _get_api_key()
    if not _is_api_key_valid(api_key):
        return generate_fallback_explanation(system_state_dict, request_details_dict, response_status)

    try:
        # Configure OpenAI client for OpenRouter compatibility
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "AI-Powered OS Deadlock Simulator"
            }
        )
        
        # Prepare transaction content variables
        is_granted = response_status.get("granted", False)
        status_text = "GRANTED" if is_granted else "DENIED"
        decision_verb = "grant" if is_granted else "deny"
        safe_seq = response_status.get("safe_sequence", [])
        safe_seq_str = " -> ".join([f"P{p}" for p in safe_seq]) if safe_seq else "None"

        # Interpolate states in prompt template
        prompt = EXPLANATION_PROMPT_TEMPLATE.format(
            num_processes=system_state_dict.get("num_processes", 0),
            num_resources=system_state_dict.get("num_resources", 0),
            available=system_state_dict.get("available", []),
            allocation=system_state_dict.get("alloc_matrix", []),
            max_matrix=system_state_dict.get("max_matrix", []),
            need_matrix=system_state_dict.get("need_matrix", []),
            process_id=request_details_dict.get("process_id", 0),
            request_vector=request_details_dict.get("request", []),
            status=status_text,
            engine_reason=response_status.get("reason", ""),
            safe_sequence=safe_seq_str,
            decision_verb=decision_verb
        )
        
        # Execute chat completion with 30s timeout safety
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": prompt}
            ],
            timeout=30
        )
        
        # Safe Response Parsing to prevent empty outputs/choices crash
        content = None
        if response and response.choices and len(response.choices) > 0:
            content = response.choices[0].message.content
            
        if content is None or content.strip() == "":
            print("OpenRouter returned empty content. Activating offline fallback explanation.")
            return generate_fallback_explanation(system_state_dict, request_details_dict, response_status)
            
        return content
        
    except Exception as e:
        print(f"Error querying OpenRouter API for explanation: {str(e)}")
        # Graceful fallback on API key failures, timeouts, rate limits, or network errors
        return generate_fallback_explanation(system_state_dict, request_details_dict, response_status)


def get_gemini_chat_response(system_state_dict, user_message, chat_history):
    """
    Queries OpenRouter API for conversational assistance based on the current simulator state context.
    NOTE: Unchanged method signature preserves compatibility with existing Flask routes.
    """
    api_key = _get_api_key()
    if not _is_api_key_valid(api_key):
        return generate_fallback_chat_response(system_state_dict, user_message)

    try:
        # Configure OpenAI client for OpenRouter compatibility
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "AI-Powered OS Deadlock Simulator"
            }
        )
        
        safe_seq = system_state_dict.get("safe_sequence", [])
        safe_seq_str = " -> ".join([f"P{p}" for p in safe_seq]) if safe_seq else "None"
        
        # Prepare context prompt
        prompt = CHAT_PROMPT_TEMPLATE.format(
            num_processes=system_state_dict.get("num_processes", 0),
            num_resources=system_state_dict.get("num_resources", 0),
            available=system_state_dict.get("available", []),
            allocation=system_state_dict.get("alloc_matrix", []),
            max_matrix=system_state_dict.get("max_matrix", []),
            need_matrix=system_state_dict.get("need_matrix", []),
            is_safe="SAFE" if system_state_dict.get("is_safe", True) else "UNSAFE",
            safe_sequence=safe_seq_str,
            user_message=user_message
        )
        
        # Map chat history list to OpenAI API messages structures (user -> user, model -> assistant)
        messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
        
        if chat_history:
            for msg_item in chat_history:
                role = "user" if msg_item.get("role") == "user" else "assistant"
                messages.append({"role": role, "content": msg_item.get("text", "")})
                
        # Append the latest context prompt query
        messages.append({"role": "user", "content": prompt})
        
        # Execute chat completion request with 30s timeout safety
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            timeout=30
        )
        
        # Safe Response Parsing to prevent empty outputs/choices crash
        content = None
        if response and response.choices and len(response.choices) > 0:
            content = response.choices[0].message.content
            
        if content is None or content.strip() == "":
            print("OpenRouter returned empty response. Activating offline fallback chat response.")
            return generate_fallback_chat_response(system_state_dict, user_message)
            
        return content
        
    except Exception as e:
        print(f"Error querying OpenRouter API in chat: {str(e)}")
        # Graceful fallback on API key failures, timeouts, rate limits, or network errors
        return generate_fallback_chat_response(system_state_dict, user_message)
