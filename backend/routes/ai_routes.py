# backend/routes/ai_routes.py

from flask import Blueprint, request, jsonify
from models.system_state import system_state
from ai_service import get_gemini_explanation, get_gemini_chat_response

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/ai-explain', methods=['POST'])
def ai_explain():
    """
    POST /ai-explain
    Handles AI explain requests for two contexts:
    1. 'request' mode: automatically explains a specific resource request transaction
    2. 'chat' mode: acts as a chatbot for custom OS and deadlock queries
    """
    try:
        data = request.get_json() or {}
        mode = data.get("type", "request") # Default to request explanation
        
        # Verify system state has been initialized
        if system_state.num_processes == 0:
            # Send a default explanation or error
            # Better to allow general chat questions even if simulator is uninitialized
            pass
            
        if mode == "request":
            request_details = data.get("request_details")
            response_status = data.get("response_status")
            
            if not request_details or not response_status:
                return jsonify({"error": "Fields 'request_details' and 'response_status' are required in request mode."}), 400
                
            explanation = get_gemini_explanation(
                system_state_dict=system_state.to_dict(),
                request_details_dict=request_details,
                response_status=response_status
            )
            
            return jsonify({
                "explanation": explanation
            }), 200
            
        elif mode == "chat":
            user_message = data.get("message")
            chat_history = data.get("chat_history", [])
            
            if not user_message:
                return jsonify({"error": "Field 'message' is required in chat mode."}), 400
                
            reply = get_gemini_chat_response(
                system_state_dict=system_state.to_dict(),
                user_message=user_message,
                chat_history=chat_history
            )
            
            return jsonify({
                "reply": reply
            }), 200
            
        else:
            return jsonify({"error": "Invalid value for 'type'. Must be 'request' or 'chat'."}), 400

    except Exception as e:
        print(f"Exception in AI routes: {str(e)}")
        return jsonify({"error": f"Failed to generate AI response: {str(e)}"}), 500
