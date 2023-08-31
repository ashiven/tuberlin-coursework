import java.util.Stack;

public class ContentAwareImageResizing {
    public int sx, sy;
    public Image image;

    public ContentAwareImageResizing(Image image) {
        sx = image.sizeX();
        sy = image.sizeY();
        this.image = image;
    }

    // convert (x,y) pixel coordinate into index of node in the graph
    public int coordinateToNode(int x, int y) {
        return x + y * sx;
    }

    // convert pixel coordinate into index of node in the graph
    public int coordinateToNode(Coordinate p) {
        return coordinateToNode(p.x, p.y);
    }

    // convert index of node in the graph to a pixel coordinate
    public Coordinate nodeToCoordinate(int v) {
        int y = v / sx;
        return new Coordinate(v - y * sx, y);
    }

    // build up a grid graph for representing an image with contrast values as
    // weights
    // add auxiliary source and target node
    // see figure 4 on the exercises sheet
    public WeightedDigraph makeVGraph() {
        WeightedDigraph graph = new WeightedDigraph(sx * sy + 2);
        final int delta = 1;
        for (int y = 1; y < sy; y++) {
            for (int x = 0; x < sx; x++) {
                Coordinate pFrom = new Coordinate(x, y - 1);
                int vFrom = coordinateToNode(pFrom);
                for (int d = -delta; d <= delta; d++) {
                    if (x + d >= 0 && x + d < sx) {
                        Coordinate pTo = new Coordinate(x + d, y);
                        int vTo = coordinateToNode(pTo);
                        graph.addEdge(vFrom, vTo, image.contrast(pFrom, pTo));
                    }
                }
            }
        }
        int vSource = sx * sy;
        int vTarget = sx * sy + 1;
        for (int x = 0; x < sx; x++) {
            int vTo = coordinateToNode(x, 0);
            graph.addEdge(vSource, vTo, 0);
            int vFrom = coordinateToNode(x, sy - 1);
            graph.addEdge(vFrom, vTarget, 0);
        }
        return graph;
    }

    public int[] leastContrastImageVPath() {
        WeightedDigraph g = this.makeVGraph();
        ShortestPathsTopological search = new ShortestPathsTopological(g, sx * sy);

        Stack<Integer> pathstack = search.pathTo((sx * sy) + 1);
        int[] path = new int[pathstack.size() - 2];

        pathstack.pop();
        int length = pathstack.size() - 1;
        for (int i = 0; i < length; i++) {
            path[i] = nodeToCoordinate(pathstack.pop()).x;
        }

        return path;
    }

    public void removeVPath(int[] path) {
        image.removeVPath(path);
        sx--;
    }

    public static void demoMatrixImage(String filename) throws java.io.FileNotFoundException {
        MatrixImage image = new MatrixImage(filename);
        ContentAwareImageResizing cair = new ContentAwareImageResizing(image);
        System.out.println("Original:");
        image.render();
        for (int k = 0; k < 2; k++) {
            cair.removeVPath(cair.leastContrastImageVPath());
            System.out.println("After removing one path:");
            image.render();
        }
    }

    public static void demoPictureImage(String filename) {
        PictureImage image = new PictureImage(filename);
        ContentAwareImageResizing cair = new ContentAwareImageResizing(image);
        int nDeletions = image.sizeX() / 2;
        for (int k = 0; k < nDeletions; k++) {
            System.out.println("removing path " + k);
            cair.removeVPath(cair.leastContrastImageVPath());
            image.render();
        }
    }

    public static void main(String[] args) throws java.io.FileNotFoundException {
        // demoPictureImage(args[0]);
        // demoPictureImage("640px-Broadway_tower_edit.jpg");
        demoPictureImage("src/640px-foto_2017_07_30_202914-cropped.jpg");
        // demoMatrixImage("src/testImage.txt");
    }
}
