# backend/banker.py

def check_safety(available, max_matrix, alloc_matrix, need_matrix):
    """
    Safety Algorithm of the Banker's Algorithm.
    Checks if the system is in a safe state and returns the safe sequence.
    
    Parameters:
    - available (list): Available resources of each type (1D list of size R)
    - max_matrix (list of lists): Maximum demand of each process (2D list of size P x R)
    - alloc_matrix (list of lists): Resources currently allocated to each process (2D list of size P x R)
    - need_matrix (list of lists): Remaining resources needed by each process (2D list of size P x R)
    
    Returns:
    - is_safe (bool): True if system is in a safe state, False otherwise
    - safe_sequence (list): Sequence of process indices showing a deadlock-free path, empty if unsafe
    """
    num_processes = len(alloc_matrix)
    num_resources = len(available)
    
    # Work vector: initialized to available resources
    work = list(available)
    
    # Finish vector: boolean list indicating if a process can complete (initially all False)
    finish = [False] * num_processes
    
    # List to store the deadlock-free sequence of execution
    safe_sequence = []
    
    # Loop to find processes that can run to completion
    for _ in range(num_processes):
        found_process = False
        
        for p in range(num_processes):
            # Check if this process is not yet finished and its need is <= current work resources
            if not finish[p]:
                # Verify if need[p][r] <= work[r] for all resources
                can_allocate = True
                for r in range(num_resources):
                    if need_matrix[p][r] > work[r]:
                        can_allocate = False
                        break
                
                # If we can satisfy the process's need
                if can_allocate:
                    # Assume process runs to completion, releases all its allocated resources back to work
                    for r in range(num_resources):
                        work[r] += alloc_matrix[p][r]
                    
                    # Mark process as finished and add to the safe execution sequence
                    finish[p] = True
                    safe_sequence.append(p)
                    found_process = True
                    break  # Break inner loop and restart search with updated work vector
        
        # If no process could be found in this pass, safety cannot be guaranteed (potential deadlock)
        if not found_process:
            break
            
    # If all processes are finished, system is in a safe state
    if len(safe_sequence) == num_processes:
        return True, safe_sequence
    else:
        # Otherwise, the system is in an unsafe state
        return False, []


def request_resources_algorithm(available, max_matrix, alloc_matrix, need_matrix, process_id, request_vector):
    """
    Resource Request Algorithm of the Banker's Algorithm.
    Determines if a resource request from a process can be granted immediately.
    
    Parameters:
    - available (list): Available resources of each type (1D list of size R)
    - max_matrix (list of lists): Maximum demand of each process (2D list of size P x R)
    - alloc_matrix (list of lists): Resources currently allocated to each process (2D list of size P x R)
    - need_matrix (list of lists): Remaining resources needed by each process (2D list of size P x R)
    - process_id (int): Index of the process making the request
    - request_vector (list): Requested amount of each resource type (1D list of size R)
    
    Returns:
    - granted (bool): True if the request is granted, False if denied
    - reason (str): Reason for granting or denying the request
    - safe_sequence (list): Safe sequence if granted, empty list if denied
    """
    num_resources = len(available)
    
    # 1. Check if Request <= Need
    for r in range(num_resources):
        if request_vector[r] > need_matrix[process_id][r]:
            return False, f"Request denied: Process P{process_id} requested {request_vector[r]} units of resource R{r}, which exceeds its declared remaining need of {need_matrix[process_id][r]}.", []

    # 2. Check if Request <= Available
    for r in range(num_resources):
        if request_vector[r] > available[r]:
            return False, f"Request denied: Process P{process_id} requested {request_vector[r]} units of resource R{r}, but only {available[r]} units are currently available. P{process_id} must wait.", []

    # 3. Simulate Allocation (Pre-allocation state check)
    # Create temporary copies of vectors/matrices to test safety
    temp_available = [available[r] - request_vector[r] for r in range(num_resources)]
    
    temp_alloc = [list(row) for row in alloc_matrix]
    for r in range(num_resources):
        temp_alloc[process_id][r] += request_vector[r]
        
    temp_need = [list(row) for row in need_matrix]
    for r in range(num_resources):
        temp_need[process_id][r] -= request_vector[r]

    # 4. Check Safety on pre-allocated state
    is_safe, safe_sequence = check_safety(temp_available, max_matrix, temp_alloc, temp_need)

    # 5. Return outcome based on safety check
    if is_safe:
        return True, f"Request granted: Granting resource request to Process P{process_id} leaves the system in a safe state.", safe_sequence
    else:
        return False, f"Request denied: Granting resource request to Process P{process_id} would leave the system in an unsafe state (potential deadlock). Rollback executed.", []
