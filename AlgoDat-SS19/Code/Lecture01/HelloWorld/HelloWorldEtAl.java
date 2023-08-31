legtclass HelloWorldEtAl
{
  public static void main(String[] args)
  {
    System.out.println("Hello World!");
    for (int k=0; k<args.length; k++)
      System.out.println("  ... and hello to " + args[k]);
  }
}
