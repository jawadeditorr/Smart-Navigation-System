#include <iostream>
#include <string>
#include <climits>
#include <algorithm>
#include <vector>
#include <queue>
#include <list>
using namespace std;

class Graph{
    int V;

    list<pair<int,int>> *l;

public:

    Graph(int V){
        this->V = V;

        l = new list<pair<int,int>>[V];
    }

    void addEdge(int edge1, int edge2, int weight){

        l[edge1].push_back({edge2, weight});

        l[edge2].push_back({edge1, weight});
    }

    pair<int,vector<int>> dijkstra(int src, int goal){
        vector<int> dist (V, INT_MAX);
        vector<int> parent(V, -1);
        priority_queue<
            pair<int,int>,          //type of value
            vector<pair<int,int>>,  //container
            greater<pair<int,int>>  //comparator
        > pq;
        dist[src] = 0;
        pq.push({0,src});
        while (!pq.empty())
        {
            int currentDist = pq.top().first;
            int node = pq.top().second;
            pq.pop();
            if(currentDist > dist[node]) continue;
            if(node == goal){
                break;
            }
            for(auto nbr : l[node]){
                int adjNode = nbr.first;
                int weight = nbr.second;
                if(currentDist+weight<dist[adjNode]){
                    dist[adjNode] = currentDist+weight;
                    parent[adjNode] = node;
                    pq.push({dist[adjNode],adjNode});
                }
            }
        }
        int shortestDist = dist[goal];
        vector<int> path;

        for(int v = goal; v != -1; v = parent[v]){
            path.push_back(v);
        }

        reverse(path.begin(), path.end());

        return {shortestDist, path};
    }

    static Graph& getGraph() {
        static Graph g1(16);

        static bool built = false;
        if (!built) {
            built = true;

            g1.addEdge(0,2,180);
            g1.addEdge(0,3,340);
            g1.addEdge(0,4,130);
            g1.addEdge(0,5,75);

            g1.addEdge(5,1,220); // Added Gujranwala to Islamabad

            g1.addEdge(1,6,180);
            g1.addEdge(1,7,15);
            g1.addEdge(1,8,125);

            g1.addEdge(2,3,240);
            g1.addEdge(2,5,170);

            g1.addEdge(3,9,100);
            g1.addEdge(3,10,470);

            g1.addEdge(9,10,520);

            g1.addEdge(10,11,330);

            g1.addEdge(11,12,160);

            g1.addEdge(12,13,690);

            g1.addEdge(13,14,330);

            g1.addEdge(14,6,390);

            g1.addEdge(6,8,175);

            g1.addEdge(5,4,55);

            g1.addEdge(4,1,230);

            g1.addEdge(12,10,555);

            g1.addEdge(13,3,640);

            g1.addEdge(9,0,430);

            g1.addEdge(11,3,710);

            g1.addEdge(6,0,520);

            g1.addEdge(8,15,25);

            g1.addEdge(15,1,155);

            g1.addEdge(7,6,170);
        }

        return g1;
    }
    
    void display(){

        for(int i = 0; i < V; i++){

            cout << i << " : ";

            for(auto j : l[i]){

                cout << "(" << j.first
                     << "," << j.second << ") ";
            }

            cout << endl;
        }
    }
};

int main(int argc, char* argv[]){

    Graph &g1 = Graph::getGraph();
    string city[16] = {
        "Lahore",      // 0
        "Islamabad",   // 1
        "Faisalabad",  // 2
        "Multan",      // 3
        "Sialkot",     // 4
        "Gujranwala",  // 5
        "Peshawar",    // 6
        "Rawalpindi",  // 7
        "Abbottabad",  // 8
        "Bahawalpur",  // 9
        "Sukkur",      // 10
        "Hyderabad",   // 11
        "Karachi",     // 12
        "Quetta",      // 13
        "Zhob",        // 14
        "Mansehra"     // 15
    };

    int src = 0;
    int dest = 12;

    if (argc >= 3) {
        src = stoi(argv[1]);
        dest = stoi(argv[2]);
    }

    auto result = g1.dijkstra(src, dest);

    int distance = result.first;
    vector<int> path = result.second;

    cout << "Distance:" << distance << endl;
    cout << "Path:";
    for (int node : path) {
        cout << node << ",";
    }
    cout << endl;
    return 0;
}