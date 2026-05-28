# backend/models/system_state.py

class SystemState:
    def __init__(self):
        self.num_processes = 0
        self.num_resources = 0
        self.available = []        # 1D list: size = num_resources
        self.max_matrix = []       # 2D list: size = num_processes x num_resources
        self.alloc_matrix = []     # 2D list: size = num_processes x num_resources
        self.need_matrix = []      # 2D list: size = num_processes x num_resources
        self.safe_sequence = []    # List of process IDs that form a safe execution sequence
        self.is_safe = True        # Boolean indicating safety status

    def initialize_state(self, num_processes, num_resources, available, max_matrix, alloc_matrix):
        """
        Initializes state variables with validations.
        """
        # Validate values are non-negative
        if num_processes <= 0 or num_resources <= 0:
            raise ValueError("Number of processes and resources must be greater than zero.")
        
        # Check available vector
        if not isinstance(available, list) or len(available) != num_resources:
            raise ValueError(f"Available resources list size must match resources count: {num_resources}")
        if any(not isinstance(x, (int, float)) or x < 0 for x in available):
            raise ValueError("Available resources cannot contain negative values.")

        # Check Max matrix dimensions and elements
        if not isinstance(max_matrix, list) or len(max_matrix) != num_processes:
            raise ValueError(f"Max matrix row count must match processes count: {num_processes}")
        for r_idx, row in enumerate(max_matrix):
            if not isinstance(row, list) or len(row) != num_resources:
                raise ValueError(f"Max matrix row {r_idx} must match resources count: {num_resources}")
            if any(not isinstance(x, (int, float)) or x < 0 for x in row):
                raise ValueError("Max matrix cannot contain negative values.")

        # Check Allocation matrix dimensions and elements
        if not isinstance(alloc_matrix, list) or len(alloc_matrix) != num_processes:
            raise ValueError(f"Allocation matrix row count must match processes count: {num_processes}")
        for r_idx, row in enumerate(alloc_matrix):
            if not isinstance(row, list) or len(row) != num_resources:
                raise ValueError(f"Allocation matrix row {r_idx} must match resources count: {num_resources}")
            if any(not isinstance(x, (int, float)) or x < 0 for x in row):
                raise ValueError("Allocation matrix cannot contain negative values.")

        # Ensure Allocation doesn't exceed Max matrix for any process/resource
        for p in range(num_processes):
            for r in range(num_resources):
                if alloc_matrix[p][r] > max_matrix[p][r]:
                    raise ValueError(
                        f"Allocation cannot exceed Max matrix for Process P{p}, Resource R{r}. "
                        f"(Allocated: {alloc_matrix[p][r]}, Max: {max_matrix[p][r]})"
                    )

        # Set dimensions
        self.num_processes = num_processes
        self.num_resources = num_resources
        
        # Set matrices (cast to int for simplicity and cleanliness)
        self.available = [int(x) for x in available]
        self.max_matrix = [[int(x) for x in row] for row in max_matrix]
        self.alloc_matrix = [[int(x) for x in row] for row in alloc_matrix]
        
        # Auto-calculate the Need Matrix: Need = Max - Allocation
        self.calculate_need()
        
        # Default safety status
        self.safe_sequence = []
        self.is_safe = True

    def calculate_need(self):
        """
        Calculates the Need matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
        """
        self.need_matrix = []
        for i in range(self.num_processes):
            row = []
            for j in range(self.num_resources):
                need_val = self.max_matrix[i][j] - self.alloc_matrix[i][j]
                # Defensive check (should not be negative given Max >= Allocation verification)
                row.append(max(0, need_val))
            self.need_matrix.append(row)
        return self.need_matrix

    def update_allocation(self, process_id, request_vector):
        """
        Updates the Allocation and Available lists for a granted request.
        """
        if process_id < 0 or process_id >= self.num_processes:
            raise ValueError(f"Invalid process ID: {process_id}")
        if len(request_vector) != self.num_resources:
            raise ValueError(f"Request vector length must match resources count: {self.num_resources}")
        
        # Tentatively update available and allocation
        for r in range(self.num_resources):
            self.available[r] -= request_vector[r]
            self.alloc_matrix[process_id][r] += request_vector[r]
            
        # Re-calculate need matrix
        self.calculate_need()

    def set_safety_status(self, is_safe, safe_sequence):
        """
        Sets the current safety evaluation status and sequence path.
        """
        self.is_safe = bool(is_safe)
        self.safe_sequence = [int(p) for p in safe_sequence]

    def reset(self):
        """
        Resets the simulation to unitialized values.
        """
        self.num_processes = 0
        self.num_resources = 0
        self.available = []
        self.max_matrix = []
        self.alloc_matrix = []
        self.need_matrix = []
        self.safe_sequence = []
        self.is_safe = True

    def to_dict(self):
        """
        Returns a serializable dictionary representation of the state.
        """
        return {
            "num_processes": self.num_processes,
            "num_resources": self.num_resources,
            "available": self.available,
            "max_matrix": self.max_matrix,
            "alloc_matrix": self.alloc_matrix,
            "need_matrix": self.need_matrix,
            "safe_sequence": self.safe_sequence,
            "is_safe": self.is_safe
        }

# Singleton instance to hold system state
system_state = SystemState()
