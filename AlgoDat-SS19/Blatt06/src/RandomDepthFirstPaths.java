import java.util.*;

public class RandomDepthFirstPaths {
    private boolean[] marked; // marked[v] = is there an s-v path?
    private int[] edgeTo; // edgeTo[v] = last edge on s-v path
    private final int s; // source vertex

    public RandomDepthFirstPaths(Graph G, int s) {
        this.s = s;
        edgeTo = new int[G.V()];
        marked = new boolean[G.V()];
        validateVertex(s);
    }

    public void randomDFS(Graph G) {
        randomDFS(G, s);
    }

    // depth first search from v
    private void randomDFS(Graph G, int v) {
        marked[v] = true;
        Collections.shuffle(G.adj(v));
        for (int w : G.adj(v)) {
            if (!marked[w]) {
                this.edgeTo[w] = v;
                randomDFS(G, w);
            }
        }
    }

    public void randomNonrecursiveDFS(Graph G) {
        marked = new boolean[G.V()];
        Iterator<Integer>[] adj = (Iterator<Integer>[]) new Iterator[G.V()];
        for (int v = 0; v < G.V(); v++)
            adj[v] = G.adj(v).iterator();

        Stack<Integer> stack = new Stack<Integer>();
        marked[s] = true;
        stack.push(s);
        while (!stack.isEmpty()) {
            int v = stack.peek();
            ArrayList<Integer> shuffle = new ArrayList<Integer>();
            while (adj[v].hasNext()) {
                shuffle.add(adj[v].next());
            }
            Collections.shuffle(shuffle);
            adj[v] = shuffle.iterator();
            if (adj[v].hasNext()) {
                int w = adj[v].next();
                if (!marked[w]) {
                    marked[w] = true;
                    stack.push(w);
                    this.edgeTo[w] = v;
                }
            } else {
                stack.pop();
            }
        }
    }

    /**
     * Is there a path between the source vertex {@code s} and vertex {@code v}?
     * 
     * @param v the vertex
     * @return {@code true} if there is a path, {@code false} otherwise
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     */
    public boolean hasPathTo(int v) {
        validateVertex(v);
        return marked[v];
    }

    /**
     * Returns a path between the source vertex {@code s} and vertex {@code v}, or
     * {@code null} if no such path.
     * 
     * @param v the vertex
     * @return the sequence of vertices on a path between the source vertex
     *         {@code s} and vertex {@code v}, as an Iterable
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     * 
     *                                  This method is different compared to the
     *                                  original one.
     */
    public List<Integer> pathTo(int v) {
        if (!hasPathTo(v)) {
            return null;
        }
        ArrayList<Integer> path = new ArrayList<>();
        Stack<Integer> reverse = new Stack();
        reverse.push(v);
        int i = v;
        while (i > this.s) {
            reverse.push(this.edgeTo[i]);
            i = this.edgeTo[i];
        }
        while (!reverse.isEmpty()) {
            path.add(reverse.pop());
        }
        return path;
    }

    public int[] edge() {
        return edgeTo;
    }

    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    private void validateVertex(int v) {
        int V = marked.length;
        if (v < 0 || v >= V)
            throw new IllegalArgumentException("vertex " + v + " is not between 0 and " + (V - 1));
    }

}
