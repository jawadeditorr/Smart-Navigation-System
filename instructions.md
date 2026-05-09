# Smart Navigation System (C++ Graph Project)

## 📌 Overview
This project is a Smart Navigation System built in C++ using Graph Theory and Dijkstra’s Algorithm. It models major cities of Pakistan as nodes and road connections as weighted edges (distance in km).

The system finds the shortest path and minimum distance between any two cities.

---

## ⚙️ How It Works

### 1. Graph Representation
- Each city is assigned a unique ID (0–15)
- Roads between cities are represented as weighted edges
- Weight = distance in kilometers

---

### 2. Algorithm Used
- Dijkstra’s Algorithm is used to find:
  - Shortest distance between two cities
  - Optimal path

---

### 3. Data Structure
- Adjacency List (using STL `list<pair<int,int>>`)
- Priority Queue (Min Heap) for optimization

---

### 4. Graph Initialization
- Graph is created using a Singleton pattern:
```cpp
Graph &g1 = Graph::getGraph();