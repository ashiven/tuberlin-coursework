import static java.lang.Math.log;

public class TwoSum
{
  public static int count(int[] a)
  {
    int N = a.length;
    int counter = 0;
    for (int i = 0; i < N; i++)
      for (int j = i+1; j < N; j++)
        if (a[i] + a[j] == 0)
          counter++;
    
    return counter;
  }

  public static int[] randomSample(int N) {
    int[] a = new int[N];
    for (int i = 0; i < N ; i++)
      a[i]= -10000 + (int)(20000*Math.random());
    return a;
  }

  public static void main(String[] args)
  {
    int N1 =  50000;
    int N2 = 100000;

    int[] a = randomSample(N1);
    long start = System.nanoTime();
    int counter = count(a);
    long duration1 = (System.nanoTime() - start) / 1000;
    System.out.println("Count: " + counter + " in " + duration1 / 1000 + " ms");

    a = randomSample(N2);
    start = System.nanoTime();
    counter = count(a);
    long duration2 = (System.nanoTime() - start) / 1000;
    System.out.println("Count: " + counter + " in " + duration2 / 1000 + " ms");

    /* Die Schätzung der Wachstumsordnung ist aus zwei Gründen ungenau:
       1) Die Laufzeit ist Daten-abhängig (wie oft counter++ ausgeführt wird)
       2) Hintergrundprozesse können die gemessene Ausführungszeit beeinträchtigen.
       Um Punkt 2) zu umgehen, kann man auch die Prozesszeit abrufen:
         ThreadMXBean bean = ManagementFactory.getThreadMXBean( );
         long start = bean.getCurrentThreadUserTime();
     */

    double orderOfGrowth = (log(duration2) - log(duration1)) / (log(N2) - log(N1));
    System.out.println(String.format("Estimated order of growth:  N^%.2f", orderOfGrowth));
  }
}
