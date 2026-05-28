# backend/routes/initialize.py

from flask import Blueprint, request, jsonify
from models.system_state import system_state
from banker import check_safety

initialize_bp = Blueprint('initialize_bp', __name__)

@initialize_bp.route('/initialize', methods=['POST'])
def initialize():
    """
    POST /initialize
    Initializes or resets the Banker's Algorithm simulation parameters and matrices.
    """
    try:
        data = request.get_json() or {}
        
        # Extract process and resource sizes
        num_processes = data.get("processes")
        num_resources = data.get("resources")
        
        if num_processes is None or num_resources is None:
            return jsonify({"error": "Fields 'processes' and 'resources' are required."}), 400
            
        try:
            num_processes = int(num_processes)
            num_resources = int(num_resources)
        except ValueError:
            return jsonify({"error": "Process and resource counts must be integers."}), 400
            
        if num_processes <= 0 or num_resources <= 0:
            return jsonify({"error": "Process and resource counts must be greater than zero."}), 400
            
        # Get optional matrices or generate textbook default templates if empty
        available = data.get("available")
        max_matrix = data.get("max_matrix")
        alloc_matrix = data.get("alloc_matrix")
        
        # If any of the matrices are missing, generate a standard safe configuration
        if available is None or max_matrix is None or alloc_matrix is None:
            if num_processes == 5 and num_resources == 3:
                # Standard textbook safe configuration
                available = [3, 3, 2]
                max_matrix = [
                    [7, 5, 3],  # P0
                    [3, 2, 2],  # P1
                    [9, 0, 2],  # P2
                    [2, 2, 2],  # P3
                    [4, 3, 3]   # P4
                ]
                alloc_matrix = [
                    [0, 1, 0],  # P0
                    [2, 0, 0],  # P1
                    [3, 0, 2],  # P2
                    [2, 1, 1],  # P3
                    [0, 0, 2]   # P4
                ]
            else:
                # Generate empty templates for custom dimensions
                available = [0] * num_resources
                max_matrix = [[0] * num_resources for _ in range(num_processes)]
                alloc_matrix = [[0] * num_resources for _ in range(num_processes)]
        
        # Initialize state model (automatically validates values and dimensions, calculates Need)
        system_state.initialize_state(
            num_processes=num_processes,
            num_resources=num_resources,
            available=available,
            max_matrix=max_matrix,
            alloc_matrix=alloc_matrix
        )
        
        # Calculate current safety and sequence on initialization
        is_safe, safe_seq = check_safety(
            system_state.available,
            system_state.max_matrix,
            system_state.alloc_matrix,
            system_state.need_matrix
        )
        system_state.set_safety_status(is_safe, safe_seq)

        return jsonify({
            "message": "System successfully initialized.",
            "state": system_state.to_dict()
        }), 200

    except ValueError as val_err:
        return jsonify({"error": str(val_err)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
