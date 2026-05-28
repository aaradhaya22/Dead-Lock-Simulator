# backend/routes/request_resource.py

from flask import Blueprint, request, jsonify
from models.system_state import system_state
from banker import request_resources_algorithm

request_bp = Blueprint('request_bp', __name__)

@request_bp.route('/request-resource', methods=['POST'])
def request_resource():
    """
    POST /request-resource
    Handles resource requests from a specific process.
    Validates request limits, performs Banker's safety checks, 
    and updates system state if granted. Otherwise, denies and rolls back.
    """
    try:
        # Guard: check if system state is initialized
        if system_state.num_processes == 0:
            return jsonify({"error": "System state has not been initialized yet. Please initialize first."}), 400

        data = request.get_json() or {}
        
        process_id = data.get("process_id")
        request_vector = data.get("request")
        
        if process_id is None or request_vector is None:
            return jsonify({"error": "Fields 'process_id' and 'request' are required in request body."}), 400
            
        try:
            process_id = int(process_id)
        except ValueError:
            return jsonify({"error": "process_id must be an integer."}), 400
            
        if process_id < 0 or process_id >= system_state.num_processes:
            return jsonify({"error": f"Invalid process_id. Must be between 0 and {system_state.num_processes - 1}."}), 400
            
        if not isinstance(request_vector, list) or len(request_vector) != system_state.num_resources:
            return jsonify({"error": f"Request vector must be a list of size {system_state.num_resources}."}), 400
            
        # Parse elements as integers and check for negatives
        try:
            request_vector = [int(r) for r in request_vector]
        except ValueError:
            return jsonify({"error": "All values in the request vector must be integers."}), 400
            
        if any(r < 0 for r in request_vector):
            return jsonify({"error": "Request values cannot be negative."}), 400

        # Execute resource request safety check
        granted, reason, safe_sequence = request_resources_algorithm(
            available=system_state.available,
            max_matrix=system_state.max_matrix,
            alloc_matrix=system_state.alloc_matrix,
            need_matrix=system_state.need_matrix,
            process_id=process_id,
            request_vector=request_vector
        )
        
        # If granted, commit changes in the system state model
        if granted:
            system_state.update_allocation(process_id, request_vector)
            system_state.set_safety_status(True, safe_sequence)
        else:
            # If denied, do not modify system_state matrices (automatic rollback/non-granting)
            # Just ensure state is safe according to the latest check if it was already safe
            pass

        return jsonify({
            "granted": granted,
            "reason": reason,
            "safe_sequence": safe_sequence,
            "state": system_state.to_dict()
        }), 200

    except ValueError as val_err:
        return jsonify({"error": str(val_err)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
