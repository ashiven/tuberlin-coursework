import java.lang.reflect.Array;
import java.util.*;

public class Maze {
    private final int N;
    private Graph M;
    public int startnode;

    public Maze(int N, int startnode) {

        if (N < 0)
            throw new IllegalArgumentException("Number of vertices in a row must be nonnegative");
        this.N = N;
        this.M = new Graph(N * N);
        this.startnode = startnode;
        buildMaze();
    }

    public Maze(In in) {
        this.M = new Graph(in);
        this.N = (int) Math.sqrt(M.V());
        this.startnode = 0;
    }

    /**
     * Adds the undirected edge v-w to the graph M.
     *
     * @param v one vertex in the edge
     * @param w the other vertex in the edge
     * @throws IllegalArgumentException unless both {@code 0 <= v < V} and
     *                                  {@code 0 <= w < V}
     */
    public void addEdge(int v, int w) {
        this.M.addEdge(v, w);
    }

    /**
     * Returns true if there is an edge between 'v' and 'w'
     * 
     * @param v
     * @param w
     * @return true or false
     */
    public boolean hasEdge(int v, int w) {
        if (this.M.adj(v).contains(w) || this.M.adj(w).contains(v) || this.M.adj(v).contains(v)
                || this.M.adj(w).contains(w)) {
            return true;
        }
        return false;
    }

    /**
     * Builds a grid as a graph.
     * 
     * @return Graph G -- Basic grid on which the Maze is built
     */
    public Graph mazegrid() {
        Graph G = new Graph(this.N * this.N);

        for (int j = 0; j < this.N; j++) {
            for (int i = 0; i < this.N - 1; i++) {
                G.addEdge(i + j * this.N, i + j * this.N + 1);
            }
        }

        for (int i = 0; i < this.N; i++) {
            for (int j = 0; j <= this.N * this.N - (2 * this.N); j = j + this.N) {
                G.addEdge(i + j, i + j + this.N);
            }
        }

        return G;
    }

    private void buildMaze() {
        Graph G = mazegrid();
        RandomDepthFirstPaths Path = new RandomDepthFirstPaths(G, 0);
        Path.randomDFS(G);
        for (int i = 1; i < Path.edge().length; i++) {
            this.M.adj(Path.edge()[i]).add(i);
        }
    }

    public List<Integer> findWay(int v, int w) {
        DepthFirstPaths Find = new DepthFirstPaths(this.M, v);
        Find.dfs(this.M);
        return Find.pathTo(w);
    }

    public Graph M() {
        return M;
    }

    public static void main(String[] args) {
        /*
         * Maze m = new Maze(4,0);
         * 
         * DepthFirstPaths Find = new DepthFirstPaths(m.M, 0);
         * Find.dfs(m.M);
         * ArrayList path = (ArrayList)Find.pathTo(15);
         * 
         * Graph g = m.M();
         * System.out.println(g);
         * for (int i=0;i<path.size();i++) {
         * System.out.print(path.get(i)+" ");
         * }
         * System.out.println();
         * for (int i=0;i<Find.edge().length;i++) {
         * System.out.print(Find.edge()[i]+" ");
         * }
         * Graph g = new Graph(9);
         * g.addEdge(0,1);
         * g.addEdge(1,2);
         * g.addEdge(1,3);
         * g.addEdge(2,4);
         * g.addEdge(3,5);
         * g.addEdge(4,6);
         * g.addEdge(4,7);
         * g.addEdge(6,8);
         * g.addEdge(7,8);
         * g.addEdge(5,8);
         * DepthFirstPaths d1 = new DepthFirstPaths(g, 0);
         * DepthFirstPaths d2 = new DepthFirstPaths(g, 0);
         * d1.dfs(g);
         * d2.nonrecursiveDFS(g);
         * System.out.print(g);
         * LinkedList<Integer> pred1 = (LinkedList)d1.pre();
         * LinkedList<Integer> pred2 = (LinkedList)d2.pre();
         * LinkedList<Integer> postd1 = (LinkedList)d1.post();
         * LinkedList<Integer> postd2 = (LinkedList)d2.post();
         * for(int i=0;i<d1.post().size();i++) {
         * System.out.print(postd1.get(i)+" ");
         * }
         * System.out.println("\n");
         * for(int i=0;i<d2.post().size();i++) {
         * System.out.print(postd2.get(i)+" ");
         * }
         * System.out.println("\n");
         * for(int i=0;i<d1.pre().size();i++) {
         * System.out.print(pred1.get(i)+" ");
         * }
         * System.out.println("\n");
         * for(int i=0;i<d2.pre().size();i++) {
         * System.out.print(pred2.get(i)+" ");
         * }
         */
        Maze m = new Maze(20, 0);
        GridGraph g = new GridGraph(m.M());
        g.plot(m.findWay(0, 399), 0);
        StdDraw.pause(10000);
    }

}
