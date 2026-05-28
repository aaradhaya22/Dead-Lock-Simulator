# backend/routes/safe_check.py

from flask import Blueprint, request, jsonify
from models.system_state import system_state
from banker import check_safety

safe_check_bp = Blueprint('safe_check_bp', __name__)

@safe_check_bp.route('/check-safe', methods=['POST'])
def check_state_safety():
    """
    POST /check-safe
    Evaluates the safety of the current system configuration.
    Accepts optional custom matrices in the request body to update the system state.
    """
    try:
        # Check if client sent updated matrices
        data = request.get_json() or {}
        
        available = data.get("available")
        max_matrix = data.get("max_matrix")
        alloc_matrix = data.get("alloc_matrix")
        
        # If matrices are provided, update the system state model first
        if available is not None or max_matrix is not None or alloc_matrix is not None:
            if available is None or max_matrix is None or alloc_matrix is None:
                return jsonify({"error": "To update state, you must provide all three: 'available', 'max_matrix', and 'alloc_matrix'."}), 400
            
            num_processes = len(max_matrix)
            num_resources = len(available)
            
            # This triggers validations (non-negatives, dimensions, Max >= Alloc)
            system_state.initialize_state(
                num_processes=num_processes,
                num_resources=num_resources,
                available=available,
                max_matrix=max_matrix,
                alloc_matrix=alloc_matrix
            )
        
        # Guard: check if system state is initialized
        if system_state.num_processes == 0:
            return jsonify({"error": "System state has not been initialized yet. Please initialize first."}), 400

        # Execute safety algorithm
        is_safe, safe_sequence = check_safety(
            system_state.available,
            system_state.max_matrix,
            system_state.alloc_matrix,
            system_state.need_matrix
        )
        
        # Update state safety status
        system_state.set_safety_status(is_safe, safe_sequence)

        return jsonify({
            "is_safe": is_safe,
            "safe_sequence": safe_sequence,
            "state": system_state.to_dict(),
            "message": "System is in a SAFE state." if is_safe else "System is in an UNSAFE state (potential deadlock)."
        }), 200

    except ValueError as val_err:
        return jsonify({"error": str(val_err)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
