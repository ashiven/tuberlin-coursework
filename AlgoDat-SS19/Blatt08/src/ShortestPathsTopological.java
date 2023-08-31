import java.util.Stack;

public class ShortestPathsTopological {
    private int[] parent;
    private int s;
    private double[] dist;

    public ShortestPathsTopological(WeightedDigraph G, int s) {
        this.s = s;
        this.parent = new int[G.V()];
        this.dist = new double[G.V()];

        for (int i = 0; i < G.V(); i++) {
            this.dist[i] = Integer.MAX_VALUE;
        }
        this.dist[s] = 0;

        TopologicalWD search = new TopologicalWD(G);
        search.dfs(s);

        Stack<Integer> order = search.order();
        while (!order.isEmpty()) {
            for (DirectedEdge w : G.incident(order.peek())) {
                relax(w);
            }
            /*
             * while(G.incident(order.peek()).iterator().hasNext()) {
             * relax(G.incident(order.peek()).iterator().next());
             * }
             */
            order.pop();
        }
    }

    public void relax(DirectedEdge e) {
        int v = e.from();
        int w = e.to();
        if (dist[w] > dist[v] + e.weight()) {
            parent[w] = v;
            dist[w] = dist[v] + e.weight();
        }
    }

    public boolean hasPathTo(int v) {
        return parent[v] >= 0;
    }

    public Stack<Integer> pathTo(int v) {
        if (!hasPathTo(v)) {
            return null;
        }
        Stack<Integer> path = new Stack<>();
        for (int w = v; w != s; w = parent[w]) {
            path.push(w);
        }
        path.push(s);
        return path;
    }
}
