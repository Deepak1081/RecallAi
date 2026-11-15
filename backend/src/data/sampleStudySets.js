/**
 * Pre-compiled, verified study sets for the 5 suggested topics.
 * Used for instant preview, offline testing, or when testing without an API key.
 */
export const SAMPLE_STUDY_SETS = {
  "Operating Systems": {
    flashcards: {
      title: "Operating Systems Fundamentals",
      type: "flashcards",
      flashcards: [
        {
          id: "os-card-1",
          question: "What is the primary difference between a process and a thread?",
          answer: "A process is an executing instance of a program with its own isolated memory space. A thread is a lightweight unit of execution within a process, sharing memory, code, and resources with peer threads.",
          explanation: "Processes provide strong isolation at the cost of heavier creation and context-switch overhead; threads offer rapid communication and concurrency at the cost of shared-memory race condition risks."
        },
        {
          id: "os-card-2",
          question: "What are the four necessary conditions for Deadlock (Coffman conditions)?",
          answer: "Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
          explanation: "Deadlock occurs only when all four conditions hold simultaneously. Preventing even one condition breaks the possibility of a deadlock."
        },
        {
          id: "os-card-3",
          question: "What is Virtual Memory and what mechanism enables it?",
          answer: "Virtual memory is a memory management technique that provides an " +
                  "illusion of a large contiguous memory space by mapping virtual addresses to physical RAM or secondary storage via Paging and Page Tables.",
          explanation: "It protects processes from accessing each other's memory and allows running programs that require more address space than physical RAM capacity."
        },
        {
          id: "os-card-4",
          question: "What is Thrashing in an operating system?",
          answer: "A state where the CPU spends more time swapping pages in and out of secondary storage than executing user instructions.",
          explanation: "Thrashing occurs when the collective working sets of active processes exceed physical RAM, causing continuous page faults."
        },
        {
          id: "os-card-5",
          question: "What is the role of the TLB (Translation Lookaside Buffer)?",
          answer: "A high-speed hardware cache in the CPU's MMU that stores recent virtual-to-physical address translations to accelerate memory access.",
          explanation: "Without a TLB, every memory reference requires multiple accesses to page tables in RAM, doubling or tripling memory latency."
        }
      ]
    },
    quiz: {
      title: "Operating Systems Mastery Quiz",
      type: "quiz",
      questions: [
        {
          id: "os-q-1",
          question: "Which CPU scheduling algorithm is completely free of starvation?",
          options: [
            "Round Robin (RR)",
            "Shortest Job First (SJF)",
            "Priority Scheduling",
            "Multi-Level Feedback Queue"
          ],
          correctAnswer: 0,
          explanation: "Round Robin allocates equal fixed time slices (quanta) in circular order, ensuring every runnable process gets CPU time without indefinite starvation."
        },
        {
          id: "os-q-2",
          question: "What happens during a context switch?",
          options: [
            "The OS compiles user source code into machine instructions",
            "The CPU state (registers, program counter, stack pointer) of the current process is saved, and another process's state is restored",
            "Physical RAM is formatted to prevent data corruption",
            "The filesystem re-indexes directory structures"
          ],
          correctAnswer: 1,
          explanation: "A context switch preserves the exact operational state of the preempted process in its PCB (Process Control Block) so it can resume seamlessly later."
        },
        {
          id: "os-q-3",
          question: "What is a Race Condition?",
          options: [
            "When two CPU cores compete for clock frequency boosts",
            "A scenario where multiple threads access shared data concurrently and the final result depends on the order of execution",
            "When memory allocation exceeds available swap space",
            "An optimization where network packets race to reach destination first"
          ],
          correctAnswer: 1,
          explanation: "Race conditions arise when unsynchronized threads read and write shared state without atomic guards, leading to non-deterministic bugs."
        },
        {
          id: "os-q-4",
          question: "Which page replacement policy suffers from Belady's Anomaly?",
          options: [
            "FIFO (First-In, First-Out)",
            "LRU (Least Recently Used)",
            "Optimal Replacement (OPT)",
            "LFU (Least Frequently Used)"
          ],
          correctAnswer: 0,
          explanation: "Belady's Anomaly is the counter-intuitive phenomenon where increasing the number of page frames results in more page faults, affecting FIFO."
        },
        {
          id: "os-q-5",
          question: "What is the purpose of the Banker's Algorithm in operating systems?",
          options: [
            "To calculate monetary costs of cloud compute clusters",
            "Deadlock Avoidance by safely evaluating resource allocations before granting requests",
            "To compress inactive memory pages into disk blocks",
            "To balance network routing queues across switches"
          ],
          correctAnswer: 1,
          explanation: "Dijkstra's Banker's Algorithm tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources."
        }
      ]
    }
  },
  "Database Management Systems": {
    flashcards: {
      title: "DBMS Core Concepts",
      type: "flashcards",
      flashcards: [
        {
          id: "db-card-1",
          question: "What are the ACID properties in database transactions?",
          answer: "Atomicity (all or nothing), Consistency (preserves schema constraints), Isolation (concurrent transactions execute independently), and Durability (committed changes persist).",
          explanation: "ACID guarantees transactional integrity in relational database systems even during power failures or software crashes."
        },
        {
          id: "db-card-2",
          question: "Why do relational databases commonly use B+ Trees for indexes instead of Binary Search Trees?",
          answer: "B+ Trees have high fan-out (low tree depth), keeping disk I/O operations minimal. All data pointers are in leaf nodes, which are linked sequentially for rapid range queries.",
          explanation: "Disk I/O is the primary bottleneck in databases; B+ Trees store hundreds of keys per node to fit whole disk blocks."
        },
        {
          id: "db-card-3",
          question: "What is the key difference between Clustered and Non-Clustered Indexes?",
          answer: "A clustered index determines the physical storage order of table rows (only 1 per table). A non-clustered index stores a separate sorted structure pointing to the physical row locations.",
          explanation: "Clustered indexes are fastest for primary key range scans, while non-clustered indexes allow secondary lookups without reordering table storage."
        },
        {
          id: "db-card-4",
          question: "What is 3NF (Third Normal Form)?",
          answer: "A relation is in 3NF if it is in 2NF and has no transitive dependencies: every non-prime attribute must depend directly on the primary key, and nothing but the key.",
          explanation: "Normalization eliminates data redundancy and prevents update, insertion, and deletion anomalies."
        },
        {
          id: "db-card-5",
          question: "What is Write-Ahead Logging (WAL)?",
          answer: "A technique where changes are first recorded to a persistent log on disk before being applied to the actual database pages in RAM or disk.",
          explanation: "WAL ensures Durability and Atomicity; if the system crashes midway, the log allows replaying committed transactions (REDO) and rolling back uncommitted ones (UNDO)."
        }
      ]
    },
    quiz: {
      title: "DBMS Architecture Quiz",
      type: "quiz",
      questions: [
        {
          id: "db-q-1",
          question: "In the ANSI-SPARC database architecture, which level describes how data is physically stored on disks?",
          options: [
            "Internal (Physical) Level",
            "Conceptual (Logical) Level",
            "External (View) Level",
            "Network Transport Level"
          ],
          correctAnswer: 0,
          explanation: "The Internal Level defines data structures, file organizations, indexes, and storage allocation on hardware."
        },
        {
          id: "db-q-2",
          question: "Which Isolation Level prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads?",
          options: [
            "Serializable",
            "Read Committed",
            "Repeatable Read",
            "Read Uncommitted"
          ],
          correctAnswer: 0,
          explanation: "Serializable is the highest isolation level in SQL-92, providing the strict guarantee that transactions execute as if strictly serialized."
        },
        {
          id: "db-q-3",
          question: "What is the CAP Theorem trade-off in distributed data stores?",
          options: [
            "Under a network partition, a distributed system must choose between Consistency and Availability",
            "Databases must choose between Cost, Architecture, and Performance",
            "Queries must balance Concurrency, Aggregation, and Paging",
            "Caches must trade off Capacity, Allocation, and Persistence"
          ],
          correctAnswer: 0,
          explanation: "Brewer's CAP theorem proves that when network partitions (P) occur, a system cannot simultaneously guarantee total Consistency (C) and Availability (A)."
        },
        {
          id: "db-q-4",
          question: "What is the primary operational purpose of database Sharding?",
          options: [
            "Horizontal partitioning of database rows across multiple independent servers to scale throughput and storage",
            "Compressing table indexes to fit within RAM cache",
            "Encrypting tables with public key certificates",
            "Creating read-only views for reporting dashboards"
          ],
          correctAnswer: 0,
          explanation: "Sharding breaks large datasets across multiple database nodes, allowing horizontal scaling beyond single-machine hardware limits."
        },
        {
          id: "db-q-5",
          question: "What type of join returns all rows from the left table and matched rows from the right table, filling nulls if no match?",
          options: [
            "LEFT OUTER JOIN",
            "INNER JOIN",
            "CROSS JOIN",
            "NATURAL JOIN"
          ],
          correctAnswer: 0,
          explanation: "A LEFT OUTER JOIN preserves every row from the left table regardless of whether a matching record exists in the right table."
        }
      ]
    }
  },
  "Machine Learning": {
    flashcards: {
      title: "Machine Learning Fundamentals",
      type: "flashcards",
      flashcards: [
        {
          id: "ml-card-1",
          question: "What is the Bias-Variance Tradeoff?",
          answer: "Bias is error from erroneous assumptions in the model (underfitting). Variance is error from sensitivity to fluctuations in training data (overfitting). Optimal model generalization requires balancing both.",
          explanation: "High bias models oversimplify relationships; high variance models capture random noise instead of underlying distribution."
        },
        {
          id: "ml-card-2",
          question: "What is Gradient Descent and what is the role of the Learning Rate?",
          answer: "Gradient Descent is an optimization algorithm that iteratively minimizes a loss function by updating parameters in the opposite direction of the gradient. The learning rate determines step size.",
          explanation: "Too large a learning rate causes divergence or oscillation; too small causes slow convergence or getting trapped in local plateaus."
        },
        {
          id: "ml-card-3",
          question: "What is the difference between L1 (Lasso) and L2 (Ridge) Regularization?",
          answer: "L1 adds the absolute value of coefficients (|w|) as a penalty, driving irrelevant weights to exactly zero (feature selection). L2 adds the squared magnitude (w²), shrinking weights smoothly.",
          explanation: "L1 induces sparsity which is useful for interpretability, while L2 handles multicollinearity and prevents weights from exploding."
        },
        {
          id: "ml-card-4",
          question: "What is the vanishing gradient problem in deep networks?",
          answer: "During backpropagation, gradients shrink exponentially as they are multiplied through multiple layers using saturating activation functions (like sigmoid), preventing early layers from learning.",
          explanation: "Modern architectures use non-saturating activations like ReLU, residual connections (ResNet), and normalization (LayerNorm/BatchNorm) to resolve it."
        },
        {
          id: "ml-card-5",
          question: "What does ROC-AUC measure in classification models?",
          answer: "Receiver Operating Characteristic - Area Under Curve measures the model's ability to discriminate between positive and negative classes across all classification thresholds.",
          explanation: "An AUC of 1.0 represents a perfect classifier; an AUC of 0.5 represents performance equivalent to random guessing, regardless of class imbalance."
        }
      ]
    },
    quiz: {
      title: "Machine Learning Evaluation Quiz",
      type: "quiz",
      questions: [
        {
          id: "ml-q-1",
          question: "In an imbalanced medical diagnosis dataset where detecting sick patients is vital, which metric should be prioritized?",
          options: [
            "Recall (Sensitivity)",
            "Accuracy",
            "Specificity",
            "Negative Predictive Value"
          ],
          correctAnswer: 0,
          explanation: "Recall measures the proportion of actual sick patients correctly identified: minimizing false negatives is critical in medical diagnosis."
        },
        {
          id: "ml-q-2",
          question: "What is the primary mechanism behind the Transformer architecture (Vaswani et al.)?",
          options: [
            "Self-Attention mechanism calculating dynamic relationship weights between all tokens in a sequence",
            "Recurrent hidden state propagation with gating units",
            "Dilated convolutions across fixed receptive fields",
            "Markov Decision Processes with value iteration"
          ],
          correctAnswer: 0,
          explanation: "Transformers replace sequential recurrent steps with multi-head self-attention, enabling massive parallelization and long-range dependency capture."
        },
        {
          id: "ml-q-3",
          question: "Which of the following techniques prevents overfitting in Decision Trees?",
          options: [
            "Cost-complexity pruning (pruning subtrees) and limiting max depth",
            "Increasing the number of features arbitrarily",
            "Allowing leaf nodes to reach pure splits of 1 sample",
            "Disabling cross-validation"
          ],
          correctAnswer: 0,
          explanation: "Unconstrained decision trees will grow until every sample is isolated; pruning and setting max_depth bounds tree complexity."
        },
        {
          id: "ml-q-4",
          question: "What is Cross-Entropy Loss commonly used for?",
          options: [
            "Measuring the difference between predicted probability distributions and true categorical labels",
            "Calculating Euclidean distance between clustered vectors",
            "Minimizing mean squared residual errors in linear regression",
            "Optimizing tree split thresholds in random forests"
          ],
          correctAnswer: 0,
          explanation: "Cross-Entropy heavily penalizes confident wrong predictions, making it the standard loss function for classification models."
        },
        {
          id: "ml-q-5",
          question: "What does k-Fold Cross Validation prevent?",
          options: [
            "Evaluation bias and optimistic performance estimates from a single lucky train/test split",
            "Model parameters from reaching numerical overflow",
            "Gradient explosion during recurrent backpropagation",
            "Label noise in uncurated web scrapes"
          ],
          correctAnswer: 0,
          explanation: "k-Fold partitions data into k equal folds, training on k-1 and validating on the remaining fold k times to evaluate generalization reliability."
        }
      ]
    }
  },
  "Computer Networks": {
    flashcards: {
      title: "Computer Networks & Protocols",
      type: "flashcards",
      flashcards: [
        {
          id: "cn-card-1",
          question: "What are the 7 layers of the OSI model from bottom to top?",
          answer: "1. Physical, 2. Data Link, 3. Network, 4. Transport, 5. Session, 6. Presentation, 7. Application.",
          explanation: "Mnemonic: 'Please Do Not Throw Sausage Pizza Away'. Each layer provides services to the layer above through well-defined interfaces."
        },
        {
          id: "cn-card-2",
          question: "What is the TCP 3-Way Handshake?",
          answer: "SYN (client sends Synchronize packet) -> SYN-ACK (server acknowledges and sends its own sequence) -> ACK (client acknowledges). Connection established.",
          explanation: "The handshake synchronizes initial sequence numbers (ISNs) and ensures both endpoints are ready for bidirectional reliable transmission."
        },
        {
          id: "cn-card-3",
          question: "How does DNS resolve a domain name into an IP address?",
          answer: "Recursive resolver queries Root DNS -> TLD DNS (.com) -> Authoritative Nameserver, returning the IP address (A/AAAA record) to the client.",
          explanation: "DNS caching at browser, OS, and ISP resolver levels ensures that common queries do not traverse the full hierarchy every time."
        },
        {
          id: "cn-card-4",
          question: "What is the difference between TCP and UDP?",
          answer: "TCP is connection-oriented, reliable, ordered, and flow-controlled (overhead). UDP is connectionless, lightweight, unordered, with no retransmission guarantees.",
          explanation: "TCP is chosen for web pages, APIs, and file transfers; UDP powers real-time voice, video streaming, and online gaming where low latency beats packet loss."
        },
        {
          id: "cn-card-5",
          question: "What is the purpose of NAT (Network Address Translation)?",
          answer: "Maps multiple private IP addresses in a local network to a single public IP address using distinct port numbers (PAT).",
          explanation: "NAT solved IPv4 exhaustion by allowing thousands of office or home devices to share one public IP address assigned by the ISP."
        }
      ]
    },
    quiz: {
      title: "Networking Protocols Quiz",
      type: "quiz",
      questions: [
        {
          id: "cn-q-1",
          question: "Which protocol operates at the Transport layer to provide reliable, ordered byte streams?",
          options: [
            "TCP (Transmission Control Protocol)",
            "IP (Internet Protocol)",
            "ARP (Address Resolution Protocol)",
            "BGP (Border Gateway Protocol)"
          ],
          correctAnswer: 0,
          explanation: "TCP handles segmentation, packet ordering, checksum verification, acknowledgments, and congestion control."
        },
        {
          id: "cn-q-2",
          question: "What is the function of the ARP (Address Resolution Protocol)?",
          options: [
            "Resolving a known IPv4 address to its corresponding Layer 2 MAC address on a local network",
            "Translating domain names into IP addresses",
            "Assigning dynamic IP addresses to DHCP clients",
            "Encrypting TLS socket connections"
          ],
          correctAnswer: 0,
          explanation: "Routers and switches need physical MAC addresses to frame packets onto Ethernet wires; ARP broadcasts an inquiry to find the owner of an IP."
        },
        {
          id: "cn-q-3",
          question: "What protocol does the 'ping' command use to test network reachability?",
          options: [
            "ICMP (Internet Control Message Protocol)",
            "IGMP (Internet Group Management Protocol)",
            "SNMP (Simple Network Management Protocol)",
            "RIP (Routing Information Protocol)"
          ],
          correctAnswer: 0,
          explanation: "Ping sends ICMP Echo Request packets and listens for ICMP Echo Reply packets from the destination."
        },
        {
          id: "cn-q-4",
          question: "In TCP congestion control, what happens immediately after a packet timeout (loss)?",
          options: [
            "Congestion Window (cwnd) drops to 1 MSS and slow start restarts",
            "Cwnd is multiplied by 2",
            "Connection is permanently aborted",
            "The router forwards packets through alternative VPN tunnels"
          ],
          correctAnswer: 0,
          explanation: "On timeout loss, TCP Tahoe/Reno assumes severe congestion, resets cwnd to 1 maximum segment size, and enters Slow Start."
        },
        {
          id: "cn-q-5",
          question: "What port does HTTPS use by default?",
          options: [
            "443",
            "80",
            "8080",
            "22"
          ],
          correctAnswer: 0,
          explanation: "Port 443 is assigned by IANA for HTTP over TLS/SSL (HTTPS); unencrypted HTTP uses port 80."
        }
      ]
    }
  },
  "Data Structures and Algorithms": {
    flashcards: {
      title: "Data Structures & Algorithms Essentials",
      type: "flashcards",
      flashcards: [
        {
          id: "dsa-card-1",
          question: "What is the time complexity of searching in a balanced Binary Search Tree (AVL / Red-Black)?",
          answer: "O(log n) for average and worst cases.",
          explanation: "Balancing guarantees that tree height remains logarithmic relative to node count, preventing degradation into an O(n) linked list."
        },
        {
          id: "dsa-card-2",
          question: "How do Hash Tables achieve average O(1) time complexity for lookup and insert?",
          answer: "A hash function maps keys directly to array bucket indices. Good hash functions distribute keys uniformly, minimizing collision chains.",
          explanation: "In worst cases where all keys hash to the same bucket, lookups degrade to O(n) unless balanced bucket trees are used."
        },
        {
          id: "dsa-card-3",
          question: "What is the core difference between BFS (Breadth-First Search) and DFS (Depth-First Search)?",
          answer: "BFS traverses level by level using a Queue (FIFO), finding the shortest path in unweighted graphs. DFS explores deeply down branches using a Stack or recursion (LIFO).",
          explanation: "BFS memory complexity is O(V) due to tracking frontiers, while DFS memory is bounded by the max recursion depth O(H)."
        },
        {
          id: "dsa-card-4",
          question: "What are the two key properties required for Dynamic Programming to apply?",
          answer: "1. Optimal Substructure (optimal solution to the problem contains optimal solutions to subproblems), and 2. Overlapping Subproblems (the same subproblems are solved repeatedly).",
          explanation: "Memoization (top-down) or tabulation (bottom-up) stores computed subproblem solutions to prevent exponential recomputations."
        },
        {
          id: "dsa-card-5",
          question: "What is Dijkstra's algorithm used for and why does it require non-negative edge weights?",
          answer: "Finds shortest paths from a source to all vertices in a weighted graph using a Min-Heap. Negative weights break its greedy assumption that once a node is finalized, its shortest distance cannot decrease.",
          explanation: "For graphs with negative edges, the Bellman-Ford algorithm (O(V*E)) or Floyd-Warshall must be used instead."
        }
      ]
    },
    quiz: {
      title: "DSA Performance Quiz",
      type: "quiz",
      questions: [
        {
          id: "dsa-q-1",
          question: "What is the worst-case time complexity of standard QuickSort with poor pivot selection?",
          options: [
            "O(n²)",
            "O(n log n)",
            "O(n)",
            "O(log n)"
          ],
          correctAnswer: 0,
          explanation: "If the smallest or largest element is consistently picked as the pivot (e.g. sorted array with first element as pivot), the recursion tree becomes depth n, resulting in O(n²)."
        },
        {
          id: "dsa-q-2",
          question: "Which sorting algorithm is guaranteed O(n log n) in all cases, stable, and uses O(n) auxiliary space?",
          options: [
            "Merge Sort",
            "Heap Sort",
            "Selection Sort",
            "Quick Sort"
          ],
          correctAnswer: 0,
          explanation: "Merge Sort repeatedly divides arrays into halves and merges sorted sub-arrays, guaranteeing stability and O(n log n) worst-case performance."
        },
        {
          id: "dsa-q-3",
          question: "What data structure is optimal for implementing a LRF (Least Recently Used) Cache?",
          options: [
            "Hash Map combined with a Doubly Linked List",
            "Binary Min-Heap",
            "Sorted Dynamic Array",
            "Trie"
          ],
          correctAnswer: 0,
          explanation: "The Hash Map gives O(1) key lookups; the Doubly Linked List gives O(1) node removal and insertion at head/tail to track access order."
        },
        {
          id: "dsa-q-4",
          question: "What is the space complexity of searching a graph using DFS with maximum path depth h?",
          options: [
            "O(h)",
            "O(2^h)",
            "O(n²)",
            "O(1)"
          ],
          correctAnswer: 0,
          explanation: "The call stack in DFS only holds nodes along the current branch being explored, which equals the height h."
        },
        {
          id: "dsa-q-5",
          question: "In a binary min-heap with n elements, what is the time complexity of extracting the minimum element?",
          options: [
            "O(log n)",
            "O(1)",
            "O(n)",
            "O(n log n)"
          ],
          correctAnswer: 0,
          explanation: "Reading the min element at root is O(1), but restoring the heap invariant by bubbling the last element down (heapify-down) takes O(log n)."
        }
      ]
    }
  }
};
