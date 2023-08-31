import java.util.InputMismatchException;

public class readDigits
{
    public static void getInteger(int low, int high)
            throws InputMismatchException {
        int number;
        String str = "";
        while (true) {
            try {
                String msg = "Zahl eingeben (" + low + "-" + high + "): ";
                str = javax.swing.JOptionPane.showInputDialog(msg);
                number = Integer.parseInt(str);
                System.out.println("n = " + number);
                break;
            } catch (NumberFormatException e) {
                System.err.println("'" + str + "' schmeckt mir nicht.");
            }
        }
        if (number < low || number > high) {
            throw new InputMismatchException("Zahl nicht im angegebenen Intervall!");
        }
        System.out.println("Die Zahl " + number + " war lecker!");
    }

    public static void main(String[] args)
    {
        while (true) {
            try {
                getInteger(0, 9);
                break;
            } catch (InputMismatchException e) {
                System.err.println("Bitte mehr Obacht bei der Eingabe.\nDer Fehler lautet:");
                e.printStackTrace();
            }
        }
    }
}
    
